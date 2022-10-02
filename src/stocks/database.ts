import sqlite3 from "sqlite3"

const { STOCK_DB_PATH } = process.env

const db = new sqlite3.Database(
    STOCK_DB_PATH || "",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error(err.message)
        }
        console.log("Connected to the database")
    }
)
