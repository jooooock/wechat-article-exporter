import dayjs from "dayjs";

export function proxyImage(url: string) {
    return `https://service.champ.design/api/proxy?url=${encodeURIComponent(url)}`
}

export function formatTimeStamp(timestamp: number) {
    return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm')
}
