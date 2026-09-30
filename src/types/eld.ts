import type { DutyStatus, HosEvent, HosEventType } from "@/types/hos"

export interface DailyLogSegment {
  status: DutyStatus
  start_second: number
  end_second: number
  duration_seconds: number
}

export interface DailyLogLocation {
  ref: string
  label: string
}

export interface DailyLogRemark {
  second_of_day: number
  time: string
  event_type: HosEventType
  status: DutyStatus
  location: DailyLogLocation
  reason: string
  route_distance_traveled_meters?: number
}

export interface DailyLogTotals {
  off_duty_seconds: number
  sleeper_berth_seconds: number
  driving_seconds: number
  on_duty_not_driving_seconds: number
  total_seconds: number
}

export interface DailyLog {
  date: string
  timezone: string
  driving_distance_meters: number
  driving_distance_miles: number
  totals: DailyLogTotals
  segments: DailyLogSegment[]
  events: HosEvent[]
  remarks: DailyLogRemark[]
}

export interface DailyLogsResult {
  summary: {
    log_count: number
    start_date: string
    end_date: string
    total_driving_distance_meters: number
    total_driving_distance_miles: number
  }
  logs: DailyLog[]
}
