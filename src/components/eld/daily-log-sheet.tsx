import { EldRemarks } from "@/components/eld/eld-remarks"
import { PaperEldLog } from "@/components/eld/paper-eld-log"
import type { DailyLog } from "@/types/eld"
import type { TripLocations } from "@/types/trip"

interface DailyLogSheetProps {
  log: DailyLog
  locations: TripLocations
}

export function DailyLogSheet({ log, locations }: DailyLogSheetProps) {
  return (
    <article
      className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm"
      aria-label={`Daily log for ${log.date}`}
    >
      <PaperEldLog log={log} locations={locations} />
      <EldRemarks remarks={log.remarks} />
    </article>
  )
}
