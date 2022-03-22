import { createReadStream, PathLike } from "fs"
import { parse } from "csv-parse"

import { Transaction } from "./types"
import { getTimestampByDate } from "./utils"

export async function parseStatement(filePath: PathLike) {
    const promise = (): Promise<Transaction[]> =>
        new Promise((resolve, reject) => {
            const statement: Transaction[] = []

            createReadStream(filePath)
                .pipe(parse({ delimiter: ",", from_line: 2 }))
                .on("data", (csvRow) => {
                    const transaction: Transaction = {
                        date: csvRow[0],
                        timestamp: getTimestampByDate(csvRow[0]),
                        ticker: csvRow[1] || null,
                        type: csvRow[2],
                        quantity: csvRow[3] ? Number(csvRow[3]) : null,
                        pricePerShare: csvRow[4] ? Number(csvRow[4]) : null,
                        amount: Number(csvRow[5]),
                        currency: csvRow[6],
                        fxRate: Number(csvRow[7]),
                        fee: csvRow[8] ? Number(csvRow[8]) : null,
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
