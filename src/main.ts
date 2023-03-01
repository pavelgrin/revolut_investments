import express from "express"
import multer from "multer"

import { APP_PORT, STOCK_DB_PATH, PATH_TO_PUBLIC } from "./env"

import { getDate } from "./utils"

import { QueryParams } from "./services/types"
import { parseStatement } from "./services/parse"
import { handleStatement } from "./services/handle"

import { DataBase } from "./models/database"
import { Migration } from "./models/migration"

const PORT = APP_PORT || 3000

const app = express()

app.set("view engine", "ejs")
app.use(express.static(PATH_TO_PUBLIC || ""))

const stockDB = new DataBase(STOCK_DB_PATH || "")

// TODO: Save data to DB
let fileBuffer: Buffer | null = null

app.get("/", async (req, res) => {
    const { from, to, symbol, currency } = req.query as QueryParams

    const statement = await parseStatement(fileBuffer)
    const report = handleStatement(statement, { from, to, symbol, currency })

    res.render("index", {
        report,
        generationDate: getDate(new Date().toISOString()),
    })
})

app.post("/update", multer().single("statement"), (req, res) => {
    fileBuffer = req.file?.buffer || null

    if (!fileBuffer) {
        res.sendStatus(400)
        return
    }

    res.sendStatus(200)
})

app.get("/**", (_, res) => {
    res.redirect("/")
})

app.listen(PORT, () => {
    console.log(`[INFO] Server is running on port: ${PORT}`)
})
