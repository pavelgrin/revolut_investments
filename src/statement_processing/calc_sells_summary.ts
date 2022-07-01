import { Transaction, SummaryItem } from "../types"
import { roundAmount } from "../utils"

export function getSellsSummary(buys: Transaction[], sells: Transaction[]) {
    return sells.map((sellDeal) => {
        const date = sellDeal.date
        const sellDealTimestamp = sellDeal.timestamp
        const symbol = sellDeal.ticker
        const quantity = sellDeal.quantity
        const grossProceeds = sellDeal.amount
        const sellDealFee = sellDeal.fee || 0

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
