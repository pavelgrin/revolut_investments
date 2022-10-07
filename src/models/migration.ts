import { Database } from "sqlite3"

export const Migration = {
    up(db: Database) {
        return new Promise(function (ressolve, reject) {})
    },

    down(db: Database) {
        return new Promise(function (resolve, reject) {})
    },
}
