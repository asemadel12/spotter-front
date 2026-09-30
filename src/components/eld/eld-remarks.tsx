import { MapPin } from "lucide-react"

import { getEventLabel } from "@/lib/eld"
import { formatDistanceMiles } from "@/lib/formatting"
import type { DailyLogRemark } from "@/types/trip"

interface EldRemarksProps {
  remarks: DailyLogRemark[]
}

export function EldRemarks({ remarks }: EldRemarksProps) {
  const chronologicalRemarks = [...remarks].sort(
    (left, right) => left.second_of_day - right.second_of_day,
  )

  return (
    <section className="border-t border-slate-300 p-5 sm:p-6" aria-labelledby="eld-remarks-heading">
      <div className="flex items-center justify-between gap-3">
        <h4 id="eld-remarks-heading" className="text-xs font-bold tracking-[0.16em] text-slate-700">
          REMARKS
        </h4>
        <span className="text-xs text-slate-500">Chronological event record</span>
      </div>
      {chronologicalRemarks.length ? (
        <ol className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
          {chronologicalRemarks.map((remark, index) => (
            <li
              className="grid gap-1 py-3 text-sm sm:grid-cols-[62px_150px_minmax(0,1fr)] sm:items-baseline"
              key={`${remark.second_of_day}-${remark.event_type}-${index}`}
            >
              <time className="font-semibold tabular-nums text-slate-950">{remark.time}</time>
              <span className="font-medium text-slate-800">{getEventLabel(remark.event_type)}</span>
              <span className="flex min-w-0 flex-wrap items-center gap-x-2 text-slate-600">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  {remark.location.label}
                </span>
                {remark.route_distance_traveled_meters !== undefined && (
                  <span className="text-slate-500">
                    · {formatDistanceMiles(remark.route_distance_traveled_meters)} into trip
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
          No duty-status remarks were recorded for this day.
        </p>
      )}
    </section>
  )
}
