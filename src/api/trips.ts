import { apiRequest } from "@/api/client"
import type { TripPlanRequest, TripPlanResponse } from "@/types/trip"

export function planTrip(payload: TripPlanRequest): Promise<TripPlanResponse> {
  return apiRequest<TripPlanResponse>("/trips/plan/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
