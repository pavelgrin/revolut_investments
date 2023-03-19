import { DataBase } from "./database"
import { STOCK_DB_PATH } from "../env"

enum MigrationType {
    Up = "up",
    Down = "down",
}

const Migration = {
    async [MigrationType.Up](db: DataBase) {
        await db.run(`
            CREATE TABLE IF NOT EXISTS Statement (
                id INTEGER PRIMARY KEY,
                isoDate TEXT NOT NULL,
                date TEXT NOT NULL,
                timestamp INTEGER NOT NULL UNIQUE,
                ticker TEXT,
                type TEXT NOT NULL,
                quantity REAL,
                pricePerShare REAL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL,
                fxRate REAL NOT NULL
            )
        `)
    },

    async [MigrationType.Down](db: DataBase) {
        await db.run("DROP TABLE IF EXISTS Statement")
    },
}

;(async () => {
    const type = process.argv[2] as MigrationType

    if (type !== MigrationType.Up && type !== MigrationType.Down) {
        console.error("[ERROR] Wrong migration type argument")
    } else {
        const stockDB = new DataBase()
        const isConnected = await stockDB.createAndConnect(STOCK_DB_PATH)

        if (isConnected) {
            await Migration[type](stockDB)
            await stockDB.close()
        }
    }
})()
