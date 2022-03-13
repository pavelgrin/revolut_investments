import path from "path"
import express from "express"
import dotenv from "dotenv"

import { parseStatement } from "./parseStatement"
import { handleStatement } from "./handleStatement"

dotenv.config()

const PORT = process.env.APP_PORT || 3000

const statementPath = path.resolve(process.env.STATEMENT_PATH || "")
const app = express()

app.get("/**", async (req, res) => {
    const statement = await parseStatement(statementPath)
    const report = handleStatement(statement)
    res.json(report)
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})
