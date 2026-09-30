import "maplibre-gl/dist/maplibre-gl.css"

import {
  GeoJSONSource,
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl"
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import { useEffect, useRef } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatDateTime,
  formatDistanceMiles,
  formatDuration,
} from "@/lib/formatting"
import {
  deriveRouteStops,
  getPrimaryLocationMarkers,
  positionRouteStops,
  toRouteGeoJson,
} from "@/lib/route"
import type { PositionedRouteStop } from "@/types/route"
import type { TripPlanResponse } from "@/types/trip"

setWorkerUrl(workerUrl)

interface RouteMapProps {
  result: TripPlanResponse
}

export function RouteMap({ result }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<Marker[]>([])

  useEffect(() => {
    if (!containerRef.current) return
    const map = new Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-95, 38],
      zoom: 3,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl(), "top-right")
    mapRef.current = map

    return () => {
      clearMarkers(markersRef.current)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const renderRoute = () => {
      clearMarkers(markersRef.current)
      markersRef.current = []
      const geoJson = toRouteGeoJson(result.route.geometry)
      const source = map.getSource("trip-route") as GeoJSONSource | undefined
      if (source) source.setData(geoJson)
      else map.addSource("trip-route", { type: "geojson", data: geoJson })

      if (!map.getLayer("trip-route-line")) {
        map.addLayer({
          id: "trip-route-line",
          type: "line",
          source: "trip-route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#2563eb",
            "line-width": 5,
            "line-opacity": 0.88,
          },
        })
      }

      for (const marker of getPrimaryLocationMarkers(result.locations)) {
        const symbol =
          marker.id === "current_location"
            ? "C"
            : marker.id === "pickup_location"
              ? "P"
              : "D"
        const element = markerElement(
          `primary-marker primary-marker--${marker.id}`,
          marker.role,
          symbol,
        )
        const popup = new Popup({ offset: 18 }).setDOMContent(
          popupContent(marker.role, marker.label),
        )
        markersRef.current.push(
          new Marker({ element })
            .setLngLat(marker.coordinate)
            .setPopup(popup)
            .addTo(map),
        )
      }

      const stops = positionRouteStops(
        result.route.geometry,
        result.route.distance_meters,
        deriveRouteStops(result.schedule.events),
      )
      for (const stop of stops) {
        const element = markerElement(
          `stop-marker stop-marker--${stop.type.toLowerCase()}`,
          stop.label,
          stopSymbol(stop.type),
        )
        const popup = new Popup({ offset: 16 }).setDOMContent(stopPopup(stop))
        markersRef.current.push(
          new Marker({ element })
            .setLngLat(stop.coordinate)
            .setPopup(popup)
            .addTo(map),
        )
      }

      const coordinates = result.route.geometry.coordinates
      if (coordinates.length >= 2) {
        const bounds = coordinates.reduce(
          (currentBounds, coordinate) => currentBounds.extend(coordinate),
          new LngLatBounds(coordinates[0], coordinates[0]),
        )
        map.fitBounds(bounds, {
          padding: { top: 60, right: 60, bottom: 60, left: 60 },
          maxZoom: 11,
          duration: 0,
        })
      }
    }

    if (map.isStyleLoaded()) renderRoute()
    else map.once("load", renderRoute)

    return () => {
      map.off("load", renderRoute)
      clearMarkers(markersRef.current)
      markersRef.current = []
    }
  }, [result])

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Route overview</CardTitle>
        <CardDescription>
          {result.locations.current_location.label} → {result.locations.pickup_location.label} → {result.locations.dropoff_location.label}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 sm:px-0 sm:pb-0">
        <div
          ref={containerRef}
          className="h-[390px] w-full bg-slate-100 sm:h-[480px]"
          aria-label="Interactive trip route map"
          role="region"
        />
      </CardContent>
    </Card>
  )
}

function clearMarkers(markers: Marker[]) {
  markers.forEach((marker) => marker.remove())
}

function markerElement(className: string, label: string, symbol: string) {
  const element = document.createElement("button")
  element.type = "button"
  element.className = className
  element.textContent = symbol
  element.setAttribute("aria-label", label)
  return element
}

function popupContent(title: string, label: string) {
  const container = document.createElement("div")
  const heading = document.createElement("strong")
  const detail = document.createElement("p")
  heading.textContent = title
  detail.textContent = label
  container.append(heading, detail)
  return container
}

function stopPopup(stop: PositionedRouteStop) {
  const container = popupContent(stop.label, "En route")
  const details = document.createElement("p")
  details.textContent = `${formatDateTime(stop.start)} · ${formatDuration(stop.durationSeconds)} · ${formatDistanceMiles(stop.distanceMeters)} into trip`
  container.append(details)
  return container
}

function stopSymbol(type: PositionedRouteStop["type"]) {
  return {
    BREAK: "Ⅱ",
    FUEL: "F",
    SLEEPER: "Z",
    CYCLE_RESTART: "↻",
  }[type]
}
