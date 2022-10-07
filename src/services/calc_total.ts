import { Transaction } from "./types"
import { roundAmount } from "../utils"

import { getTotalAmount } from "./prepare_data"

const DIVIDEND_TAX_RATE = 0.15

export function getBalance(
    deposits: Transaction[],
    withdrawals: Transaction[]
) {
    const depositAmount = getTotalAmount(deposits)
    const withdrawalAmount = getTotalAmount(withdrawals)

    return roundAmount(depositAmount + withdrawalAmount)
}

export function getDividends(dividends: Transaction[]) {
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

export function getCustodyFee(custodyFees: Transaction[]) {
    return getTotalAmount(custodyFees)
}
