import { describe, expect, it } from "vitest"

import {
  formatDateTime,
  formatDistanceMiles,
  formatDuration,
  formatHours,
} from "@/lib/formatting"

describe("trip formatting", () => {
  it("converts canonical meters to miles", () => {
    expect(formatDistanceMiles(1609.344)).toBe("1.0 mi")
  })

  it.each([
    [90, "2m"],
    [7_200, "2h"],
    [93_600, "1d 2h"],
  ])("formats %s seconds as %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })

  it("formats hours consistently to one decimal place", () => {
    expect(formatHours(7_200)).toBe("2.0h")
    expect(formatHours(5_400)).toBe("1.5h")
  })
})


describe("schedule datetime formatting", () => {
  it("preserves the wall-clock time encoded by the backend schedule", () => {
    expect(formatDateTime("2026-09-30T21:06:24.056499+00:00")).toContain("9:06")
    expect(formatDateTime("2026-09-30T21:06:24+03:00")).toContain("9:06")
  })

  it("fails safely for malformed timestamps", () => {
    expect(formatDateTime("not-a-date")).toBe("Unknown time")
  })
})
