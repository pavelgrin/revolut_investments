export function getTimestampByDate(dateTime: string) {
    const [date, time] = dateTime.split(" ")
    const [DD, MM, YYYY] = date.split("/")

    const isoDate = `${YYYY}-${MM}-${DD}`

    return Number(new Date(time ? `${isoDate} ${time}` : isoDate))
}

export function roundAmount(number: number) {
    return Math.round(number * 100) / 100
}
