import { BookOpenText, ListChecks, NotebookTabs } from "lucide-react"
import { useState } from "react"

import { DailyEldLogs } from "@/components/eld/daily-eld-logs"
import { RouteInstructions } from "@/components/trip/route-instructions"
import { TripTimeline } from "@/components/trip/trip-timeline"
import type { TripPlanResponse } from "@/types/trip"

interface TripResultsWorkspaceProps {
  result: TripPlanResponse
}

type ResultsTab = "schedule" | "directions" | "eld"

const tabs: Array<{
  id: ResultsTab
  label: string
  icon: typeof ListChecks
}> = [
  { id: "schedule", label: "Schedule", icon: ListChecks },
  { id: "directions", label: "Directions", icon: BookOpenText },
  { id: "eld", label: "Daily ELD Logs", icon: NotebookTabs },
]

export function TripResultsWorkspace({ result }: TripResultsWorkspaceProps) {
  const [selection, setSelection] = useState({
    result,
    tab: "schedule" as ResultsTab,
  })
  const activeTab = selection.result === result ? selection.tab : "schedule"

  return (
    <section
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-label="Trip details"
    >
      <div
        className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-2 pt-2"
        role="tablist"
        aria-label="Trip result sections"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = activeTab === id
          return (
            <button
              key={id}
              id={`trip-results-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`trip-results-panel-${id}`}
              className={[
                "inline-flex min-w-max items-center gap-2 rounded-t-lg border-b-2 px-4 py-3 text-sm font-medium transition",
                selected
                  ? "border-blue-600 bg-white text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800",
              ].join(" ")}
              onClick={() => setSelection({ result, tab: id })}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>

      <div className="p-4 sm:p-5">
        <div
          id="trip-results-panel-schedule"
          role="tabpanel"
          aria-labelledby="trip-results-tab-schedule"
          hidden={activeTab !== "schedule"}
        >
          {activeTab === "schedule" && (
            <TripTimeline events={result.schedule.events} />
          )}
        </div>

        <div
          id="trip-results-panel-directions"
          role="tabpanel"
          aria-labelledby="trip-results-tab-directions"
          hidden={activeTab !== "directions"}
        >
          {activeTab === "directions" && (
            <RouteInstructions legs={result.route.legs} />
          )}
        </div>

        <div
          id="trip-results-panel-eld"
          role="tabpanel"
          aria-labelledby="trip-results-tab-eld"
          hidden={activeTab !== "eld"}
        >
          {activeTab === "eld" && (
            <DailyEldLogs
              dailyLogs={result.daily_logs}
              locations={result.locations}
            />
          )}
        </div>
      </div>
    </section>
  )
}
