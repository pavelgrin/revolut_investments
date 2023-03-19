import { DataBase } from "./database"

import { STOCK_DB_PATH } from "../env"
import { Transaction } from "../services/types"

export async function updateStatement(db: DataBase, statement: Transaction[]) {
    try {
        await db.connect(STOCK_DB_PATH)
        await db.run("BEGIN TRANSACTION")

        await Promise.all(
            statement.map(
                async (item) =>
                    await db.run(
                        `INSERT OR REPLACE INTO Statement
                        (${Object.keys(item).join(",")})
                        VALUES (?,?,?,?,?,?,?,?,?,?)`,
                        Object.values(item)
                    )
            )
        )

        await db.run("END TRANSACTION")
    } catch (error) {
        await db.run("ROLLBACK")
        return Promise.reject(error)
    }
}

export async function getStatement(db: DataBase) {
    try {
        await db.connect(STOCK_DB_PATH)
        const statement = await db.run(`SELECT * FROM Statement`)

        return statement as Transaction[]
    } catch (error) {
        return Promise.reject(error)
    }
}
