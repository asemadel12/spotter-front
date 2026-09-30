import { Truck } from "lucide-react"

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1480px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Truck className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold tracking-tight text-slate-950">
            Spotter Trip Planner
          </p>
          <p className="text-xs text-slate-500">
            HOS-compliant route &amp; ELD planning
          </p>
        </div>
      </div>
    </header>
  )
}
