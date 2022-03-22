import { Type, Transaction, GroupedTypes, RequestRange } from "./types"
import { getTimestampByDate, roundAmount } from "./utils"

function filterStatement(statement: Transaction[], { from, to }: RequestRange) {
    const fromTimestamp = from && getTimestampByDate(from)
    const toTimestamp = to && getTimestampByDate(to)

    return statement.filter(({ timestamp, type }) => {
        const isFrom = fromTimestamp ? timestamp >= fromTimestamp : true
        const isTo = toTimestamp ? timestamp <= toTimestamp : true

        return type === Type.Buy || (isFrom && isTo)
    })
}

function groupByType(statement: Transaction[]) {
    const groupedTypes: GroupedTypes = {
        [Type.TopUp]: [],
        [Type.Withdraw]: [],
        [Type.Dividend]: [],
        [Type.Buy]: [],
        [Type.Sell]: [],
        [Type.CustodyFee]: [],
    }

    return statement.reduce((groupedTypes, transaction: Transaction) => {
        groupedTypes[transaction.type].push(transaction)
        return groupedTypes
    }, groupedTypes)
}

function copyTransactions(transactions: Transaction[]) {
    return transactions.map((transaction) => ({ ...transaction }))
}

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
    return getTotalAmount(dividends)
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
        }
    })
}

export function handleStatement(statement: Transaction[], range: RequestRange) {
    const filteredTransactions = filterStatement(statement, range)
    const transactionByType = groupByType(filteredTransactions)

    const balance = getBalance(
        transactionByType[Type.TopUp],
        transactionByType[Type.Withdraw]
    )

    const dividends = getDividends(transactionByType[Type.Dividend])
    const custodyFee = getCustodyFee(transactionByType[Type.CustodyFee])

    const summaryFIFO = getSellsSummary(
        copyTransactions(transactionByType[Type.Buy]),
        copyTransactions(transactionByType[Type.Sell])
    )

    const summaryLIFO = getSellsSummary(
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
