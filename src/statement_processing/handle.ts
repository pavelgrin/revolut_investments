import {
    Type,
    Transaction,
    SummaryItem,
    RequestFilter,
    Currency,
} from "../types"
import { roundAmount } from "../utils"

import { applyFilter, groupByType, copyTransactions } from "./prepare_data"

const DIVIDEND_TAX_RATE = 0.15

function getTotalAmount(transactions: Transaction[]) {
    return transactions.reduce((acc, transaction: Transaction) => {
        return roundAmount(acc + transaction.amount)
    }, 0)
}

function getBalance(deposits: Transaction[], withdrawals: Transaction[]) {
    const depositAmount = getTotalAmount(deposits)
    const withdrawalAmount = getTotalAmount(withdrawals)

    return roundAmount(depositAmount - withdrawalAmount)
}

function getDividends(dividends: Transaction[]) {
    return dividends.reduce(
        (acc, { amount }: Transaction) => {
            const withTax = roundAmount(amount / (1 - DIVIDEND_TAX_RATE))
            const tax = roundAmount(withTax - amount)

            acc = {
                amount: roundAmount(acc.amount + amount),
                withTax: roundAmount(acc.withTax + withTax),
                tax: roundAmount(acc.tax + tax),
            }

            return acc
        },
        {
            amount: 0,
            withTax: 0,
            tax: 0,
        }
    )
}

function getCustodyFee(custodyFees: Transaction[]) {
    return getTotalAmount(custodyFees)
}

function getSellsSummary(buys: Transaction[], sells: Transaction[]) {
    return sells.map((sellDeal) => {
        const date = sellDeal.date
        const sellDealTimestamp = sellDeal.timestamp
        const symbol = sellDeal.ticker
        const quantity = sellDeal.quantity
        const grossProceeds = sellDeal.amount
        const sellDealFee = sellDeal.fee || 0.01

        let sellDealQuantity = quantity
        let totalFee = sellDealFee
        let costBasis = 0

        buys.forEach((buyDeal) => {
            const buyDealTimestamp = buyDeal.timestamp
            const buyDealSymbol = buyDeal.ticker
            const buyDealQuantity = buyDeal.quantity
            const buyDealPrice = buyDeal.pricePerShare
            const buyDealFee = buyDeal.fee || 0

            if (
                buyDealSymbol !== symbol ||
                buyDealTimestamp >= sellDealTimestamp ||
                sellDealQuantity === 0 ||
                buyDealQuantity === 0 ||
                !buyDealQuantity ||
                !sellDealQuantity ||
                !buyDealPrice
            ) {
                return
            }

            const dealQuantity =
                buyDealQuantity >= sellDealQuantity
                    ? sellDealQuantity
                    : buyDealQuantity

            const feeFraction = (dealQuantity / buyDealQuantity) * buyDealFee
            totalFee = roundAmount(totalFee + feeFraction)

            costBasis = roundAmount(costBasis + buyDealPrice * dealQuantity)

            buyDeal.quantity = buyDealQuantity - dealQuantity
            buyDeal.fee = buyDeal.fee ? buyDeal.fee - feeFraction : 0
            sellDealQuantity -= dealQuantity
        })

        const pnl = roundAmount(grossProceeds - costBasis - totalFee)

        return {
            date,
            symbol,
            quantity,
            costBasis,
            grossProceeds,
            fee: totalFee,
            pnl,
        } as SummaryItem
    })
}

export function handleStatement(
    statement: Transaction[],
    filter: RequestFilter
) {
    const currency = filter.currency || Currency.USD

    const filteredTransactions = applyFilter(statement, filter)
    const transactionByType = groupByType(filteredTransactions)

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
        balance,
        dividends,
        custodyFee,
        totalFIFO,
        totalLIFO,
        summaryFIFO,
        summaryLIFO,
    }
}
