import {
  BedDouble,
  CirclePause,
  Flag,
  Fuel,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { getEventLabel } from "@/lib/eld"
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
import type { HosEvent, HosEventType } from "@/types/hos"

interface TripTimelineProps {
  events: HosEvent[]
}

const EVENT_META: Record<
  HosEventType,
  { icon: LucideIcon; accent: string }
> = {
  DRIVING: { icon: Truck, accent: "bg-blue-600" },
  PICKUP: { icon: PackageCheck, accent: "bg-violet-600" },
  DROPOFF: { icon: Flag, accent: "bg-emerald-600" },
  BREAK: { icon: CirclePause, accent: "bg-amber-500" },
  FUEL: { icon: Fuel, accent: "bg-orange-500" },
  SLEEPER: { icon: BedDouble, accent: "bg-indigo-600" },
  CYCLE_RESTART: {
    icon: RotateCcw,
    accent: "bg-slate-700",
  },
}

export function TripTimeline({ events }: TripTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip timeline</CardTitle>
        <CardDescription>
          Chronological driving, service, break, and rest events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="max-h-[640px] space-y-0 overflow-y-auto pr-2">
          {events.map((event, index) => {
            const meta = EVENT_META[event.type]
            const Icon = meta.icon
            return (
              <li className="relative flex gap-3 pb-5" key={`${event.start}-${index}`}>
                {index < events.length - 1 && (
                  <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-slate-200" />
                )}
                <span
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-white ${meta.accent}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{getEventLabel(event.type)}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatDateTime(event.start)} – {formatDateTime(event.end)}
                      </p>
                    </div>
                    <Badge>{event.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span>{formatDuration(event.duration_seconds)}</span>
                    {event.distance_meters > 0 && (
                      <span>{formatDistanceMiles(event.distance_meters)}</span>
                    )}
                    <span>{event.location_label ?? humanizeLocation(event.location)}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

function humanizeLocation(location: string): string {
  const labels: Record<string, string> = {
    current_location: "Current location",
    pickup_location: "Pickup location",
    dropoff_location: "Drop-off location",
    en_route: "En route",
  }
  return labels[location] ?? (location.includes("_to_") ? "En route" : location)
}
