import { useId } from "react"

import {
  buildDutyTrace,
  DUTY_STATUS_ROWS,
  ELD_GRAPH_DIMENSIONS,
  formatGraphTime,
  formatLogHours,
  secondToGraphX,
} from "@/lib/eld"
import { formatLogDate } from "@/lib/formatting"
import type { DailyLog, DailyLogTotals } from "@/types/eld"
import type { DutyStatus } from "@/types/hos"

interface EldStatusGraphProps {
  log: DailyLog
}

const totalKeys: Record<DutyStatus, keyof DailyLogTotals> = {
  OFF_DUTY: "off_duty_seconds",
  SLEEPER_BERTH: "sleeper_berth_seconds",
  DRIVING: "driving_seconds",
  ON_DUTY_NOT_DRIVING: "on_duty_not_driving_seconds",
}

export function EldStatusGraph({ log }: EldStatusGraphProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dimensions = ELD_GRAPH_DIMENSIONS
  const graphBottom = dimensions.graphTop + dimensions.rowHeight * 4
  const trace = buildDutyTrace(log.segments, dimensions)

  return (
    <section aria-labelledby={`${titleId}-section`} className="p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h4 id={`${titleId}-section`} className="font-semibold text-slate-950">
            Record of duty status
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            The trace is generated directly from the backend HOS schedule.
          </p>
        </div>
        <p className="text-xs font-medium text-slate-500">Quarter-hour grid</p>
      </div>

      <div
        className="overflow-x-auto rounded-lg border border-slate-300 bg-white"
        data-testid="eld-graph-scroll-container"
      >
        <svg
          className="block h-auto min-w-[1000px] w-full"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          data-testid="eld-status-graph"
        >
          <title id={titleId}>
            Duty status graph for {formatLogDate(log.date)}
          </title>
          <desc id={descriptionId}>
            24-hour record showing off-duty, sleeper berth, driving, and on-duty not driving periods.
          </desc>

          <rect width={dimensions.width} height={dimensions.height} fill="#ffffff" />
          <text x="18" y="37" className="fill-slate-500 text-[11px] font-semibold tracking-wider">
            DUTY STATUS
          </text>
          <text
            x={dimensions.totalsLeft + 48}
            y="29"
            textAnchor="middle"
            className="fill-slate-500 text-[10px] font-semibold tracking-wider"
          >
            TOTAL
          </text>
          <text
            x={dimensions.totalsLeft + 48}
            y="43"
            textAnchor="middle"
            className="fill-slate-500 text-[10px] font-semibold tracking-wider"
          >
            HOURS
          </text>

          {Array.from({ length: 25 }, (_, hour) => {
            const x = secondToGraphX(
              hour * 3_600,
              dimensions.graphLeft,
              dimensions.graphWidth,
            )
            return (
              <g key={`hour-${hour}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={dimensions.graphTop - 6}
                  y2={graphBottom}
                  stroke="#94a3b8"
                  strokeWidth={hour === 0 || hour === 12 || hour === 24 ? 1.5 : 1}
                />
                <text
                  x={x}
                  y={dimensions.graphTop - 18}
                  textAnchor={hour === 0 ? "start" : hour === 24 ? "end" : "middle"}
                  className="fill-slate-600 text-[10px] font-medium"
                >
                  {hourLabel(hour)}
                </text>
              </g>
            )
          })}

          {Array.from({ length: 96 }, (_, quarterIndex) => quarterIndex + 1)
            .filter((quarter) => quarter % 4 !== 0)
            .map((quarter) => {
              const x = secondToGraphX(
                quarter * 900,
                dimensions.graphLeft,
                dimensions.graphWidth,
              )
              return (
                <line
                  key={`quarter-${quarter}`}
                  x1={x}
                  x2={x}
                  y1={dimensions.graphTop}
                  y2={graphBottom}
                  stroke="#e2e8f0"
                  strokeWidth="0.75"
                />
              )
            })}

          {Array.from({ length: 5 }, (_, rowBoundary) => {
            const y = dimensions.graphTop + rowBoundary * dimensions.rowHeight
            return (
              <line
                key={`row-boundary-${rowBoundary}`}
                x1={dimensions.graphLeft}
                x2={dimensions.width - 12}
                y1={y}
                y2={y}
                stroke="#94a3b8"
                strokeWidth="1"
              />
            )
          })}

          {DUTY_STATUS_ROWS.map((row, index) => {
            const y = dimensions.graphTop + dimensions.rowHeight * (index + 0.5)
            return (
              <g key={row.status}>
                <text x="18" y={y + 4} className="fill-slate-800 text-[12px] font-semibold">
                  {row.label}
                </text>
                <text
                  x={dimensions.totalsLeft + 48}
                  y={y + 4}
                  textAnchor="middle"
                  className="fill-slate-950 text-[13px] font-semibold tabular-nums"
                >
                  {formatLogHours(log.totals[totalKeys[row.status]])}
                </text>
              </g>
            )
          })}

          <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {trace.spans.map((span, index) => (
              <line
                key={`span-${index}`}
                x1={span.x1}
                x2={span.x2}
                y1={span.y}
                y2={span.y}
                data-testid="duty-trace-span"
                data-status={span.status}
                data-start-second={span.startSecond}
                data-end-second={span.endSecond}
                tabIndex={0}
              >
                <title>
                  {rowLabel(span.status)}: {formatGraphTime(span.startSecond)}–{formatGraphTime(span.endSecond)}
                </title>
              </line>
            ))}
            {trace.connectors.map((connector, index) => (
              <line
                key={`connector-${index}`}
                x1={connector.x}
                x2={connector.x}
                y1={connector.y1}
                y2={connector.y2}
                data-testid="duty-trace-connector"
              />
            ))}
          </g>

          <text
            x={dimensions.totalsLeft}
            y={graphBottom + 31}
            className="fill-slate-600 text-[11px] font-semibold"
          >
            TOTAL
          </text>
          <text
            x={dimensions.width - 20}
            y={graphBottom + 31}
            textAnchor="end"
            className="fill-slate-950 text-[15px] font-bold tabular-nums"
          >
            {formatLogHours(log.totals.total_seconds)}
          </text>
        </svg>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Duty status totals">
        {DUTY_STATUS_ROWS.map((row) => (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2" key={row.status}>
            <dt className="text-[11px] font-medium text-slate-500">{row.label}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">
              {formatLogHours(log.totals[totalKeys[row.status]])}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-right text-xs font-semibold text-slate-700">
        Total record: {formatLogHours(log.totals.total_seconds)}
      </p>
    </section>
  )
}

function hourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return "MID"
  if (hour === 12) return "NOON"
  return String(hour > 12 ? hour - 12 : hour)
}

function rowLabel(status: DutyStatus): string {
  return DUTY_STATUS_ROWS.find((row) => row.status === status)?.label ?? status
}
