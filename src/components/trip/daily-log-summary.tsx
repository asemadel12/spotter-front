import { CalendarCheck2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatHours, formatLogDate } from "@/lib/formatting"
import type { DailyLogsResult } from "@/types/trip"

interface DailyLogSummaryProps {
  dailyLogs: DailyLogsResult
}

export function DailyLogSummary({ dailyLogs }: DailyLogSummaryProps) {
  return (
    <Card>
      <CardHeader className="sm:flex sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle>Daily logs</CardTitle>
          <CardDescription>
            Summary of the backend-generated 24-hour log sheets.
          </CardDescription>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 sm:mt-0">
          <CalendarCheck2 className="size-4" aria-hidden="true" />
          {dailyLogs.summary.log_count} ELD log {dailyLogs.summary.log_count === 1 ? "sheet" : "sheets"} generated
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dailyLogs.logs.map((log) => (
            <article className="rounded-lg border border-slate-200 p-4" key={log.date}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-slate-900">
                  {formatLogDate(log.date)}
                </h3>
                <span className="text-sm font-semibold text-blue-700">
                  {log.driving_distance_miles.toFixed(1)} mi
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <LogTotal label="Driving" value={formatHours(log.totals.driving_seconds)} />
                <LogTotal
                  label="On duty"
                  value={formatHours(log.totals.on_duty_not_driving_seconds)}
                />
                <LogTotal
                  label="Sleeper"
                  value={formatHours(log.totals.sleeper_berth_seconds)}
                />
                <LogTotal
                  label="Off duty"
                  value={formatHours(log.totals.off_duty_seconds)}
                />
              </dl>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LogTotal({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  )
}
