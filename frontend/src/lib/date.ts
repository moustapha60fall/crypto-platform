export function formatRelative(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" })

    if (seconds < 60) return rtf.format(-seconds, "second")
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return rtf.format(-minutes, "minute")
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return rtf.format(-hours, "hour")
    const days = Math.floor(hours / 24)
    return rtf.format(-days, "day")
}
