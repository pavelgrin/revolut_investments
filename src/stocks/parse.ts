import { createReadStream, PathLike } from "fs"
import { parse } from "csv-parse"

import { Transaction } from "./types"
import { getISODate, getTimestampByDate, parseNumber } from "../utils"

export async function parseStatement(filePath: PathLike) {
    const promise = (): Promise<Transaction[]> =>
        new Promise((resolve, reject) => {
            const statement: Transaction[] = []

            createReadStream(filePath)
                .pipe(parse({ delimiter: ",", from_line: 2 }))
                .on("data", (csvRow) => {
                    const timestamp = getTimestampByDate(csvRow[0])

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
