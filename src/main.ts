import path from "path"
import express from "express"
import dotenv from "dotenv"

import { parseStatement } from "./parseStatement"

dotenv.config()

const PORT = process.env.APP_PORT || 3000

const statementPath = path.resolve("public/example.csv")
const app = express()

app.get("/**", async (req, res) => {
    const statement = await parseStatement(statementPath)
    res.json(statement)
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})
