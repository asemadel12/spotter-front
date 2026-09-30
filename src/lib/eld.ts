import type {
  DailyLogSegment,
  DutyStatus,
  HosEventType,
} from "@/types/trip"

export const SECONDS_PER_DAY = 86_400

export const DUTY_STATUS_ROWS = [
  { status: "OFF_DUTY", label: "OFF DUTY" },
  { status: "SLEEPER_BERTH", label: "SLEEPER BERTH" },
  { status: "DRIVING", label: "DRIVING" },
  { status: "ON_DUTY_NOT_DRIVING", label: "ON DUTY (NOT DRIVING)" },
] as const satisfies ReadonlyArray<{ status: DutyStatus; label: string }>

export const ELD_GRAPH_DIMENSIONS = {
  width: 1_200,
  height: 340,
  graphLeft: 170,
  graphWidth: 920,
  graphTop: 76,
  rowHeight: 52,
  totalsLeft: 1_090,
} as const

export const EVENT_LABELS: Record<HosEventType, string> = {
  DRIVING: "Driving",
  PICKUP: "Pickup",
  DROPOFF: "Drop-off",
  BREAK: "30-min Break",
  FUEL: "Fuel Stop",
  SLEEPER: "Sleeper Rest",
  CYCLE_RESTART: "34-hour Restart",
}

export interface DutyTraceSpan {
  status: DutyStatus
  startSecond: number
  endSecond: number
  x1: number
  x2: number
  y: number
}

export interface DutyTraceConnector {
  x: number
  y1: number
  y2: number
}

export interface DutyTrace {
  spans: DutyTraceSpan[]
  connectors: DutyTraceConnector[]
}

export interface TraceDimensions {
  graphLeft: number
  graphWidth: number
  graphTop: number
  rowHeight: number
}

export function statusToRow(status: string): number | null {
  const index = DUTY_STATUS_ROWS.findIndex((row) => row.status === status)
  return index === -1 ? null : index
}

export function secondToFraction(second: number): number {
  if (!Number.isFinite(second)) return 0
  return Math.min(SECONDS_PER_DAY, Math.max(0, second)) / SECONDS_PER_DAY
}

export function secondToGraphX(
  second: number,
  graphLeft: number,
  graphWidth: number,
): number {
  return graphLeft + secondToFraction(second) * graphWidth
}

export function getStatusCenterY(
  status: string,
  graphTop: number,
  rowHeight: number,
): number | null {
  const row = statusToRow(status)
  return row === null ? null : graphTop + rowHeight * (row + 0.5)
}

export function buildDutyTrace(
  segments: DailyLogSegment[],
  dimensions: TraceDimensions = ELD_GRAPH_DIMENSIONS,
): DutyTrace {
  const spans: DutyTraceSpan[] = []

  for (const segment of segments) {
    const row = statusToRow(segment.status)
    if (
      row === null ||
      !Number.isFinite(segment.start_second) ||
      !Number.isFinite(segment.end_second) ||
      segment.end_second <= segment.start_second
    ) {
      continue
    }

    const startSecond = Math.min(
      SECONDS_PER_DAY,
      Math.max(0, segment.start_second),
    )
    const endSecond = Math.min(
      SECONDS_PER_DAY,
      Math.max(0, segment.end_second),
    )
    if (endSecond <= startSecond) continue

    spans.push({
      status: segment.status,
      startSecond,
      endSecond,
      x1: secondToGraphX(
        startSecond,
        dimensions.graphLeft,
        dimensions.graphWidth,
      ),
      x2: secondToGraphX(
        endSecond,
        dimensions.graphLeft,
        dimensions.graphWidth,
      ),
      y: dimensions.graphTop + dimensions.rowHeight * (row + 0.5),
    })
  }

  const connectors: DutyTraceConnector[] = []
  for (let index = 1; index < spans.length; index += 1) {
    const previous = spans[index - 1]
    const current = spans[index]
    if (
      previous.endSecond === current.startSecond &&
      previous.status !== current.status
    ) {
      connectors.push({ x: current.x1, y1: previous.y, y2: current.y })
    }
  }

  return { spans, connectors }
}

export function formatLogHours(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0h"
  const hours = Math.round((seconds / 3_600) * 100) / 100
  return `${hours.toString()}h`
}

export function getEventLabel(type: HosEventType): string {
  return EVENT_LABELS[type]
}

export function formatGraphTime(second: number): string {
  const clamped = Math.min(SECONDS_PER_DAY, Math.max(0, second))
  if (clamped === SECONDS_PER_DAY) return "24:00"
  const hours = Math.floor(clamped / 3_600)
  const minutes = Math.floor((clamped % 3_600) / 60)
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`
}
