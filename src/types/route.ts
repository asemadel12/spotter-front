export type Coordinate = [longitude: number, latitude: number]

export interface LocationSuggestion {
  label: string
  latitude: number
  longitude: number
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

export type RouteStopType = "BREAK" | "FUEL" | "SLEEPER" | "CYCLE_RESTART"

export interface RouteStop {
  id: string
  type: RouteStopType
  distanceMeters: number
  label: string
  locationLabel?: string
  start: string
  durationSeconds: number
}

export interface PositionedRouteStop extends RouteStop {
  coordinate: Coordinate
}
