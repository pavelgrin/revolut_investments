import path from "path"
import express from "express"
import dotenv from "dotenv"

import { RequestFilter } from "./types"
import { parseStatement } from "./statement_processing/parse"
import { handleStatement } from "./statement_processing/handle"

dotenv.config()

const PORT = process.env.APP_PORT || 3000

const statementPath = path.resolve(process.env.STATEMENT_PATH || "")
const app = express()

app.get("/**", async (req, res) => {
    const { from, to, symbol, currency } = req.query as RequestFilter

    const statement = await parseStatement(statementPath)
    const report = handleStatement(statement, { from, to, symbol, currency })
    res.json(report)
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})
