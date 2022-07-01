import {
    Type,
    Currency,
    Transaction,
    GroupedTypes,
    GroupedTickers,
    RequestFilter,
} from "../types"
import { roundAmount, getTimestampByDate } from "../utils"

export function applyFilter(
    statement: Transaction[],
    { from, to, symbol, currency }: RequestFilter
) {
    const fromTimestamp = from && getTimestampByDate(from)
    const toTimestamp = to && getTimestampByDate(to)

    return statement
        .filter(({ timestamp, type, ticker }) => {
            const isFrom = fromTimestamp
                ? timestamp >= fromTimestamp || type === Type.Buy
                : true

            const isTo = toTimestamp
                ? timestamp <= toTimestamp || type === Type.Buy
                : true

            const isSymbol = symbol ? symbol === ticker : true

            return isFrom && isTo && isSymbol
        })
        .map((transaction: Transaction) => {
            if (currency === Currency.EUR) {
                const { pricePerShare, amount, fxRate, fee } = transaction

                return {
                    ...transaction,
                    currency: Currency.EUR,
                    pricePerShare: pricePerShare
                        ? roundAmount(pricePerShare / fxRate)
                        : null,
                    amount: roundAmount(amount / fxRate),
                    fee: fee ? roundAmount(fee / fxRate) : null,
                }
            }

            return transaction
        })
}

export function groupByType(statement: Transaction[]) {
    const groupedTypes: GroupedTypes = {
        [Type.TopUp]: [],
        [Type.Withdraw]: [],
        [Type.Dividend]: [],
        [Type.Buy]: [],
        [Type.Sell]: [],
        [Type.CustodyFee]: [],
        [Type.Unknown]: [],
    }

    return statement.reduce((groupedTypes, transaction: Transaction) => {
        if (!groupedTypes[transaction.type]) {
            console.log(transaction.type)
        }
        groupedTypes[transaction.type].push(transaction)
        return groupedTypes
    }, groupedTypes)
}

export function groupByTicker(statement: Transaction[]) {
    const groupedTickers: GroupedTickers = {}

    return statement.reduce((groupedTickers, transaction: Transaction) => {
        if (transaction.ticker) {
            if (!groupedTickers[transaction.ticker]) {
                groupedTickers[transaction.ticker] = 0
            }

            if (transaction.type === Type.Buy) {
                groupedTickers[transaction.ticker] += transaction.quantity || 0
            } else if (transaction.type === Type.Sell) {
                groupedTickers[transaction.ticker] -= transaction.quantity || 0
            }
        }

        return groupedTickers
    }, groupedTickers)
}

export function getTotalAmount(transactions: Transaction[]) {
    return transactions.reduce((acc, transaction: Transaction) => {
        return roundAmount(acc + transaction.amount)
    }, 0)
}

export function getTotalQuantity(transactions: Transaction[]) {
    return transactions.reduce((acc, transaction: Transaction) => {
        return acc + (transaction.quantity || 0)
    }, 0)
}

export function copyTransactions(transactions: Transaction[]) {
    return transactions.map((transaction) => ({ ...transaction }))
}
