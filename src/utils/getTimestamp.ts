export const getTimeStamp = (id: string) => {
    const timestamp = parseInt(id.toString().slice(0, 8), 16) * 1000;
    const date = new Date(timestamp)
    return date
}