import { formatLogDate } from "@/lib/formatting"
import type { DailyLog } from "@/types/eld"

interface EldLogTabsProps {
  logs: DailyLog[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function EldLogTabs({ logs, selectedIndex, onSelect }: EldLogTabsProps) {
  if (logs.length <= 1) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Select daily log">
      {logs.map((log, index) => {
        const selected = selectedIndex === index
        return (
          <button
            key={`${log.date}-${index}`}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(index)}
            className={`min-w-28 rounded-lg border px-4 py-2.5 text-left transition focus-visible:ring-2 focus-visible:ring-blue-500 ${
              selected
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="block text-xs font-semibold">Day {index + 1}</span>
            <span className={`mt-0.5 block text-xs ${selected ? "text-blue-100" : "text-slate-500"}`}>
              {formatLogDate(log.date)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
