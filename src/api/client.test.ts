import { afterEach, describe, expect, it, vi } from "vitest"

import { ApiRequestError, getApiBaseUrl } from "@/api/client"
import { planTrip } from "@/api/trips"
import { tripPlanFixture } from "@/test/fixtures/trip-plan"
import type { TripPlanRequest } from "@/types/trip"

const payload: TripPlanRequest = {
  current_location: "Chicago, IL",
  pickup_location: "Indianapolis, IN",
  dropoff_location: "Dallas, TX",
  current_cycle_used_hours: 20,
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("trip API client", () => {
  it("uses the configured API base URL", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://backend.example.test/api/")
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(tripPlanFixture), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(planTrip(payload)).resolves.toEqual(tripPlanFixture)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.test/api/trips/plan/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    )
  })

  it("falls back to the local backend URL", () => {
    vi.stubEnv("VITE_API_BASE_URL", "")
    expect(getApiBaseUrl()).toBe("http://127.0.0.1:8000/api")
  })

  it("normalizes network failures without exposing fetch details", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("secret")))

    await expect(planTrip(payload)).rejects.toEqual(
      expect.objectContaining<ApiRequestError>({
        name: "ApiRequestError",
        status: 0,
        message: "Unable to reach the trip planning service.",
      }),
    )
  })
})
