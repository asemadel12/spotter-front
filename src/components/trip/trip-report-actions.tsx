import { FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"

export function TripReportActions() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <p className="text-xs text-slate-500">
        Print the complete report. For a clean PDF, disable browser Headers and footers.
      </p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => window.print()}
      >
        <FileDown className="size-4" aria-hidden="true" />
        Print / Save PDF
      </Button>
    </div>
  )
}
