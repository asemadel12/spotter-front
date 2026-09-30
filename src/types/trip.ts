export type Coordinate = [longitude: number, latitude: number]

export interface TripPlanRequest {
  current_location: string
  pickup_location: string
  dropoff_location: string
  current_cycle_used_hours: number
}

export interface ResolvedLocation {
  input: string
  label: string
  latitude: number
  longitude: number
}

export interface RouteStep {
  instruction: string
  distance_meters: number
  duration_seconds: number
  type: number
  way_points: [number, number]
}

export interface RouteLeg {
  from: "current_location" | "pickup_location"
  to: "pickup_location" | "dropoff_location"
  distance_meters: number
  duration_seconds: number
  steps: RouteStep[]
}

export interface RouteGeometry {
  type: "LineString"
  coordinates: Coordinate[]
}

export interface TripRoute {
  distance_meters: number
  duration_seconds: number
  geometry: RouteGeometry
  legs: RouteLeg[]
}

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

export interface TripPlanResponse {
  status: "planned"
  trip: TripPlanRequest
  locations: {
    current_location: ResolvedLocation
    pickup_location: ResolvedLocation
    dropoff_location: ResolvedLocation
  }
  route: TripRoute
  schedule: HosSchedule
  daily_logs: DailyLogsResult
}

export interface ApplicationError {
  code: string
  field?: keyof TripPlanRequest
  message: string
}

export interface ApiError {
  error: ApplicationError
}

export type DrfValidationErrors = Partial<
  Record<keyof TripPlanRequest | "non_field_errors", string[]>
>

export type ApiErrorPayload = ApiError | DrfValidationErrors

export type RouteStopType = "BREAK" | "FUEL" | "SLEEPER" | "CYCLE_RESTART"

export interface RouteStop {
  id: string
  type: RouteStopType
  distanceMeters: number
  label: string
  start: string
  durationSeconds: number
}

export interface PositionedRouteStop extends RouteStop {
  coordinate: Coordinate
}
