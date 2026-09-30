import { describe, expect, it, vi } from "vitest"

import { ApiRequestError } from "@/api/client"
import {
  applyTripPlanFieldErrors,
  SAMPLE_TRIP,
  tripPlanSchema,
} from "@/components/trip/trip-planner-form.logic"

describe("trip planner form logic", () => {
  it("trims location values and accepts decimal cycle hours", () => {
    expect(
      tripPlanSchema.parse({
        current_location: "  Chicago, IL  ",
        pickup_location: " St. Louis, MO ",
        dropoff_location: " Dallas, TX ",
        current_cycle_used_hours: 20.5,
      }),
    ).toEqual({
      current_location: "Chicago, IL",
      pickup_location: "St. Louis, MO",
      dropoff_location: "Dallas, TX",
      current_cycle_used_hours: 20.5,
    })
  })

  it("keeps the sample trip as a valid API request", () => {
    expect(tripPlanSchema.parse(SAMPLE_TRIP)).toEqual(SAMPLE_TRIP)
  })

  it("maps backend field errors without leaking them into generic UI", () => {
    const setError = vi.fn()
    const handled = applyTripPlanFieldErrors(
      new ApiRequestError("Could not resolve pickup location.", 400, {
        error: {
          code: "location_not_found",
          field: "pickup_location",
          message: "Could not resolve pickup location.",
        },
      }),
      setError,
    )

    expect(handled).toBe(true)
    expect(setError).toHaveBeenCalledWith("pickup_location", {
      message: "Could not resolve pickup location.",
    })
  })
})
