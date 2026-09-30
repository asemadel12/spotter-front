import { MapPinned } from "lucide-react"

import { Card } from "@/components/ui/card"

export function PlanningEmptyState() {
  return (
    <Card className="flex min-h-[420px] items-center justify-center border-dashed bg-slate-50/50 p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <MapPinned className="size-7" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Your planned trip will appear here
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Plan a trip to see the HGV route, HOS schedule, operational stops,
          turn-by-turn directions, and generated daily logs.
        </p>
      </div>
    </Card>
  )
}
