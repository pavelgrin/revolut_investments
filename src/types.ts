export enum Type {
    TopUp = "CASH TOP-UP",
    Withdraw = "CASH WITHDRAW",
    Buy = "BUY",
    Sell = "SELL",
}

export type Date = string
export type Ticker = string
export type Quantity = number
export type PricePerShare = number
export type TotalAmount = number
export type Currency = string
export type FX_Rate = number

export type Transaction = [
    Date,
    Ticker | null,
    Type,
    Quantity | null,
    PricePerShare | null,
    TotalAmount,
    Currency,
    FX_Rate
]

export type Deal = {
    volume: Quantity
    price: PricePerShare
}

export type TickerDeals = {
    [Type.Buy]: Deal[]
    [Type.Sell]: Deal[]
}

export type Tickers = Record<Ticker, TickerDeals>
