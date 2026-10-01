import type { DefaultValues, UseFormSetError } from "react-hook-form"
import { z } from "zod"

import { ApiRequestError } from "@/api/client"
import type { ApiError, DrfValidationErrors } from "@/types/api"
import type { TripPlanRequest } from "@/types/trip"

export const tripPlanSchema = z.object({
  current_location: z.string().trim().min(1, "Enter your current location."),
  pickup_location: z.string().trim().min(1, "Enter the pickup location."),
  dropoff_location: z.string().trim().min(1, "Enter the drop-off location."),
  current_cycle_used_hours: z
    .number({ invalid_type_error: "Enter the cycle hours used." })
    .min(0, "Cycle hours cannot be below 0.")
    .max(70, "Cycle hours cannot exceed 70."),
})

export const TRIP_PLAN_DEFAULT_VALUES: DefaultValues<TripPlanRequest> = {
  current_location: "",
  pickup_location: "",
  dropoff_location: "",
  current_cycle_used_hours: undefined,
}

export const SAMPLE_TRIP: TripPlanRequest = {
  current_location: "Chicago, IL",
  pickup_location: "St. Louis, MO",
  dropoff_location: "Dallas, TX",
  current_cycle_used_hours: 20,
}

export function applyTripPlanFieldErrors(
  error: ApiRequestError,
  setError: UseFormSetError<TripPlanRequest>,
): boolean {
  const payload = error.payload
  if (!payload) return false

  if ("error" in payload) {
    const applicationError = (payload as ApiError).error
    if (
      applicationError.field &&
      applicationError.field in tripPlanSchema.shape
    ) {
      setError(applicationError.field, {
        message: applicationError.message,
      })
      return true
    }
    return false
  }

  let applied = false
  for (const field of Object.keys(tripPlanSchema.shape) as Array<
    keyof TripPlanRequest
  >) {
    const messages = (payload as DrfValidationErrors)[field]
    if (messages?.length) {
      setError(field, { message: messages[0] })
      applied = true
    }
  }

  return applied
}
