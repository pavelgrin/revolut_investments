import {
    Type,
    Currency,
    Ticker,
    Transaction,
    SummaryItem,
    UrlQuery,
    Filter,
    GroupedTypes,
    TransactionDateType,
} from "./types"
import { roundAmount } from "../utils"

import {
    getTransactionDate,
    applyFilter,
    groupByType,
    copyTransactions,
    handleStockSplit,
} from "./prepare_data"
import { getBalance, getDividends, getCustodyFee } from "./calc_total"
import { getSellsSummary } from "./calc_sells_summary"
import { getTickerSummary } from "./calc_ticker_summary"

function getCommonReport(transactionByType: GroupedTypes) {
    const balance = getBalance(
        transactionByType[Type.TopUp],
        transactionByType[Type.Withdraw]
    )

    const dividends = getDividends(transactionByType[Type.Dividend])
    const custodyFee = getCustodyFee(transactionByType[Type.CustodyFee])

    const summaryFIFO: SummaryItem[] = getSellsSummary(
        copyTransactions(transactionByType[Type.Buy]),
        copyTransactions(transactionByType[Type.Sell])
    )

    const summaryLIFO: SummaryItem[] = getSellsSummary(
        copyTransactions(transactionByType[Type.Buy]).reverse(),
        copyTransactions(transactionByType[Type.Sell])
    )

    const totalFIFO = summaryFIFO.reduce((acc, sellRow) => {
        return roundAmount(acc + sellRow.pnl)
    }, 0)

    const totalLIFO = summaryLIFO.reduce((acc, sellRow) => {
        return roundAmount(acc + sellRow.pnl)
    }, 0)

    return {
        balance,
        dividends,
        custodyFee,
        totalFIFO,
        totalLIFO,
        summaryFIFO,
        summaryLIFO,
    }
}

function getTickerReport(transactionByType: GroupedTypes) {
    const dividends = getDividends(transactionByType[Type.Dividend])
    const summary = getTickerSummary(
        copyTransactions(transactionByType[Type.Buy]),
        copyTransactions(transactionByType[Type.Sell])
    )

    const sellsSummary: SummaryItem[] = getSellsSummary(
        copyTransactions(transactionByType[Type.Buy]).reverse(),
        copyTransactions(transactionByType[Type.Sell])
    )
    const pnlTotal = sellsSummary.reduce((acc, sellRow) => {
        return roundAmount(acc + sellRow.pnl)
    }, 0)

    return {
        dividends: dividends.amount,
        summary,
        pnlTotal,
        sellsSummary,
    }
}

export function handleStatement(statement: Transaction[], query: UrlQuery) {
    const filter: Filter = {
        from:
            query.from ||
            getTransactionDate(TransactionDateType.First, statement),
        to:
            query.to ||
            getTransactionDate(TransactionDateType.Latest, statement),
        symbol: query.symbol || null,
        currency: query.currency || Currency.USD,
    }

    const filteredTransactions = applyFilter(statement, filter)
    const transactionByType = handleStockSplit(
        groupByType(filteredTransactions)
    )

    return {
        from: filter.from,
        to: filter.to,
        symbol: filter.symbol,
        currency: filter.currency,
        ...(filter.symbol
            ? getTickerReport(transactionByType)
            : getCommonReport(transactionByType)),
    }
}
