export enum Type {
    TopUp = "CASH TOP-UP",
    Withdraw = "CASH WITHDRAWAL",
    Dividend = "DIVIDEND",
    Buy = "BUY - MARKET",
    Sell = "SELL - MARKET",
    CustodyFee = "CUSTODY FEE",
    StockSplit = "STOCK SPLIT",
    Unknown = "",
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
export type GroupedTickers = Record<Ticker, Quantity>

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
    from: string | null
    to: string | null
    symbol: string | null
    currency: Currency | null
}
