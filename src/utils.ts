type ISOStringFormat = string

export function getDate(dateTime: ISOStringFormat) {
    const [date] = dateTime.split("T")
    return date
}

export function getTime(dateTime: ISOStringFormat) {
    const [, time] = dateTime.split("T")
    return time.substring(0, 8)
}

export function getDateTime(dateTime: ISOStringFormat) {
    return `${getDate(dateTime)} ${getTime(dateTime)}`
}

export function getTimestampByDate(dateTime: ISOStringFormat) {
    return Number(new Date(dateTime))
}

export function roundAmount(number: number) {
    return Math.round(number * 100) / 100
}

export function parseNumber(value: string) {
    return parseFloat(value.replace(/[^0-9.-]+/g, ""))
}
