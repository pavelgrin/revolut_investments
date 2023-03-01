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

export enum TransactionDateType {
    First,
    Latest,
}

export type Date = string
export type DateTime = string
export type Timestamp = number
export type Ticker = string
export type Quantity = number
export type Price = number
export type Amount = number
export type FX_Rate = number

export type Transaction = {
    date: DateTime
    timestamp: Timestamp
    ticker: Ticker | null
    type: Type
    quantity: Quantity | null
    pricePerShare: Price | null
    amount: Amount
    currency: Currency
    fxRate: FX_Rate
}

export type GroupedTypes = Record<Type, Transaction[]>

export type SummaryItem = {
    date: DateTime
    symbol: Ticker
    quantity: Quantity
    costBasis: Amount
    grossProceeds: Amount
    pnl: Amount
}

export type UrlQuery = {
    from: Date | null
    to: Date | null
    symbol: Ticker | null
    currency: Currency | null
}

export type Filter = {
    from: Date
    to: Date
    symbol: Ticker | null
    currency: Currency
}
