export type DutyStatus =
  | "OFF_DUTY"
  | "SLEEPER_BERTH"
  | "DRIVING"
  | "ON_DUTY_NOT_DRIVING"

export type HosEventType =
  | "DRIVING"
  | "PICKUP"
  | "DROPOFF"
  | "BREAK"
  | "FUEL"
  | "SLEEPER"
  | "CYCLE_RESTART"

export interface RouteProgressMetadata {
  leg_index: number
  step_index: number
  end_step_index?: number
  start_way_point_index?: number
  end_way_point_index?: number
  route_distance_traveled_meters: number
  route_distance_remaining_meters: number
  leg_distance_remaining_meters?: number
  leg_duration_remaining_seconds?: number
}

export interface HosEvent {
  type: HosEventType
  status: DutyStatus
  start: string
  end: string
  duration_seconds: number
  distance_meters: number
  location: string
  reason: string
  route_progress?: RouteProgressMetadata
}

export interface HosScheduleSummary {
  total_trip_distance_meters: number
  route_driving_seconds: number
  scheduled_elapsed_seconds: number
  driving_seconds: number
  on_duty_not_driving_seconds: number
  sleeper_seconds: number
  fuel_stops: number
  breaks: number
  daily_rests: number
  cycle_restarts: number
  ending_cycle_used_hours: number
}

export interface HosSchedule {
  summary: HosScheduleSummary
  events: HosEvent[]
}
