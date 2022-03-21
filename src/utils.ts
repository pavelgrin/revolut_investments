export function getTimestampByDate(dateTime: string) {
    const [date, time] = dateTime.split(" ")
    const [DD, MM, YYYY] = date.split("/")

    return Number(new Date(`${YYYY}-${MM}-${DD} ${time}`))
}

export function roundAmount(number: number) {
    return Math.round(number * 100) / 100
}
