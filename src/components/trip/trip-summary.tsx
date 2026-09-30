import { CalendarDays, Clock3, Fuel, Gauge, TimerReset } from "lucide-react"

import { Card } from "@/components/ui/card"
import { formatDistanceMiles, formatDuration } from "@/lib/formatting"
import type { TripPlanResponse } from "@/types/trip"

interface TripSummaryProps {
  result: TripPlanResponse
}

export function TripSummary({ result }: TripSummaryProps) {
  const metrics = [
    {
      label: "Total Distance",
      value: formatDistanceMiles(result.route.distance_meters),
      icon: Gauge,
    },
    {
      label: "Route Driving Time",
      value: formatDuration(result.route.duration_seconds),
      icon: Clock3,
    },
    {
      label: "Scheduled Trip Time",
      value: formatDuration(result.schedule.summary.scheduled_elapsed_seconds),
      icon: TimerReset,
    },
    {
      label: "ELD Logs",
      value: `${result.daily_logs.summary.log_count}`,
      icon: CalendarDays,
    },
  ]

  return (
    <section aria-label="Trip summary" className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card className="p-4" key={label}>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Icon className="size-4 text-blue-600" aria-hidden="true" />
              {label}
            </div>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              {value}
            </p>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full border bg-white px-3 py-1.5">
          <Fuel className="mr-1.5 inline size-3.5 text-amber-600" />
          {countLabel(result.schedule.summary.fuel_stops, "fuel stop")}
        </span>
        <span className="rounded-full border bg-white px-3 py-1.5">
          {countLabel(result.schedule.summary.breaks, "break")}
        </span>
        <span className="rounded-full border bg-white px-3 py-1.5">
          {countLabel(result.schedule.summary.daily_rests, "daily rest")}
        </span>
        <span className="rounded-full border bg-white px-3 py-1.5">
          {countLabel(result.schedule.summary.cycle_restarts, "cycle restart")}
        </span>
      </div>
    </section>
  )
}


function countLabel(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? "" : "s"}`
}
