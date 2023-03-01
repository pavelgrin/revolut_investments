import { ISODateFormat } from "./services/types"

export function getDate(dateTime: ISODateFormat) {
    const [date] = dateTime.split("T")
    return date
}

export function getTime(dateTime: ISODateFormat) {
    const [, time] = dateTime.split("T")
    return time.substring(0, 8)
}

export function getDateTime(dateTime: ISODateFormat) {
    return `${getDate(dateTime)} ${getTime(dateTime)}`
}

export function getTimestampByDate(dateTime: ISODateFormat) {
    return Date.parse(dateTime)
}

export function roundAmount(number: number) {
    return Math.round(number * 100) / 100
}

export function parseNumber(value: string) {
    return parseFloat(value.replace(/[^0-9.-]+/g, ""))
}
