import dotenv from "dotenv"

dotenv.config()

export const APP_PORT = process.env.APP_PORT || 3000
export const STOCK_DB_PATH = process.env.STOCK_DB_PATH || ""
export const PATH_TO_PUBLIC = process.env.PATH_TO_PUBLIC || ""
