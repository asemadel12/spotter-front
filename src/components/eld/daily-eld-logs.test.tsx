import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { DailyEldLogs } from "@/components/eld/daily-eld-logs"
import { tripPlanFixture } from "@/test/fixtures/trip-plan"
import type { DailyLogsResult } from "@/types/trip"

function threeDayLogs(): DailyLogsResult {
  const thirdLog = {
    ...tripPlanFixture.daily_logs.logs[1],
    date: "2026-01-03",
    driving_distance_miles: 125.4,
    driving_distance_meters: 201_812,
  }
  return {
    summary: {
      ...tripPlanFixture.daily_logs.summary,
      log_count: 3,
      end_date: "2026-01-03",
    },
    logs: [...tripPlanFixture.daily_logs.logs, thirdLog],
  }
}

function renderLogs(dailyLogs = tripPlanFixture.daily_logs) {
  return render(
    <DailyEldLogs
      dailyLogs={dailyLogs}
      locations={tripPlanFixture.locations}
    />,
  )
}

describe("DailyEldLogs", () => {
  it("displays the log date, time standard, and backend daily miles", () => {
    renderLogs()
    expect(screen.getByText("+00:00")).toBeVisible()
    expect(screen.getAllByText(/Jan 1/).length).toBeGreaterThan(0)
    expect(screen.getByText("683.5 mi")).toBeVisible()
  })

  it("does not invent missing driver, carrier, or equipment details", () => {
    renderLogs()
    for (const field of [
      "Driver",
      "Carrier",
      "Truck / Tractor",
      "Trailer",
      "Shipping Docs",
    ]) {
      expect(screen.getByLabelText(`${field}: not provided`)).toHaveTextContent("—")
    }
    expect(screen.queryByText(/John Doe|Spotter Logistics|TRACTOR-/i)).not.toBeInTheDocument()
  })

  it("renders remarks chronologically with human event labels", () => {
    renderLogs()
    const remarks = screen.getByRole("heading", { name: "REMARKS" }).closest("section")
    expect(remarks).not.toBeNull()
    const times = within(remarks as HTMLElement)
      .getAllByRole("time")
      .map((item) => item.textContent)
    expect(times).toEqual(["08:00", "12:00", "13:00", "17:00", "17:30", "21:30", "22:00"])
    expect(within(remarks as HTMLElement).getByText("Pickup")).toBeVisible()
    expect(within(remarks as HTMLElement).getByText("30-min Break")).toBeVisible()
  })

  it("uses normalized pickup and en-route labels in remarks", () => {
    renderLogs()
    const remarks = screen.getByRole("heading", { name: "REMARKS" }).closest("section")
    expect(remarks).not.toBeNull()
    expect(
      within(remarks as HTMLElement).getByText("St. Louis, Missouri, USA"),
    ).toBeVisible()
    expect(
      within(remarks as HTMLElement).getAllByText("En route").length,
    ).toBeGreaterThan(0)
  })

  it("shows optional route distance progress", () => {
    renderLogs()
    expect(screen.getAllByText("· 435.0 mi into trip").length).toBeGreaterThan(0)
  })

  it("does not expose backend reason strings as labels", () => {
    renderLogs()
    expect(screen.queryByText("one_hour_pickup_service")).not.toBeInTheDocument()
    expect(screen.queryByText("daily_driving_or_duty_limit")).not.toBeInTheDocument()
    expect(screen.queryByText("route_progress")).not.toBeInTheDocument()
  })

  it("creates one selector per day and selects day one initially", () => {
    renderLogs(threeDayLogs())
    expect(screen.getByRole("button", { name: /Day 1/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    expect(screen.getByRole("button", { name: /Day 2/i })).toBeVisible()
    expect(screen.getByRole("button", { name: /Day 3/i })).toBeVisible()
    expect(screen.getByText("Day 1 of 3")).toBeVisible()
  })

  it("switches the active sheet and graph to day two", async () => {
    const user = userEvent.setup()
    renderLogs(threeDayLogs())

    await user.click(screen.getByRole("button", { name: /Day 2/i }))

    expect(screen.getByRole("button", { name: /Day 2/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    expect(screen.getByRole("button", { name: /Day 1/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    )
    expect(screen.getByText("Day 2 of 3")).toBeVisible()
    expect(screen.getByText("248.5 mi")).toBeVisible()
    expect(screen.getAllByTestId("paper-duty-trace-span")[0]).toHaveAttribute(
      "data-status",
      "SLEEPER_BERTH",
    )
  })

  it("resets selection to day one when a new log set arrives", async () => {
    const user = userEvent.setup()
    const { rerender } = renderLogs(threeDayLogs())
    await user.click(screen.getByRole("button", { name: /Day 3/i }))
    expect(screen.getByText("125.4 mi")).toBeVisible()

    const replacement: DailyLogsResult = {
      ...tripPlanFixture.daily_logs,
      summary: {
        ...tripPlanFixture.daily_logs.summary,
        start_date: "2026-02-10",
        end_date: "2026-02-10",
        log_count: 1,
      },
      logs: [
        {
          ...tripPlanFixture.daily_logs.logs[0],
          date: "2026-02-10",
          driving_distance_miles: 321.9,
        },
      ],
    }
    rerender(
      <DailyEldLogs
        dailyLogs={replacement}
        locations={tripPlanFixture.locations}
      />,
    )

    await waitFor(() => expect(screen.getByText("321.9 mi")).toBeVisible())
    expect(screen.queryByRole("button", { name: /Day 2/i })).not.toBeInTheDocument()
  })

  it("renders a midnight remark for a day-two fragment", async () => {
    const user = userEvent.setup()
    renderLogs()
    await user.click(screen.getByRole("button", { name: /Day 2/i }))
    expect(screen.getByText("00:00")).toBeVisible()
    expect(screen.getByText("Sleeper Rest")).toBeVisible()
  })

  it("shows resolved city-state labels for en-route duty changes", () => {
    const source = tripPlanFixture.daily_logs.logs[0]
    const enriched: DailyLogsResult = {
      ...tripPlanFixture.daily_logs,
      logs: [
        {
          ...source,
          remarks: source.remarks.map((remark) => {
            if (remark.event_type === "BREAK") {
              return {
                ...remark,
                location: { ref: "en_route", label: "Springfield, MO" },
              }
            }
            if (remark.event_type === "FUEL") {
              return {
                ...remark,
                location: { ref: "en_route", label: "McAlester, OK" },
              }
            }
            return remark
          }),
        },
        ...tripPlanFixture.daily_logs.logs.slice(1),
      ],
    }

    renderLogs(enriched)

    expect(screen.getAllByText("Springfield, MO").length).toBeGreaterThan(0)
    expect(screen.getAllByText("McAlester, OK").length).toBeGreaterThan(0)
  })

})
