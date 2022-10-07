import { Transaction, SummaryItem } from "./types"
import { roundAmount } from "../utils"

export function getSellsSummary(buys: Transaction[], sells: Transaction[]) {
    return sells.map((sellDeal) => {
        const date = sellDeal.date
        const sellDealTimestamp = sellDeal.timestamp
        const symbol = sellDeal.ticker
        const quantity = sellDeal.quantity
        const grossProceeds = sellDeal.amount

        let sellDealQuantity = quantity
        let costBasis = 0

        buys.forEach((buyDeal) => {
            const buyDealTimestamp = buyDeal.timestamp
            const buyDealSymbol = buyDeal.ticker
            const buyDealQuantity = buyDeal.quantity
            const buyDealPrice = buyDeal.pricePerShare

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

            costBasis = roundAmount(costBasis + buyDealPrice * dealQuantity)

            buyDeal.quantity = buyDealQuantity - dealQuantity
            sellDealQuantity -= dealQuantity
        })

        const pnl = roundAmount(grossProceeds - costBasis)

        return {
            date,
            symbol,
            quantity,
            costBasis,
            grossProceeds,
            pnl,
        } as SummaryItem
    })
}
