import {
    Type,
    Currency,
    Ticker,
    Transaction,
    SummaryItem,
    RequestFilter,
    GroupedTypes,
    // GroupedTickers,
} from "../types"
import { roundAmount } from "../utils"

import {
    applyFilter,
    groupByType,
    groupByTicker,
    copyTransactions,
} from "./prepare_data"
import { getBalance, getDividends, getCustodyFee } from "./calc_total"
import { getSellsSummary } from "./calc_sells_summary"
import { getTickerSummary } from "./calc_ticker_summary"

function getCommonReport(
    transactionByType: GroupedTypes,
    activeTickers: [string, number][],
    currency: Currency
) {
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
        currency,
        activeTickers,
        balance,
        dividends,
        custodyFee,
        totalFIFO,
        totalLIFO,
        summaryFIFO,
        summaryLIFO,
    }
}

function getTickerReport(
    transactionByType: GroupedTypes,
    currency: Currency,
    symbol: Ticker
) {
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
        symbol,
        currency,
        dividends: dividends.amount,
        summary,
        pnlTotal,
        sellsSummary,
    }
}

export function handleStatement(
    statement: Transaction[],
    filter: RequestFilter
) {
    const filteredTransactions = applyFilter(statement, filter)
    const transactionByType = groupByType(filteredTransactions)
    const transactionByTicker = groupByTicker(filteredTransactions)

    const currency = filter.currency || Currency.USD

    const activeTickers = Object.entries(transactionByTicker).filter(
        ([_, quantity]) => {
            return Boolean(quantity)
        }
    )

    if (filter.symbol) {
        return getTickerReport(transactionByType, currency, filter.symbol)
    }

    return getCommonReport(transactionByType, activeTickers, currency)
}
