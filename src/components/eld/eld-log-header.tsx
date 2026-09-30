import { Route } from "lucide-react"
import type { ReactNode } from "react"

import { formatLogDate } from "@/lib/formatting"
import type { DailyLog } from "@/types/eld"
import type { TripLocations } from "@/types/trip"

interface EldLogHeaderProps {
  log: DailyLog
  locations: TripLocations
}

const unavailableFields = [
  "Driver",
  "Carrier",
  "Truck / Tractor",
  "Trailer",
  "Shipping Docs",
]

export function EldLogHeader({ log, locations }: EldLogHeaderProps) {
  const route = [
    locations.current_location.label,
    locations.pickup_location.label,
    locations.dropoff_location.label,
  ]

  return (
    <header className="border-b border-slate-300 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            24 Hours
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Driver&apos;s Daily Log
          </h3>
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Miles driven today
          </p>
          <p className="text-xl font-semibold tabular-nums text-slate-950">
            {log.driving_distance_miles.toFixed(1)} mi
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-px overflow-hidden rounded-lg border border-slate-300 bg-slate-300 sm:grid-cols-2 lg:grid-cols-4">
        <Metadata label="Date">
          <time dateTime={log.date}>{formatLogDate(log.date)}</time>
        </Metadata>
        <Metadata label="Time standard">{log.timezone}</Metadata>
        <Metadata label="Record period">00:00–24:00</Metadata>
        <Metadata label="Daily distance">
          {log.driving_distance_miles.toFixed(1)} miles
        </Metadata>
      </dl>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-2">
          <Route className="mt-0.5 size-4 shrink-0 text-blue-700" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Route context
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-800">
              {route.map((label, index) => (
                <span key={label}>
                  {index > 0 && <span className="mx-2 text-slate-400">→</span>}
                  {label}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-dashed border-slate-300 pt-4 text-sm sm:grid-cols-3 lg:grid-cols-5">
        {unavailableFields.map((field) => (
          <div key={field}>
            <dt className="text-xs text-slate-500">{field}</dt>
            <dd className="mt-1 font-medium text-slate-700" aria-label={`${field}: not provided`}>
              —
            </dd>
          </div>
        ))}
      </dl>
      <p className="sr-only">
        Driver, carrier, truck or tractor, trailer, and shipping document information was not provided.
      </p>
    </header>
  )
}

function Metadata({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-900">{children}</dd>
    </div>
  )
}
