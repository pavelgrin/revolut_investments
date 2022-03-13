import { Type, Transaction, Deal, TickerDeals, Tickers } from "./types"

function getBalance(statement: Transaction[]) {
    return statement.reduce((balance, transaction: Transaction) => {
        const type = transaction[2]
        const totalAmount = Number(transaction[5])

        if (type === Type.TopUp) {
            balance += totalAmount
        } else if (type === Type.Withdraw) {
            balance -= totalAmount
        }

        return balance
    }, 0)
}

function groupByTicker(statement: Transaction[]) {
    return statement.reduce((tickers: Tickers, transaction: Transaction) => {
        const ticker = transaction[1]
        const type = transaction[2]
        const quantity = Number(transaction[3])
        const pricePerShare = Number(transaction[4])

        if (ticker && quantity && pricePerShare) {
            if (!tickers[ticker]) {
                tickers[ticker] = {
                    [Type.Buy]: [],
                    [Type.Sell]: [],
                }
            }

            if (type === Type.Buy || type === Type.Sell) {
                tickers[ticker][type].push({
                    volume: quantity,
                    price: pricePerShare,
                })
            }
        }

        return tickers
    }, {})
}

function copyDeals(deals: Deal[]) {
    return deals.map(({ volume, price }) => ({ volume, price }))
}

function calcResult(sellDeals: Deal[], buyDeals: Deal[]) {
    return sellDeals.reduce((result, { volume, price: sellPrice }) => {
        let sellVolume = volume

        buyDeals.forEach((buyDeal) => {
            if (sellVolume === 0 || buyDeal.volume === 0) {
                return
            }

            const dealVolume =
                buyDeal.volume >= sellVolume ? sellVolume : buyDeal.volume

            result += (sellPrice - buyDeal.price) * dealVolume

            if (buyDeal.volume >= sellVolume) {
                buyDeal.volume -= sellVolume
                sellVolume = 0
            } else {
                sellVolume -= buyDeal.volume
                buyDeal.volume = 0
            }
        })

        return result
    }, 0)
}

function getTickerProfit(tickerDeals: TickerDeals) {
    return {
        FIFO: calcResult(
            tickerDeals[Type.Sell],
            copyDeals(tickerDeals[Type.Buy])
        ),
        LIFO: calcResult(
            tickerDeals[Type.Sell],
            copyDeals(tickerDeals[Type.Buy]).reverse()
        ),
    }
}

export function handleStatement(statement: Transaction[]) {
    const balance = getBalance(statement)
    const transactionsByTicker = groupByTicker(statement)

    const totalProfit = Object.values(transactionsByTicker)
        .map((ticker) => getTickerProfit(ticker))
        .reduce(
            (profit, { FIFO, LIFO }) => {
                profit.FIFO += FIFO
                profit.LIFO += LIFO

                return profit
            },
            { FIFO: 0, LIFO: 0 }
        )

    return {
        balance,
        totalProfit,
    }
}
