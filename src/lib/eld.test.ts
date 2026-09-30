import { describe, expect, it } from "vitest"

import {
  buildDutyTrace,
  ELD_GRAPH_DIMENSIONS,
  formatLogHours,
  secondToGraphX,
  statusToRow,
} from "@/lib/eld"
import { tripPlanFixture } from "@/test/fixtures/trip-plan"
import type { DailyLogSegment, DutyStatus } from "@/types/trip"

function segment(
  status: DutyStatus,
  startSecond: number,
  endSecond: number,
): DailyLogSegment {
  return {
    status,
    start_second: startSecond,
    end_second: endSecond,
    duration_seconds: endSecond - startSecond,
  }
}

describe("statusToRow", () => {
  it.each([
    ["OFF_DUTY", 0],
    ["SLEEPER_BERTH", 1],
    ["DRIVING", 2],
    ["ON_DUTY_NOT_DRIVING", 3],
  ])("maps %s to row %s", (status, row) => {
    expect(statusToRow(status)).toBe(row)
  })

  it("handles an unknown duty status safely", () => {
    expect(statusToRow("UNKNOWN_STATUS")).toBeNull()
  })
})

describe("secondToGraphX", () => {
  const left = 150
  const width = 960

  it.each([
    [0, 150],
    [43_200, 630],
    [86_400, 1_110],
    [-1, 150],
    [100_000, 1_110],
  ])("maps second %s to x=%s", (second, expected) => {
    expect(secondToGraphX(second, left, width)).toBe(expected)
  })
})

describe("buildDutyTrace", () => {
  it("creates one horizontal span for a full-day off-duty segment", () => {
    const trace = buildDutyTrace([segment("OFF_DUTY", 0, 86_400)])
    expect(trace.spans).toHaveLength(1)
    expect(trace.connectors).toHaveLength(0)
  })

  it("creates a vertical connector when status changes", () => {
    const trace = buildDutyTrace([
      segment("OFF_DUTY", 0, 3_600),
      segment("DRIVING", 3_600, 7_200),
    ])
    expect(trace.connectors).toHaveLength(1)
    expect(trace.connectors[0].x).toBe(trace.spans[1].x1)
    expect(trace.connectors[0].y1).toBe(trace.spans[0].y)
    expect(trace.connectors[0].y2).toBe(trace.spans[1].y)
  })

  it("keeps three statuses in ordered step geometry", () => {
    const trace = buildDutyTrace([
      segment("OFF_DUTY", 0, 3_600),
      segment("DRIVING", 3_600, 7_200),
      segment("ON_DUTY_NOT_DRIVING", 7_200, 10_800),
    ])
    expect(trace.spans.map((span) => span.status)).toEqual([
      "OFF_DUTY",
      "DRIVING",
      "ON_DUTY_NOT_DRIVING",
    ])
    expect(trace.connectors).toHaveLength(2)
  })

  it("preserves a midnight start at the graph left edge", () => {
    const [span] = buildDutyTrace([segment("OFF_DUTY", 0, 3_600)]).spans
    expect(span.startSecond).toBe(0)
    expect(span.x1).toBe(ELD_GRAPH_DIMENSIONS.graphLeft)
  })

  it("preserves a 24:00 endpoint at the graph right edge", () => {
    const [span] = buildDutyTrace([
      segment("SLEEPER_BERTH", 79_200, 86_400),
    ]).spans
    expect(span.endSecond).toBe(86_400)
    expect(span.x2).toBe(
      ELD_GRAPH_DIMENSIONS.graphLeft + ELD_GRAPH_DIMENSIONS.graphWidth,
    )
  })

  it("supports fractional seconds without invalid SVG coordinates", () => {
    const [span] = buildDutyTrace([
      segment("DRIVING", 900.25, 1_800.75),
    ]).spans
    expect(span.x1).toBeTypeOf("number")
    expect(span.x2).toBeGreaterThan(span.x1)
    expect(Number.isFinite(span.x1)).toBe(true)
  })

  it("keeps adjacent same-status spans continuous without a connector", () => {
    const trace = buildDutyTrace([
      segment("DRIVING", 0, 3_600),
      segment("DRIVING", 3_600, 7_200),
    ])
    expect(trace.spans[0].x2).toBe(trace.spans[1].x1)
    expect(trace.connectors).toHaveLength(0)
  })

  it("ignores zero-length and negative-length segments safely", () => {
    const trace = buildDutyTrace([
      segment("DRIVING", 3_600, 3_600),
      segment("OFF_DUTY", 7_200, 3_600),
    ])
    expect(trace.spans).toEqual([])
    expect(trace.connectors).toEqual([])
  })
})

describe("formatLogHours", () => {
  it.each([
    [3_600, "1h"],
    [1_800, "0.5h"],
    [900, "0.25h"],
  ])("formats %s seconds as %s", (seconds, expected) => {
    expect(formatLogHours(seconds)).toBe(expected)
  })

  it("keeps each fixture day at exactly 24 hours", () => {
    for (const log of tripPlanFixture.daily_logs.logs) {
      expect(
        log.segments.reduce(
          (total, current) => total + current.duration_seconds,
          0,
        ),
      ).toBe(86_400)
      expect(log.totals.total_seconds).toBe(86_400)
    }
  })

  it("keeps fixture status totals consistent with its segments", () => {
    const totalKeyByStatus = {
      OFF_DUTY: "off_duty_seconds",
      SLEEPER_BERTH: "sleeper_berth_seconds",
      DRIVING: "driving_seconds",
      ON_DUTY_NOT_DRIVING: "on_duty_not_driving_seconds",
    } as const

    for (const log of tripPlanFixture.daily_logs.logs) {
      for (const [status, totalKey] of Object.entries(totalKeyByStatus)) {
        const segmentTotal = log.segments
          .filter((current) => current.status === status)
          .reduce((total, current) => total + current.duration_seconds, 0)
        expect(segmentTotal).toBe(log.totals[totalKey])
      }
    }
  })
})
