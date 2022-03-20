import { Type, Transaction, GroupedTypes, SellsSummaryRow } from "./types"
import { getTimestampByDate } from "./utils"

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
        const type = transaction[2]
        groupedTypes[type].push(transaction)

        return groupedTypes
    }, groupedTypes)
}

function getTotalAmount(transactions: Transaction[]) {
    const sum = transactions.reduce((acc, transaction: Transaction) => {
        const amount = Number(transaction[5])
        return acc + Math.round(amount * 100)
    }, 0)

    return sum / 100
}

function getBalance(deposits: Transaction[], withdrawals: Transaction[]) {
    const depositAmount = getTotalAmount(deposits)
    const withdrawalAmount = getTotalAmount(withdrawals)

    return depositAmount - withdrawalAmount
}

function getDividends(dividends: Transaction[]) {
    return getTotalAmount(dividends)
}

function getCustodyFee(custodyFees: Transaction[]) {
    return getTotalAmount(custodyFees)
}

function getSellsSummary(buys: Transaction[], sells: Transaction[]) {
    return sells.map((sellDeal) => {
        const dateSold = sellDeal[0]
        const timestampOfSold = getTimestampByDate(dateSold)
        const symbol = sellDeal[1]
        const quantity = Number(sellDeal[3])
        const grossProceeds = Number(sellDeal[5])
        const sellDealFee = sellDeal[8] ? Number(sellDeal[8]) + 0.01 : 0.01

        let sellDealQuantity = quantity
        let totalFee = sellDealFee * 100
        let costBasis = 0

        buys.forEach((buyDeal) => {
            const buyDealDate = buyDeal[0]
            const buyDealTimestamp = getTimestampByDate(buyDealDate)
            const buyDealSymbol = buyDeal[1]
            const buyDealQuantity = Number(buyDeal[3])
            const buyDealPrice = Number(buyDeal[4])
            const buyDealFee = Number(buyDeal[8])

            if (
                buyDealSymbol !== symbol ||
                buyDealTimestamp >= timestampOfSold
            ) {
                return
            }

            if (sellDealQuantity === 0 || buyDealQuantity === 0) {
                return
            }

            const dealQuantity =
                buyDealQuantity >= sellDealQuantity
                    ? sellDealQuantity
                    : buyDealQuantity

            const feeFraction = (dealQuantity / buyDealQuantity) * buyDealFee
            totalFee += Math.round(feeFraction * 100)

            costBasis += Math.round(
                Math.round(buyDealPrice * 100) * dealQuantity
            )

            buyDeal[3] = buyDealQuantity - dealQuantity
            buyDeal[8] = buyDeal[8] ? buyDeal[8] - feeFraction : null
            sellDealQuantity -= dealQuantity
        })

        const pnl = Math.round(grossProceeds * 100 - costBasis - totalFee) / 100

        return {
            dateSold,
            symbol,
            quantity,
            costBasis: costBasis / 100,
            grossProceeds,
            fee: -totalFee / 100,
            pnl,
        }
    })
}

export function handleStatement(statement: Transaction[]) {
    const transactionByType = groupByType(statement)

    const balance = getBalance(
        transactionByType[Type.TopUp],
        transactionByType[Type.Withdraw]
    )

    const dividends = getDividends(transactionByType[Type.Dividend])
    const custodyFee = getCustodyFee(transactionByType[Type.CustodyFee])

    const summary = getSellsSummary(
        transactionByType[Type.Buy],
        transactionByType[Type.Sell]
    )

    const totalFIFO =
        summary.reduce((acc, sellRow) => {
            return acc + sellRow.pnl * 100
        }, 0) / 100

    return {
        balance,
        dividends,
        custodyFee,
        totalFIFO,
        summaryFIFO: summary,
    }
}
