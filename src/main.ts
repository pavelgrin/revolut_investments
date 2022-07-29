import path from "path"
import express from "express"
import dotenv from "dotenv"

import { RequestFilter } from "./stocks/types"
import { parseStatement } from "./stocks/parse"
import { handleStatement } from "./stocks/handle"

dotenv.config()

const PORT = process.env.APP_PORT || 3000

const statementPath = path.resolve(process.env.STATEMENT_PATH || "")
const app = express()

app.get("/stocks", async (req, res) => {
    const { from, to, symbol, currency } = req.query as RequestFilter

    const statement = await parseStatement(statementPath)
    const report = handleStatement(statement, { from, to, symbol, currency })
    res.json(report)
})

// app.get("/crypto", async (req, res) => {
//     const { from, to, symbol } = req.query as RequestFilter

//     const statement = await parseStatement(statementPath)
//     const report = handleStatement(statement, { from, to, symbol })
//     res.json(report)
// })

app.get("/**", (_, res) => {
    res.redirect("/stocks")
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})
