export function getISODate(dateTime: string) {
    const [date, time] = dateTime.split("T")
    return `${date} ${time}`
}

export function getTimestampByDate(dateTime: string) {
    return Number(new Date(getISODate(dateTime)))
}

export function roundAmount(number: number) {
    return Math.round(number * 100) / 100
}

export function parseNumber(value: string) {
    return parseFloat(value.replace(/[^0-9.-]+/g, ""))
}
