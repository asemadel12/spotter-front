import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TripResults } from "@/components/trip/trip-results"
import { tripPlanFixture } from "@/test/fixtures/trip-plan"

vi.mock("@/components/trip/route-map", () => ({
  RouteMap: ({ result }: { result: typeof tripPlanFixture }) => (
    <section aria-label="Route map test double">
      <span>{result.locations.current_location.label}</span>
      <span>{result.locations.pickup_location.label}</span>
      <span>{result.locations.dropoff_location.label}</span>
    </section>
  ),
}))

describe("TripResults", () => {
  it("renders route summary metrics using converted backend values", () => {
    render(<TripResults result={tripPlanFixture} />)

    const summary = screen.getByRole("region", { name: "Trip summary" })
    expect(within(summary).getByText("932.1 mi")).toBeVisible()
    expect(within(summary).getByText("16h")).toBeVisible()
    expect(within(summary).getByText("1d 5h")).toBeVisible()
    expect(within(summary).getByText("2")).toBeVisible()
    expect(within(summary).getByText("1 fuel stop")).toBeVisible()
  })

  it("defaults to the Schedule tab and renders important event labels", () => {
    render(<TripResults result={tripPlanFixture} />)

    expect(screen.getByRole("tab", { name: "Schedule" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    const panel = screen.getByRole("tabpanel", { name: "Schedule" })

    for (const label of [
      "Driving",
      "Pickup",
      "30-min Break",
      "Fuel Stop",
      "Sleeper Rest",
      "Drop-off",
    ]) {
      expect(within(panel).getAllByText(label)[0]).toBeVisible()
    }
  })

  it("shows directions only after the Directions tab is selected", async () => {
    const user = userEvent.setup()
    render(<TripResults result={tripPlanFixture} />)

    await user.click(screen.getByRole("tab", { name: "Directions" }))

    expect(screen.getByRole("tab", { name: "Directions" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    const panel = screen.getByRole("tabpanel", { name: "Directions" })
    const groups = within(panel).getAllByRole("group")
    expect(groups).toHaveLength(2)
    expect(within(panel).getByText("Current → Pickup")).toBeVisible()
    expect(within(panel).getByText("Pickup → Drop-off")).toBeVisible()
  })

  it("displays daily ELD logs inside their tab and lets the user inspect each sheet", async () => {
    const user = userEvent.setup()
    render(<TripResults result={tripPlanFixture} />)

    await user.click(screen.getByRole("tab", { name: "Daily ELD Logs" }))

    const panel = screen.getByRole("tabpanel", { name: "Daily ELD Logs" })
    expect(within(panel).getByText("2 ELD log sheets generated")).toBeVisible()
    expect(within(panel).getByText("683.5 mi")).toBeVisible()

    await user.click(within(panel).getByRole("button", { name: /Day 2/i }))
    expect(within(panel).getAllByText("248.5 mi").length).toBeGreaterThan(0)
  })

  it("keeps only one result workspace panel active at a time", async () => {
    const user = userEvent.setup()
    render(<TripResults result={tripPlanFixture} />)

    expect(screen.getByRole("tabpanel", { name: "Schedule" })).toBeVisible()

    await user.click(screen.getByRole("tab", { name: "Directions" }))
    expect(screen.getByRole("tabpanel", { name: "Directions" })).toBeVisible()
    expect(
      screen.queryByRole("tabpanel", { name: "Schedule" }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Daily ELD Logs" }))
    expect(
      screen.getByRole("tabpanel", { name: "Daily ELD Logs" }),
    ).toBeVisible()
    expect(
      screen.queryByRole("tabpanel", { name: "Directions" }),
    ).not.toBeInTheDocument()
  })

  it("opens the browser print dialog for Print / Save PDF", async () => {
    const user = userEvent.setup()
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined)
    render(<TripResults result={tripPlanFixture} />)

    await user.click(
      screen.getByRole("button", { name: "Print / Save PDF" }),
    )

    expect(print).toHaveBeenCalledOnce()
    expect(document.querySelector(".trip-print-report")).not.toBeNull()
    print.mockRestore()
  })

  it("displays normalized labels for all primary locations", () => {
    render(<TripResults result={tripPlanFixture} />)
    expect(
      screen.getAllByText("Chicago, Cook County, Illinois, USA").length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText("St. Louis, Missouri, USA").length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText("Dallas, Dallas County, Texas, USA").length,
    ).toBeGreaterThan(0)
  })

  it("uses singular labels for single generated counts", async () => {
    const user = userEvent.setup()
    const singleLogResult = {
      ...tripPlanFixture,
      daily_logs: {
        ...tripPlanFixture.daily_logs,
        summary: {
          ...tripPlanFixture.daily_logs.summary,
          log_count: 1,
        },
        logs: tripPlanFixture.daily_logs.logs.slice(0, 1),
      },
    }

    render(<TripResults result={singleLogResult} />)

    expect(screen.getByText("1 fuel stop")).toBeVisible()
    await user.click(screen.getByRole("tab", { name: "Daily ELD Logs" }))
    expect(screen.getByText("1 ELD log sheet generated")).toBeVisible()
  })
})
