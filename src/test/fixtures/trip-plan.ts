import type { TripPlanResponse } from "@/types/trip"

export const tripPlanFixture: TripPlanResponse = {
  status: "planned",
  trip: {
    current_location: "Chicago, IL",
    pickup_location: "St. Louis, MO",
    dropoff_location: "Dallas, TX",
    current_cycle_used_hours: 20,
  },
  locations: {
    current_location: {
      input: "Chicago, IL",
      label: "Chicago, Cook County, Illinois, USA",
      latitude: 41.8781,
      longitude: -87.6298,
    },
    pickup_location: {
      input: "St. Louis, MO",
      label: "St. Louis, Missouri, USA",
      latitude: 38.627,
      longitude: -90.1994,
    },
    dropoff_location: {
      input: "Dallas, TX",
      label: "Dallas, Dallas County, Texas, USA",
      latitude: 32.7767,
      longitude: -96.797,
    },
  },
  route: {
    distance_meters: 1_500_000,
    duration_seconds: 57_600,
    geometry: {
      type: "LineString",
      coordinates: [
        [-87.6298, 41.8781],
        [-90.1994, 38.627],
        [-93.2923, 37.2089],
        [-96.797, 32.7767],
      ],
    },
    legs: [
      {
        from: "current_location",
        to: "pickup_location",
        distance_meters: 700_000,
        duration_seconds: 28_800,
        steps: [
          {
            instruction: "Head south on South Michigan Avenue",
            distance_meters: 350_000,
            duration_seconds: 14_400,
            type: 11,
            way_points: [0, 1],
          },
          {
            instruction: "Continue toward St. Louis",
            distance_meters: 350_000,
            duration_seconds: 14_400,
            type: 6,
            way_points: [1, 2],
          },
        ],
      },
      {
        from: "pickup_location",
        to: "dropoff_location",
        distance_meters: 800_000,
        duration_seconds: 28_800,
        steps: [
          {
            instruction: "Take the ramp toward Springfield",
            distance_meters: 400_000,
            duration_seconds: 14_400,
            type: 12,
            way_points: [2, 3],
          },
          {
            instruction: "Continue southwest toward Dallas",
            distance_meters: 400_000,
            duration_seconds: 14_400,
            type: 6,
            way_points: [3, 4],
          },
        ],
      },
    ],
  },
  schedule: {
    summary: {
      total_trip_distance_meters: 1_500_000,
      route_driving_seconds: 57_600,
      scheduled_elapsed_seconds: 104_400,
      driving_seconds: 57_600,
      on_duty_not_driving_seconds: 7_200,
      sleeper_seconds: 36_000,
      fuel_stops: 1,
      breaks: 1,
      daily_rests: 1,
      cycle_restarts: 0,
      ending_cycle_used_hours: 38,
    },
    events: [
      { type: "DRIVING", status: "DRIVING", start: "2026-01-01T08:00:00Z", end: "2026-01-01T12:00:00Z", duration_seconds: 14_400, distance_meters: 350_000, location: "en_route", reason: "Route travel" },
      { type: "PICKUP", status: "ON_DUTY_NOT_DRIVING", start: "2026-01-01T12:00:00Z", end: "2026-01-01T13:00:00Z", duration_seconds: 3_600, distance_meters: 0, location: "pickup_location", reason: "Pickup service" },
      { type: "DRIVING", status: "DRIVING", start: "2026-01-01T13:00:00Z", end: "2026-01-01T17:00:00Z", duration_seconds: 14_400, distance_meters: 350_000, location: "en_route", reason: "Route travel" },
      { type: "BREAK", status: "OFF_DUTY", start: "2026-01-01T17:00:00Z", end: "2026-01-01T17:30:00Z", duration_seconds: 1_800, distance_meters: 0, location: "en_route", reason: "Required 30-minute break" },
      { type: "DRIVING", status: "DRIVING", start: "2026-01-01T17:30:00Z", end: "2026-01-01T21:30:00Z", duration_seconds: 14_400, distance_meters: 400_000, location: "en_route", reason: "Route travel" },
      { type: "FUEL", status: "ON_DUTY_NOT_DRIVING", start: "2026-01-01T21:30:00Z", end: "2026-01-01T22:00:00Z", duration_seconds: 1_800, distance_meters: 0, location: "en_route", reason: "Fuel stop" },
      { type: "SLEEPER", status: "SLEEPER_BERTH", start: "2026-01-01T22:00:00Z", end: "2026-01-02T08:00:00Z", duration_seconds: 36_000, distance_meters: 0, location: "en_route", reason: "Daily rest" },
      { type: "DRIVING", status: "DRIVING", start: "2026-01-02T08:00:00Z", end: "2026-01-02T12:00:00Z", duration_seconds: 14_400, distance_meters: 400_000, location: "en_route", reason: "Route travel" },
      { type: "DROPOFF", status: "ON_DUTY_NOT_DRIVING", start: "2026-01-02T12:00:00Z", end: "2026-01-02T13:00:00Z", duration_seconds: 3_600, distance_meters: 0, location: "dropoff_location", reason: "Drop-off service" },
    ],
  },
  daily_logs: {
    summary: {
      log_count: 2,
      start_date: "2026-01-01",
      end_date: "2026-01-02",
      total_driving_distance_meters: 1_500_000,
      total_driving_distance_miles: 932.1,
    },
    logs: [
      {
        date: "2026-01-01",
        timezone: "UTC",
        driving_distance_meters: 1_100_000,
        driving_distance_miles: 683.5,
        totals: { off_duty_seconds: 28_800, sleeper_berth_seconds: 7_200, driving_seconds: 43_200, on_duty_not_driving_seconds: 7_200, total_seconds: 86_400 },
        segments: [], events: [], remarks: [],
      },
      {
        date: "2026-01-02",
        timezone: "UTC",
        driving_distance_meters: 400_000,
        driving_distance_miles: 248.5,
        totals: { off_duty_seconds: 39_600, sleeper_berth_seconds: 28_800, driving_seconds: 14_400, on_duty_not_driving_seconds: 3_600, total_seconds: 86_400 },
        segments: [], events: [], remarks: [],
      },
    ],
  },
}
