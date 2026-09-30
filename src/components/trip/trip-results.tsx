import { DailyEldLogs } from "@/components/eld/daily-eld-logs"
import { RouteInstructions } from "@/components/trip/route-instructions"
import { RouteMap } from "@/components/trip/route-map"
import { TripSummary } from "@/components/trip/trip-summary"
import { TripTimeline } from "@/components/trip/trip-timeline"
import type { TripPlanResponse } from "@/types/trip"

interface TripResultsProps {
  result: TripPlanResponse
}

export function TripResults({ result }: TripResultsProps) {
  return (
    <div className="space-y-5">
      <TripSummary result={result} />
      <RouteMap result={result} />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <TripTimeline events={result.schedule.events} />
        <RouteInstructions legs={result.route.legs} />
      </div>
      <DailyEldLogs dailyLogs={result.daily_logs} locations={result.locations} />
    </div>
  )
}
