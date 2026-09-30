import { EldLogHeader } from "@/components/eld/eld-log-header"
import { EldRemarks } from "@/components/eld/eld-remarks"
import { EldStatusGraph } from "@/components/eld/eld-status-graph"
import type { DailyLog, TripPlanResponse } from "@/types/trip"

interface DailyLogSheetProps {
  log: DailyLog
  locations: TripPlanResponse["locations"]
}

export function DailyLogSheet({ log, locations }: DailyLogSheetProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm" aria-label={`Daily log for ${log.date}`}>
      <EldLogHeader log={log} locations={locations} />
      <EldStatusGraph log={log} />
      <EldRemarks remarks={log.remarks} />
    </article>
  )
}
