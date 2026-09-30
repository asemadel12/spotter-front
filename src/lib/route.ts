import along from "@turf/along"
import { lineString } from "@turf/helpers"
import length from "@turf/length"

import type { HosEvent } from "@/types/hos"
import type {
  Coordinate,
  PositionedRouteStop,
  RouteGeometry,
  RouteStop,
  RouteStopType,
} from "@/types/route"
import type { TripLocations } from "@/types/trip"

const STOP_LABELS: Record<RouteStopType, string> = {
  BREAK: "30-min break",
  FUEL: "Fuel stop",
  SLEEPER: "Sleeper rest",
  CYCLE_RESTART: "34-hour restart",
}

const STOP_TYPES = new Set<RouteStopType>([
  "BREAK",
  "FUEL",
  "SLEEPER",
  "CYCLE_RESTART",
])

export function deriveRouteStops(events: HosEvent[]): RouteStop[] {
  let cumulativeDistance = 0
  const stops: RouteStop[] = []
  events.forEach((event, index) => {
    if (event.type === "DRIVING") {
      cumulativeDistance += event.distance_meters
      return
    }
    if (!STOP_TYPES.has(event.type as RouteStopType)) return
    const type = event.type as RouteStopType
    stops.push({
      id: `${type.toLowerCase()}-${index}`,
      type,
      distanceMeters: cumulativeDistance,
      label: STOP_LABELS[type],
      start: event.start,
      durationSeconds: event.duration_seconds,
    })
  })
  return stops
}

export function coordinateAlongRoute(
  geometry: RouteGeometry,
  routeDistanceMeters: number,
  distanceMeters: number,
): Coordinate | null {
  if (
    geometry.type !== "LineString" ||
    geometry.coordinates.length < 2 ||
    !Number.isFinite(routeDistanceMeters) ||
    routeDistanceMeters <= 0
  ) {
    return null
  }
  if (!geometry.coordinates.every(isCoordinate)) return null

  try {
    const routeLine = lineString(geometry.coordinates)
    const geometryLengthKm = length(routeLine, { units: "kilometers" })
    if (!Number.isFinite(geometryLengthKm) || geometryLengthKm <= 0) return null
    const fraction = Math.min(
      1,
      Math.max(0, distanceMeters / routeDistanceMeters),
    )
    const point = along(routeLine, geometryLengthKm * fraction, {
      units: "kilometers",
    })
    const [longitude, latitude] = point.geometry.coordinates
    return isCoordinate([longitude, latitude]) ? [longitude, latitude] : null
  } catch {
    return null
  }
}

export function positionRouteStops(
  geometry: RouteGeometry,
  routeDistanceMeters: number,
  stops: RouteStop[],
): PositionedRouteStop[] {
  return stops.flatMap((stop) => {
    const coordinate = coordinateAlongRoute(
      geometry,
      routeDistanceMeters,
      stop.distanceMeters,
    )
    return coordinate ? [{ ...stop, coordinate }] : []
  })
}

export function toRouteGeoJson(geometry: RouteGeometry) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: geometry.coordinates,
    },
  }
}

export function getPrimaryLocationMarkers(locations: TripLocations) {
  return [
    {
      id: "current_location" as const,
      role: "Current location",
      label: locations.current_location.label,
      coordinate: [
        locations.current_location.longitude,
        locations.current_location.latitude,
      ] as Coordinate,
    },
    {
      id: "pickup_location" as const,
      role: "Pickup",
      label: locations.pickup_location.label,
      coordinate: [
        locations.pickup_location.longitude,
        locations.pickup_location.latitude,
      ] as Coordinate,
    },
    {
      id: "dropoff_location" as const,
      role: "Drop-off",
      label: locations.dropoff_location.label,
      coordinate: [
        locations.dropoff_location.longitude,
        locations.dropoff_location.latitude,
      ] as Coordinate,
    },
  ]
}

function isCoordinate(value: number[]): value is Coordinate {
  return (
    value.length >= 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  )
}
