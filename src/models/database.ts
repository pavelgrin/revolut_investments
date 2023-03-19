import { Database, OPEN_READWRITE, OPEN_CREATE } from "sqlite3"

export class DataBase {
    db: Database | null = null

    createAndConnect(dbFilePath: string) {
        return new Promise((resolve, reject) => {
            if (this.db) {
                return resolve(true)
            }

            this.db = new Database(
                dbFilePath,
                OPEN_READWRITE | OPEN_CREATE,
                (error) => {
                    if (error) {
                        console.error(
                            "[ERROR] Could not connect to the database"
                        )
                        reject(error)
                    } else {
                        console.log("[INFO] Connected to the database")
                        resolve(true)
                    }
                }
            )
        })
    }

    connect(dbFilePath: string) {
        return new Promise((resolve, reject) => {
            if (this.db) {
                return resolve(true)
            }

            this.db = new Database(dbFilePath, OPEN_READWRITE, (error) => {
                if (error) {
                    console.error("[ERROR] Could not connect to the database")
                    reject(error)
                } else {
                    console.log("[INFO] Connected to the database")
                    resolve(true)
                }
            })
        })
    }

    run(sql: string, params: any[] = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.error("[ERROR] The database was not connected")
                return reject()
            }

            this.db.all(sql, params, (error, res) => {
                if (error) {
                    console.error(`[ERROR] Running sql:\n ${sql}\n${error}`)
                    return reject(error)
                } else {
                    resolve(res)
                }
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve(true)
                return
            }

            this.db.close((error) => {
                if (error) {
                    console.error("[ERROR] Could not close the database")
                    reject(error)
                } else {
                    this.db = null
                    console.log("[INFO] Close the database")
                    resolve(true)
                }
            })
        })
    }
}
