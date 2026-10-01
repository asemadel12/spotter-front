import { describe, expect, it } from "vitest"

import { tripPlanSchema } from "@/components/trip/trip-planner-form.logic"

const VALID_TRIP = {
  current_location: "Chicago, IL",
  pickup_location: "St. Louis, MO",
  dropoff_location: "Dallas, TX",
  current_cycle_used_hours: 20,
}

const LOCATION_FIELDS = [
  "current_location",
  "pickup_location",
  "dropoff_location",
] as const

describe("trip planner user input matrix", () => {
  it.each([
    ["city and state", "Chicago, IL"],
    ["full street address", "233 S Wacker Dr, Chicago, IL"],
    ["venue or POI text", "New York Engine Company 233, New York, NY"],
    ["hyphen and apostrophe", "O'Fallon-Saint Clair, IL"],
    ["unicode text", "San José, CA"],
    ["maximum length", "a".repeat(255)],
  ])("accepts %s location input", (_label, value) => {
    for (const field of LOCATION_FIELDS) {
      expect(
        tripPlanSchema.safeParse({
          ...VALID_TRIP,
          [field]: value,
        }).success,
      ).toBe(true)
    }
  })

  it.each([
    ["empty string", ""],
    ["spaces only", "   "],
    ["tabs and newlines only", "\t\n"],
    ["over 255 characters", "a".repeat(256)],
    ["null", null],
    ["undefined", undefined],
    ["number", 123],
    ["boolean", true],
    ["array", ["Chicago"]],
    ["object", { city: "Chicago" }],
  ])("rejects %s for every location field", (_label, value) => {
    for (const field of LOCATION_FIELDS) {
      expect(
        tripPlanSchema.safeParse({
          ...VALID_TRIP,
          [field]: value,
        }).success,
      ).toBe(false)
    }
  })

  it.each([0, 0.1, 1, 20.5, 69.999, 70])(
    "accepts valid cycle usage %s",
    (value) => {
      expect(
        tripPlanSchema.safeParse({
          ...VALID_TRIP,
          current_cycle_used_hours: value,
        }).success,
      ).toBe(true)
    },
  )

  it.each([
    -0.001,
    -1,
    70.001,
    71,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    null,
    undefined,
    "20",
    "",
    true,
    [],
    {},
  ])("rejects invalid cycle usage %s", (value) => {
    expect(
      tripPlanSchema.safeParse({
        ...VALID_TRIP,
        current_cycle_used_hours: value,
      }).success,
    ).toBe(false)
  })

  it("trims all three locations before submission", () => {
    expect(
      tripPlanSchema.parse({
        current_location: "  Chicago, IL  ",
        pickup_location: "\tSt. Louis, MO\n",
        dropoff_location: "  Dallas, TX ",
        current_cycle_used_hours: 0,
      }),
    ).toEqual({
      current_location: "Chicago, IL",
      pickup_location: "St. Louis, MO",
      dropoff_location: "Dallas, TX",
      current_cycle_used_hours: 0,
    })
  })

  it("allows equal location text because the trip may start at pickup", () => {
    expect(
      tripPlanSchema.safeParse({
        current_location: "Dallas, TX",
        pickup_location: "Dallas, TX",
        dropoff_location: "Houston, TX",
        current_cycle_used_hours: 10,
      }).success,
    ).toBe(true)
  })
})
