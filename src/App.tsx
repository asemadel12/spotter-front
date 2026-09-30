import { AppHeader } from "@/components/layout/app-header"
import { PlanningEmptyState } from "@/components/trip/planning-empty-state"
import { PlanningLoadingState } from "@/components/trip/planning-loading-state"
import { TripPlannerForm } from "@/components/trip/trip-planner-form"
import { TripResults } from "@/components/trip/trip-results"
import { usePlanTrip } from "@/hooks/use-plan-trip"

function App() {
  const tripPlan = usePlanTrip()

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-semibold text-blue-700">Fleet operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Trip planning, with every duty hour accounted for.
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Build a truck-ready route with an HOS schedule, operational stops,
            and daily ELD log summaries from one validated trip request.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)] xl:gap-8">
          <TripPlannerForm
            isPending={tripPlan.isPending}
            onSubmit={(values) => tripPlan.mutateAsync(values)}
          />
          <section aria-label="Trip planning results" className="min-w-0">
            {tripPlan.isPending ? (
              <PlanningLoadingState />
            ) : tripPlan.data ? (
              <TripResults result={tripPlan.data} />
            ) : (
              <PlanningEmptyState />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
