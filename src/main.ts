import path from "path"
import express from "express"

import { APP_PORT, STATEMENT_PATH, STOCK_DB_PATH } from "./env"

import { RequestFilter } from "./services/types"
import { parseStatement } from "./services/parse"
import { handleStatement } from "./services/handle"

import { DataBase } from "./models/database"
import { Migration } from "./models/migration"

const PORT = APP_PORT || 3000

const statementPath = path.resolve(STATEMENT_PATH || "")
const app = express()

const stockDB = new DataBase(STOCK_DB_PATH || "")

app.get("/", async (req, res) => {
    const { from, to, symbol, currency } = req.query as RequestFilter

    const statement = await parseStatement(statementPath)
    const report = handleStatement(statement, { from, to, symbol, currency })
    res.json(report)
})

app.get("/update", (_, res) => {
    res.json({
        isSuccessful: true,
    })
})

app.get("/**", (_, res) => {
    res.redirect("/")
})

app.listen(PORT, () => {
    console.log(`[INFO] Server is running on port: ${PORT}`)
})
