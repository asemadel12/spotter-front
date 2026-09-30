const METERS_PER_MILE = 1609.344

export function formatDistanceMiles(meters: number): string {
  return `${(meters / METERS_PER_MILE).toFixed(1)} mi`
}

export function formatDuration(totalSeconds: number): string {
  const roundedMinutes = Math.round(totalSeconds / 60)
  const days = Math.floor(roundedMinutes / 1440)
  const hours = Math.floor((roundedMinutes % 1440) / 60)
  const minutes = roundedMinutes % 60
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes || parts.length === 0) parts.push(`${minutes}m`)
  return parts.join(" ")
}

export function formatDateTime(value: string): string {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/,
  )
  if (!match) return "Unknown time"

  const [, year, month, day, hour, minute] = match
  const wallClock = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ),
  )
  if (Number.isNaN(wallClock.getTime())) return "Unknown time"

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(wallClock)
}

export function formatHours(seconds: number): string {
  return `${(seconds / 3600).toFixed(1)}h`
}

export function formatLogDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)
}
