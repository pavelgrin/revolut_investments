import { createReadStream, PathLike } from "fs"
import { parse } from "csv-parse"

import { Type, Timestamp, Transaction } from "../types"
import { getISODate, getTimestampByDate, parseNumber } from "../utils"

const SELL_FEE_1 = 0.01
const SELL_FEE_2 = 0.02

function getSellFee(timestamp: Timestamp) {
    const newFeeDate = getTimestampByDate("2022-05-27")

    if (timestamp < newFeeDate) {
        return SELL_FEE_1
    }

    return SELL_FEE_2
}

export async function parseStatement(filePath: PathLike) {
    const promise = (): Promise<Transaction[]> =>
        new Promise((resolve, reject) => {
            const statement: Transaction[] = []

            createReadStream(filePath)
                .pipe(parse({ delimiter: ",", from_line: 2 }))
                .on("data", (csvRow) => {
                    const timestamp = getTimestampByDate(csvRow[0])
                    const type = csvRow[2]

                    const sellFee =
                        type === Type.Sell ? getSellFee(timestamp) : null

                    const fee = csvRow[8] ? parseNumber(csvRow[8]) : sellFee

                    const transaction: Transaction = {
                        date: getISODate(csvRow[0]),
                        timestamp,
                        ticker: csvRow[1] || null,
                        type: csvRow[2],
                        quantity: csvRow[3] ? parseNumber(csvRow[3]) : null,
                        pricePerShare: csvRow[4]
                            ? parseNumber(csvRow[4])
                            : null,
                        amount: parseNumber(csvRow[5]),
                        currency: csvRow[6],
                        fxRate: parseNumber(csvRow[7]),
                        fee,
                    }

                    statement.push(transaction)
                })
                .on("end", () => {
                    resolve(statement)
                })
                .on("error", (err) => {
                    reject(err)
                })
        })

    return await promise()
}
