export enum Type {
    TopUp = "CASH TOP-UP",
    Withdraw = "CASH WITHDRAW",
    Dividend = "DIVIDEND",
    Buy = "BUY",
    Sell = "SELL",
    CustodyFee = "CUSTODY_FEE",
}

export enum Currency {
    USD = "USD",
    EUR = "EUR",
}

export type Date = string
export type Timestamp = number
export type Ticker = string
export type Quantity = number
export type Price = number
export type Amount = number
export type FX_Rate = number
export type Fee = number

export type Transaction = {
    date: Date
    timestamp: Timestamp
    ticker: Ticker | null
    type: Type
    quantity: Quantity | null
    pricePerShare: Price | null
    amount: Amount
    currency: Currency
    fxRate: FX_Rate
    fee: Fee | null
}

export type GroupedTypes = Record<Type, Transaction[]>

export type SummaryItem = {
    date: Date
    symbol: Ticker
    quantity: Quantity
    costBasis: Amount
    grossProceeds: Amount
    fee: Fee
    pnl: Amount
}

export type RequestFilter = {
    from: string
    to: string
    symbol: string
    currency: Currency
}
