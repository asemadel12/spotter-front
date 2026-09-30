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
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown time"
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
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
