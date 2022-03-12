import { createReadStream, PathLike } from "fs"
import { parse } from "csv-parse"

import { Transaction } from "./types"

export async function parseStatement(filePath: PathLike) {
    const promise = () =>
        new Promise((resolve, reject) => {
            const statement: Transaction[] = []

            createReadStream(filePath)
                .pipe(parse({ delimiter: ",", from_line: 2 }))
                .on("data", (csvRow: Transaction) => {
                    statement.push(csvRow)
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
