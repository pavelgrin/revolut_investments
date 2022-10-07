import { Database, OPEN_READWRITE, OPEN_CREATE } from "sqlite3"

export class DataBase {
    db: Database | null = null

    constructor(dbFilePath: string) {
        this.db = new Database(
            dbFilePath,
            OPEN_READWRITE | OPEN_CREATE,
            (error) => {
                if (error) {
                    console.error("[ERROR] Could not connect to the database")
                    console.error(error)
                } else {
                    console.log("[INFO] Connected to the database")
                }
            }
        )
    }

    run(sql: string, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject({
                    message: "[ERROR] The database was not connected",
                    error: null,
                })
            }

            this.db.run(sql, params, (error) => {
                if (error) {
                    reject({
                        message: `[ERROR] Running sql ${sql}`,
                        error,
                    })
                } else {
                    resolve({})
                }
            })
        })
    }

    close() {
        this.db && this.db.close()
    }
}
