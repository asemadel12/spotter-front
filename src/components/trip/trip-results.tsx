import { RouteMap } from "@/components/trip/route-map"
import { TripPrintReport } from "@/components/trip/trip-print-report"
import { TripReportActions } from "@/components/trip/trip-report-actions"
import { TripResultsWorkspace } from "@/components/trip/trip-results-workspace"
import { TripSummary } from "@/components/trip/trip-summary"
import type { TripPlanResponse } from "@/types/trip"

interface TripResultsProps {
  result: TripPlanResponse
}

export function TripResults({ result }: TripResultsProps) {
  return (
    <>
      <div className="trip-screen-results space-y-5">
        <TripSummary result={result} />
        <TripReportActions />
        <RouteMap result={result} />
        <TripResultsWorkspace result={result} />
      </div>

      <TripPrintReport result={result} />
    </>
  )
}
