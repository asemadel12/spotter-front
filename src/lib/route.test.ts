import { describe, expect, it } from "vitest"

import {
  coordinateAlongRoute,
  deriveRouteStops,
  getPrimaryLocationMarkers,
  positionRouteStops,
  toRouteGeoJson,
} from "@/lib/route"
import { tripPlanFixture } from "@/test/fixtures/trip-plan"
import type { HosEvent, RouteGeometry } from "@/types/trip"

const event = (
  type: HosEvent["type"],
  distanceMeters?: number,
): HosEvent => ({
  type,
  status: type === "DRIVING" ? "DRIVING" : "OFF_DUTY",
  start: "2026-01-01T08:00:00Z",
  end: "2026-01-01T09:00:00Z",
  duration_seconds: 3_600,
  distance_meters: distanceMeters ?? 0,
  location: "en_route",
  reason: "Test event",
})

describe("route stop derivation", () => {
  const events: HosEvent[] = [
    event("PICKUP"),
    event("DRIVING", 100),
    event("BREAK"),
    event("DRIVING", 50),
    event("FUEL"),
    event("SLEEPER"),
    event("CYCLE_RESTART"),
    event("DROPOFF"),
  ]

  it("accumulates only driving distance", () => {
    expect(deriveRouteStops(events).map((stop) => stop.distanceMeters)).toEqual([
      100, 150, 150, 150,
    ])
  })

  it.each(["BREAK", "FUEL", "SLEEPER", "CYCLE_RESTART"] as const)(
    "creates a marker for %s events",
    (type) => {
      expect(deriveRouteStops(events).some((stop) => stop.type === type)).toBe(
        true,
      )
    },
  )

  it("does not create pickup or drop-off stop markers", () => {
    const types = deriveRouteStops(events).map((stop) => stop.type)
    expect(types).not.toContain("PICKUP")
    expect(types).not.toContain("DROPOFF")
  })
})

describe("route geometry positioning", () => {
  const geometry: RouteGeometry = {
    type: "LineString",
    coordinates: [
      [0, 0],
      [10, 0],
    ],
  }

  it("clamps route fractions to the line boundaries", () => {
    expect(coordinateAlongRoute(geometry, 100, -10)?.[0]).toBeCloseTo(0)
    expect(coordinateAlongRoute(geometry, 100, 150)?.[0]).toBeCloseTo(10)
  })

  it("returns longitude-latitude coordinates for valid geometry", () => {
    const coordinate = coordinateAlongRoute(geometry, 100, 50)
    expect(coordinate?.[0]).toBeCloseTo(5)
    expect(coordinate?.[1]).toBeCloseTo(0)
  })

  it("fails safely for empty or malformed geometry", () => {
    expect(
      coordinateAlongRoute({ type: "LineString", coordinates: [] }, 100, 10),
    ).toBeNull()
    expect(
      coordinateAlongRoute(
        { type: "LineString", coordinates: [[Number.NaN, 0]] },
        100,
        10,
      ),
    ).toBeNull()
  })

  it("positions every route stop without changing its progress", () => {
    const positioned = positionRouteStops(
      geometry,
      100,
      deriveRouteStops([event("DRIVING", 50), event("BREAK")]),
    )
    expect(positioned).toHaveLength(1)
    expect(positioned[0].distanceMeters).toBe(50)
    expect(positioned[0].coordinate[0]).toBeCloseTo(5)
  })
})

describe("backend coordinate preservation", () => {
  it("passes the backend GeoJSON route through unchanged", () => {
    const geoJson = toRouteGeoJson(tripPlanFixture.route.geometry)
    expect(geoJson.geometry.coordinates).toEqual(
      tripPlanFixture.route.geometry.coordinates,
    )
  })

  it("uses longitude then latitude for primary markers", () => {
    const markers = getPrimaryLocationMarkers(tripPlanFixture.locations)
    expect(markers[0].coordinate).toEqual([-87.6298, 41.8781])
    expect(markers[1].coordinate).toEqual([-90.1994, 38.627])
    expect(markers[2].coordinate).toEqual([-96.797, 32.7767])
  })

  it("never reverses latitude and longitude", () => {
    const [current] = getPrimaryLocationMarkers(tripPlanFixture.locations)
    expect(current.coordinate).not.toEqual([41.8781, -87.6298])
  })
})
