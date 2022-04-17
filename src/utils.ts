export function getISODate(dateTime: string) {
    const [date, time] = dateTime.split(" ")
    const [DD, MM, YYYY] = date.split("/")

    const isoDate = `${YYYY}-${MM}-${DD}`

    return time ? `${isoDate} ${time}` : isoDate
}

export function getTimestampByDate(dateTime: string) {
    return Number(new Date(getISODate(dateTime)))
}

export function roundAmount(number: number) {
    return Math.round(number * 100) / 100
}
