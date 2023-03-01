import {
    Type,
    Currency,
    Transaction,
    GroupedTypes,
    Filter,
    TransactionDateType,
} from "./types"
import { roundAmount, getTimestampByDate } from "../utils"

export function getTransactionDate(
    type: TransactionDateType,
    statement: Transaction[]
) {
    if (type === TransactionDateType.First) {
        return "2021-01-01"
    }

    return "2023-12-31"
}

export function applyFilter(
    statement: Transaction[],
    { from, to, symbol, currency }: Filter
) {
    const fromTimestamp = getTimestampByDate(from)
    const toTimestamp = getTimestampByDate(to)

    return statement
        .filter(({ timestamp, type, ticker }) => {
            const isFrom = timestamp >= fromTimestamp || type === Type.Buy
            const isTo = timestamp <= toTimestamp || type === Type.Buy

            const isSymbol = symbol ? symbol === ticker : true

            return isFrom && isTo && isSymbol
        })
        .map((transaction: Transaction) => {
            if (currency === Currency.EUR) {
                const { pricePerShare, amount, fxRate } = transaction

                return {
                    ...transaction,
                    currency: Currency.EUR,
                    pricePerShare: pricePerShare
                        ? roundAmount(pricePerShare / fxRate)
                        : null,
                    amount: roundAmount(amount / fxRate),
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
        [Type.StockSplit]: [],
        [Type.Unknown]: [],
    }

    return statement.reduce((groupedTypes, transaction: Transaction) => {
        if (!groupedTypes[transaction.type]) {
            console.warn(transaction.type)
        }
        groupedTypes[transaction.type].push(transaction)
        return groupedTypes
    }, groupedTypes)
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

export function handleStockSplit(transactionByType: GroupedTypes) {
    transactionByType[Type.StockSplit].forEach((splitTransaction) => {
        const splitQuantity = splitTransaction.quantity || 0

        const buyDeals = transactionByType[Type.Buy].filter(
            (transaction) =>
                transaction.ticker === splitTransaction.ticker &&
                transaction.timestamp < splitTransaction.timestamp
        )

        const sellDeals = transactionByType[Type.Sell].filter(
            (transaction) =>
                transaction.ticker === splitTransaction.ticker &&
                transaction.timestamp < splitTransaction.timestamp
        )

        const buyQuantitySum = buyDeals.reduce(
            (acc, { quantity }) => acc + (quantity || 0),
            0
        )

        const sellQuantitySum = sellDeals.reduce(
            (acc, { quantity }) => acc + (quantity || 0),
            0
        )

        const quantitySum = buyQuantitySum - sellQuantitySum

        // Mutate buy deals to update quantity and price after split
        buyDeals.forEach((transaction) => {
            if (!transaction.quantity) {
                return
            }

            const quantityRatio = transaction.quantity / quantitySum

            transaction.quantity += quantityRatio * splitQuantity
            transaction.pricePerShare =
                transaction.amount / transaction.quantity
        })

        // Mutate sell deals to update quantity and price after split
        sellDeals.forEach((transaction) => {
            if (!transaction.quantity) {
                return
            }

            const quantityRatio = transaction.quantity / quantitySum

            transaction.quantity += quantityRatio * splitQuantity
            transaction.pricePerShare =
                transaction.amount / transaction.quantity
        })
    })

    return transactionByType
}
