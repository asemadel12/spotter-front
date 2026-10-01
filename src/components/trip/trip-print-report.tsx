import { DailyLogSheet } from "@/components/eld/daily-log-sheet"
import { getEventLabel } from "@/lib/eld"
import {
  formatDateTime,
  formatDistanceMiles,
  formatDuration,
} from "@/lib/formatting"
import type { TripPlanResponse } from "@/types/trip"

interface TripPrintReportProps {
  result: TripPlanResponse
}

export function TripPrintReport({ result }: TripPrintReportProps) {
  const summary = result.schedule.summary

  return (
    <div className="trip-print-report" aria-hidden="true">
      <section className="trip-print-section">
        <header className="border-b-2 border-slate-900 pb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            RouteLedger
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Trip Report
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            HOS trip plan, route instructions, and daily ELD records
          </p>
        </header>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          <PrintField label="Current location" value={result.locations.current_location.label} />
          <PrintField label="Pickup" value={result.locations.pickup_location.label} />
          <PrintField label="Drop-off" value={result.locations.dropoff_location.label} />
        </dl>

        <div className="mt-5 grid grid-cols-4 gap-3">
          <Metric label="Total distance" value={formatDistanceMiles(result.route.distance_meters)} />
          <Metric label="Route driving time" value={formatDuration(result.route.duration_seconds)} />
          <Metric label="Scheduled trip time" value={formatDuration(summary.scheduled_elapsed_seconds)} />
          <Metric label="ELD logs" value={String(result.daily_logs.summary.log_count)} />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          <Metric label="Fuel stops" value={String(summary.fuel_stops)} />
          <Metric label="30-min breaks" value={String(summary.breaks)} />
          <Metric label="Daily rests" value={String(summary.daily_rests)} />
          <Metric label="34-hour restarts" value={String(summary.cycle_restarts)} />
        </div>

        <h2 className="mt-8 text-xl font-semibold text-slate-950">Schedule</h2>
        <table className="mt-3 w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-y border-slate-400 bg-slate-100">
              <th className="px-2 py-2">Event</th>
              <th className="px-2 py-2">Start</th>
              <th className="px-2 py-2">End</th>
              <th className="px-2 py-2">Duration</th>
              <th className="px-2 py-2">Distance</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.schedule.events.map((event, index) => (
              <tr className="border-b border-slate-200" key={`${event.start}-${index}`}>
                <td className="px-2 py-2 font-medium">{getEventLabel(event.type)}</td>
                <td className="px-2 py-2">{formatDateTime(event.start)}</td>
                <td className="px-2 py-2">{formatDateTime(event.end)}</td>
                <td className="px-2 py-2">{formatDuration(event.duration_seconds)}</td>
                <td className="px-2 py-2">
                  {event.distance_meters > 0
                    ? formatDistanceMiles(event.distance_meters)
                    : "—"}
                </td>
                <td className="px-2 py-2">{event.status.replaceAll("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="trip-print-section trip-print-page-break">
        <h2 className="text-2xl font-semibold text-slate-950">Route Directions</h2>
        <p className="mt-1 text-sm text-slate-600">
          Turn-by-turn route guidance grouped around the pickup stop.
        </p>

        <div className="mt-5 space-y-6">
          {result.route.legs.map((leg, legIndex) => (
            <section key={`${leg.from}-${leg.to}`}>
              <h3 className="font-semibold text-slate-950">
                {legIndex === 0 ? "Current → Pickup" : "Pickup → Drop-off"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {formatDistanceMiles(leg.distance_meters)} · {formatDuration(leg.duration_seconds)}
              </p>
              <ol className="mt-3 space-y-2">
                {leg.steps.map((step, stepIndex) => (
                  <li
                    className="grid grid-cols-[28px_minmax(0,1fr)_120px] gap-2 border-b border-slate-200 pb-2 text-sm"
                    key={`${step.instruction}-${stepIndex}`}
                  >
                    <span className="font-semibold text-slate-500">{stepIndex + 1}.</span>
                    <span>{step.instruction}</span>
                    <span className="text-right text-xs text-slate-500">
                      {formatDistanceMiles(step.distance_meters)} · {formatDuration(step.duration_seconds)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </section>

      {result.daily_logs.logs.map((log) => (
        <section className="trip-print-section trip-print-page-break" key={log.date}>
          <DailyLogSheet log={log} locations={result.locations} />
        </section>
      ))}
    </div>
  )
}

function PrintField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-300 p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-300 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}
