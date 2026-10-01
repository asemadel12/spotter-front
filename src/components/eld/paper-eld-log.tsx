import { useId } from "react"

import { buildDutyTrace, getEventLabel } from "@/lib/eld"
import { formatLogDate } from "@/lib/formatting"
import type { DailyLog, DailyLogTotals } from "@/types/eld"
import type { DutyStatus } from "@/types/hos"
import type { TripLocations } from "@/types/trip"

interface PaperEldLogProps {
  log: DailyLog
  locations: TripLocations
}

const PAPER_WIDTH = 515
const PAPER_HEIGHT = 486
const PAPER_GRAPH = {
  graphLeft: 64,
  graphWidth: 390,
  graphTop: 185,
  rowHeight: 19.5,
} as const

const totalKeys: Record<DutyStatus, keyof DailyLogTotals> = {
  OFF_DUTY: "off_duty_seconds",
  SLEEPER_BERTH: "sleeper_berth_seconds",
  DRIVING: "driving_seconds",
  ON_DUTY_NOT_DRIVING: "on_duty_not_driving_seconds",
}

const totalRows: Array<{ status: DutyStatus; y: number }> = [
  { status: "OFF_DUTY", y: 194.5 },
  { status: "SLEEPER_BERTH", y: 214 },
  { status: "DRIVING", y: 233.5 },
  { status: "ON_DUTY_NOT_DRIVING", y: 253 },
]

export function PaperEldLog({ log, locations }: PaperEldLogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const trace = buildDutyTrace(log.segments, PAPER_GRAPH)
  const [year, month, day] = log.date.split("-")
  const remarks = log.remarks.slice(0, 8)
  const extraRemarkCount = Math.max(0, log.remarks.length - remarks.length)

  return (
    <section
      className="bg-white p-2 sm:p-4"
      aria-labelledby={titleId}
      data-testid="provided-eld-paper"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h4 id={titleId} className="font-semibold text-slate-950">
            FMCSA paper log
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            Filled on the log-sheet template supplied with the assessment.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {formatLogDate(log.date)} · {log.driving_distance_miles.toFixed(1)} mi · Time standard {log.timezone}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <svg
          className="block h-auto min-w-[760px] w-full"
          viewBox={`0 0 ${PAPER_WIDTH} ${PAPER_HEIGHT}`}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          data-testid="provided-eld-paper-svg"
        >
          <desc id={descriptionId}>
            Driver daily log using the assessment-provided paper template, with
            the date, route, miles, duty-status trace, totals, and remarks filled in.
          </desc>

          <image
            href="/blank-paper-log.png"
            x="0"
            y="0"
            width={PAPER_WIDTH}
            height={PAPER_HEIGHT}
            preserveAspectRatio="none"
          />

          <g
            fill="#111827"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="7"
            data-testid="paper-log-fields"
          >
            <text x="178" y="31" textAnchor="middle">{month}</text>
            <text x="205" y="31" textAnchor="middle">{day}</text>
            <text x="236" y="31" textAnchor="middle">{year}</text>

            <text x="67" y="46">{fitText(locations.current_location.label, 31)}</text>
            <text x="258" y="46">{fitText(locations.dropoff_location.label, 31)}</text>

            <text x="94" y="80" textAnchor="middle" fontSize="9" fontWeight="700">
              {log.driving_distance_miles.toFixed(1)}
            </text>
            <text x="181" y="80" textAnchor="middle" fontSize="8">—</text>

            <text x="350" y="85" textAnchor="middle">—</text>
            <text x="350" y="107" textAnchor="middle">—</text>
            <text x="350" y="128" textAnchor="middle">—</text>
            <text x="135" y="111" textAnchor="middle">—</text>

            {remarks.map((remark, index) => (
              <text
                key={`${remark.second_of_day}-${remark.event_type}-${index}`}
                x="28"
                y={294 + index * 9}
                fontSize="6.3"
              >
                {`${remark.time}  ${getEventLabel(remark.event_type)} — ${fitText(
                  remark.location.label,
                  46,
                )}`}
              </text>
            ))}
            {extraRemarkCount > 0 && (
              <text x="28" y={294 + remarks.length * 9} fontSize="6.3">
                {`+${extraRemarkCount} additional event${extraRemarkCount === 1 ? "" : "s"} in detailed remarks`}
              </text>
            )}

            <text x="75" y="349" fontSize="6.5">—</text>
            <text x="91" y="438" textAnchor="middle" fontSize="6.5">
              {formatPaperHours(
                log.totals.driving_seconds +
                  log.totals.on_duty_not_driving_seconds,
              )}
            </text>

            {totalRows.map(({ status, y }) => (
              <text
                key={status}
                x="480"
                y={y}
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
              >
                {formatPaperHours(log.totals[totalKeys[status]])}
              </text>
            ))}
          </g>

          <g
            stroke="#111827"
            strokeWidth="1.7"
            strokeLinecap="square"
            strokeLinejoin="miter"
            fill="none"
            data-testid="paper-duty-trace"
          >
            {trace.spans.map((span, index) => (
              <line
                key={`paper-span-${index}`}
                x1={span.x1}
                x2={span.x2}
                y1={span.y}
                y2={span.y}
                data-testid="paper-duty-trace-span"
                data-status={span.status}
              />
            ))}
            {trace.connectors.map((connector, index) => (
              <line
                key={`paper-connector-${index}`}
                x1={connector.x}
                x2={connector.x}
                y1={connector.y1}
                y2={connector.y2}
                data-testid="paper-duty-trace-connector"
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="sr-only">
        <span>{`Log date ${log.date}`}</span>
        <span>{`Time standard ${log.timezone}`}</span>
        <span>{`Miles driven today ${log.driving_distance_miles.toFixed(1)} mi`}</span>
        {["Driver", "Carrier", "Truck / Tractor", "Trailer", "Shipping Docs"].map(
          (field) => (
            <span key={field} aria-label={`${field}: not provided`}>
              —
            </span>
          ),
        )}
      </div>
    </section>
  )
}

function formatPaperHours(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0.00"
  return (seconds / 3600).toFixed(2)
}

function fitText(value: string, maxLength: number): string {
  const normalized = value.trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}
