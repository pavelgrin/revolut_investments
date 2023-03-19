import express from "express"
import multer from "multer"

import { APP_PORT, PATH_TO_PUBLIC } from "./env"

import { getDate } from "./utils"

import { QueryParams } from "./services/types"
import { parseStatement } from "./services/parse"
import { handleStatement } from "./services/handle"

import { DataBase } from "./models/database"
import { updateStatement, getStatement } from "./models/statement"

const PORT = APP_PORT

const app = express()

app.set("view engine", "ejs")
app.use(express.static(PATH_TO_PUBLIC))

const stockDB = new DataBase()

app.get("/", async (req, res) => {
    try {
        const { from, to, symbol, currency } = req.query as QueryParams

        const statement = await getStatement(stockDB)
        const report = handleStatement(statement, {
            from,
            to,
            symbol,
            currency,
        })

        res.render("index", {
            report,
            generationDate: getDate(new Date().toISOString()),
        })
    } catch (error) {
        res.sendStatus(400)
    }
})

app.post("/update", multer().single("statement"), async (req, res) => {
    try {
        const fileBuffer = req.file?.buffer || null

        if (!fileBuffer) {
            res.sendStatus(400)
            return
        }

        const statement = await parseStatement(fileBuffer)

        if (!statement || !statement.length) {
            res.sendStatus(400)
            return
        }

        await updateStatement(stockDB, statement)

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(400)
    }
})

app.get("/**", (_, res) => {
    res.redirect("/")
})

app.listen(PORT, () => {
    console.log(`[INFO] Server is running on port: ${PORT}`)
})
