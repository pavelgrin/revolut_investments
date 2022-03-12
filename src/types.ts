type Date = string
type Ticker = string
type Type = string
type Quantity = number
type PricePerShare = number
type TotalAmount = number
type Currency = string
type FX_Rate = number

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
