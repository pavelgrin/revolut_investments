export function getTimestampByDate(dateTime: string) {
    const [date, time] = dateTime.split(" ")
    const [DD, MM, YYYY] = date.split("/")

    return Number(new Date(`${YYYY}-${MM}-${DD} ${time}`))
}
