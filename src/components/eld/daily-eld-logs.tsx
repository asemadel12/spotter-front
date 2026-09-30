import { CalendarCheck2 } from "lucide-react"
import { useState } from "react"

import { DailyLogSheet } from "@/components/eld/daily-log-sheet"
import { EldLogTabs } from "@/components/eld/eld-log-tabs"
import type { DailyLogsResult } from "@/types/eld"
import type { TripLocations } from "@/types/trip"

interface DailyEldLogsProps {
  dailyLogs: DailyLogsResult
  locations: TripLocations
}

export function DailyEldLogs({ dailyLogs, locations }: DailyEldLogsProps) {
  const [selection, setSelection] = useState({
    logs: dailyLogs.logs,
    index: 0,
  })
  const selectedIndex = selection.logs === dailyLogs.logs ? selection.index : 0

  const selectedLog = dailyLogs.logs[selectedIndex] ?? dailyLogs.logs[0]

  return (
    <section className="space-y-4" aria-labelledby="daily-eld-logs-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="daily-eld-logs-heading" className="text-xl font-semibold tracking-tight text-slate-950">
            Daily ELD Logs
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Generated from the HOS schedule. Each sheet represents one 24-hour record of duty status.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <CalendarCheck2 className="size-4" aria-hidden="true" />
          {dailyLogs.summary.log_count} ELD log {dailyLogs.summary.log_count === 1 ? "sheet" : "sheets"} generated
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <EldLogTabs
          logs={dailyLogs.logs}
          selectedIndex={selectedIndex}
          onSelect={(index) => setSelection({ logs: dailyLogs.logs, index })}
        />
        {dailyLogs.logs.length > 1 && (
          <p className="text-xs font-medium text-slate-500">
            Day {selectedIndex + 1} of {dailyLogs.logs.length}
          </p>
        )}
      </div>

      {selectedLog ? (
        <DailyLogSheet log={selectedLog} locations={locations} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No daily log sheets were generated for this trip.
        </div>
      )}
    </section>
  )
}
