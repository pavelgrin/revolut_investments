import { Transaction } from "./types"
import { roundAmount } from "../utils"

import { getTotalAmount, getTotalQuantity } from "./prepare_data"

function getQuantity(buys: Transaction[], sells: Transaction[]) {
    const buyQuantity = getTotalQuantity(buys)
    const sellQuantity = getTotalQuantity(sells)

    return buyQuantity - sellQuantity
}

export function getTickerSummary(buys: Transaction[], sells: Transaction[]) {
    const buy = getTotalAmount(buys)
    const sell = getTotalAmount(sells)

    const netAmont = roundAmount(buy - sell)
    const quantity = netAmont > 0 ? getQuantity(buys, sells) : 0
    const bep = netAmont > 0 ? roundAmount(netAmont / quantity) : 0

    return {
        buy,
        sell,
        netAmont,
        quantity,
        bep,
    }
}
