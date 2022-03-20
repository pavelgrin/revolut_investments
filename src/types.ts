export enum Type {
    TopUp = "CASH TOP-UP",
    Withdraw = "CASH WITHDRAW",
    Dividend = "DIVIDEND",
    Buy = "BUY",
    Sell = "SELL",
    CustodyFee = "CUSTODY_FEE",
}

export type Date = string
export type Ticker = string
export type Quantity = number
export type PricePerShare = number
export type Amount = number
export type Currency = string
export type FX_Rate = number
export type Fee = number

export type Transaction = [
    Date,
    Ticker | null,
    Type,
    Quantity | null,
    PricePerShare | null,
    Amount,
    Currency,
    FX_Rate,
    Fee | null
]

export type GroupedTypes = Record<Type, Transaction[]>

export type SellsSummaryRow = {}
