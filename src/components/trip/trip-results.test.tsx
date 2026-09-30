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

  it("displays the daily log count and lets the user inspect each sheet", async () => {
    const user = userEvent.setup()
    render(<TripResults result={tripPlanFixture} />)
    expect(screen.getByText("2 ELD log sheets generated")).toBeVisible()
    expect(screen.getByText("683.5 mi")).toBeVisible()
    await user.click(screen.getByRole("button", { name: /Day 2/i }))
    expect(screen.getAllByText("248.5 mi").length).toBeGreaterThan(0)
  })

  it("renders important schedule event labels", () => {
    render(<TripResults result={tripPlanFixture} />)
    const timeline = screen.getByText("Trip timeline").closest("section")
    expect(timeline).not.toBeNull()
    for (const label of [
      "Driving",
      "Pickup",
      "30-min Break",
      "Fuel Stop",
      "Sleeper Rest",
      "Drop-off",
    ]) {
      expect(within(timeline as HTMLElement).getAllByText(label)[0]).toBeVisible()
    }
  })

  it("groups instructions into exactly two route legs", () => {
    render(<TripResults result={tripPlanFixture} />)
    const instructions = screen.getByText("Route instructions").closest("div")
      ?.parentElement?.parentElement
    expect(instructions).not.toBeNull()
    const groups = within(instructions as HTMLElement).getAllByRole("group")
    expect(groups).toHaveLength(2)
    expect(screen.getByText("Current → Pickup")).toBeVisible()
    expect(screen.getByText("Pickup → Drop-off")).toBeVisible()
  })

  it("displays normalized labels for all primary locations", () => {
    render(<TripResults result={tripPlanFixture} />)
    expect(screen.getAllByText("Chicago, Cook County, Illinois, USA").length).toBeGreaterThan(0)
    expect(screen.getAllByText("St. Louis, Missouri, USA").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Dallas, Dallas County, Texas, USA").length).toBeGreaterThan(0)
  })
})


it("uses singular labels for single generated counts", () => {
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

  expect(screen.getByText("1 ELD log sheet generated")).toBeVisible()
  expect(screen.getByText("1 fuel stop")).toBeVisible()
})
