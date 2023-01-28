import path from "path"
import express from "express"

import { APP_PORT, STATEMENT_PATH, STOCK_DB_PATH, PATH_TO_PUBLIC } from "./env"

import { RequestFilter } from "./services/types"
import { parseStatement } from "./services/parse"
import { handleStatement } from "./services/handle"

import { DataBase } from "./models/database"
import { Migration } from "./models/migration"

const PORT = APP_PORT || 3000

const statementPath = path.resolve(STATEMENT_PATH || "")
const app = express()

app.set("view engine", "ejs")
app.use(express.static(PATH_TO_PUBLIC || ""))

const stockDB = new DataBase(STOCK_DB_PATH || "")

app.get("/", async (req, res) => {
    const { from, to, symbol, currency } = req.query as RequestFilter

    const statement = await parseStatement(statementPath)
    const report = handleStatement(statement, { from, to, symbol, currency })

    res.render("index", { report })
})

app.post("/update", (_, res) => {
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
