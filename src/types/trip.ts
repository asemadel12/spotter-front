import type { DailyLogsResult } from "@/types/eld"
import type { HosSchedule } from "@/types/hos"
import type { ResolvedLocation, TripRoute } from "@/types/route"

export interface TripPlanRequest {
  current_location: string
  pickup_location: string
  dropoff_location: string
  current_cycle_used_hours: number
}

export interface TripLocations {
  current_location: ResolvedLocation
  pickup_location: ResolvedLocation
  dropoff_location: ResolvedLocation
}

export interface TripPlanResponse {
  status: "planned"
  trip: TripPlanRequest
  locations: TripLocations
  route: TripRoute
  schedule: HosSchedule
  daily_logs: DailyLogsResult
}

// Compatibility facade for trip-planning consumers. Domain modules should
// prefer importing directly from route, hos, or eld when possible.
export type * from "@/types/eld"
export type * from "@/types/hos"
export type * from "@/types/route"
