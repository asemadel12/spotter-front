import { ChevronDown, Navigation } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDistanceMiles, formatDuration } from "@/lib/formatting"
import type { RouteLeg } from "@/types/route"

interface RouteInstructionsProps {
  legs: RouteLeg[]
}

const LEG_LABELS = ["Current → Pickup", "Pickup → Drop-off"]

export function RouteInstructions({ legs }: RouteInstructionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Route instructions</CardTitle>
        <CardDescription>
          Turn-by-turn guidance grouped around the pickup stop.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {legs.map((leg, legIndex) => (
          <details
            className="group rounded-lg border border-slate-200 bg-white"
            key={`${leg.from}-${leg.to}`}
            open={legIndex === 0}
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Navigation className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {LEG_LABELS[legIndex] ?? `Route leg ${legIndex + 1}`}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceMiles(leg.distance_meters)} · {formatDuration(leg.duration_seconds)}
                </span>
              </span>
              <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-blue-700">
                <span className="group-open:hidden">Show steps</span>
                <span className="hidden group-open:inline">Hide steps</span>
                <span className="flex size-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 transition group-open:bg-blue-100">
                  <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                </span>
              </span>
            </summary>
            <ol className="border-t border-slate-100 px-4 py-2">
              {leg.steps.map((step, stepIndex) => (
                <li
                  className="flex gap-3 border-b border-slate-100 py-3 last:border-0"
                  key={`${step.instruction}-${stepIndex}`}
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                    {stepIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800">{step.instruction}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDistanceMiles(step.distance_meters)} · {formatDuration(step.duration_seconds)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </CardContent>
    </Card>
  )
}
