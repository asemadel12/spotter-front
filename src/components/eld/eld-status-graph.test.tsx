import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { EldStatusGraph } from "@/components/eld/eld-status-graph"
import { ELD_GRAPH_DIMENSIONS } from "@/lib/eld"
import { tripPlanFixture } from "@/test/fixtures/trip-plan"

describe("EldStatusGraph", () => {
  const dayOne = tripPlanFixture.daily_logs.logs[0]
  const dayTwo = tripPlanFixture.daily_logs.logs[1]

  it("renders all four canonical status rows", () => {
    render(<EldStatusGraph log={dayOne} />)
    for (const label of [
      "OFF DUTY",
      "SLEEPER BERTH",
      "DRIVING",
      "ON DUTY (NOT DRIVING)",
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1)
    }
  })

  it("renders Midnight and Noon time labels", () => {
    render(<EldStatusGraph log={dayOne} />)
    expect(screen.getAllByText("MID")).toHaveLength(2)
    expect(screen.getByText("NOON")).toBeVisible()
  })

  it("exposes an accessible SVG title and description", () => {
    render(<EldStatusGraph log={dayOne} />)
    const graph = screen.getByRole("img", {
      name: /Duty status graph for/i,
    })
    expect(graph).toHaveAccessibleDescription(
      /24-hour record showing off-duty, sleeper berth, driving, and on-duty not driving periods/i,
    )
  })

  it("shows backend totals and visibly communicates a 24-hour total", () => {
    render(<EldStatusGraph log={dayOne} />)
    expect(screen.getAllByText("8.5h").length).toBeGreaterThan(0)
    expect(screen.getAllByText("12h").length).toBeGreaterThan(0)
    expect(screen.getByText("Total record: 24h")).toBeVisible()
  })

  it("renders inside a horizontal overflow container without canvas", () => {
    const { container } = render(<EldStatusGraph log={dayOne} />)
    expect(screen.getByTestId("eld-graph-scroll-container")).toHaveClass(
      "overflow-x-auto",
    )
    expect(container.querySelector("svg")).toBeInTheDocument()
    expect(container.querySelector("canvas")).not.toBeInTheDocument()
  })

  it("draws a day-one segment ending at the right edge", () => {
    render(<EldStatusGraph log={dayOne} />)
    const lastSpan = screen.getAllByTestId("duty-trace-span").at(-1)
    expect(lastSpan).toHaveAttribute("data-status", "SLEEPER_BERTH")
    expect(lastSpan).toHaveAttribute("data-end-second", "86400")
    expect(lastSpan).toHaveAttribute(
      "x2",
      String(ELD_GRAPH_DIMENSIONS.graphLeft + ELD_GRAPH_DIMENSIONS.graphWidth),
    )
  })

  it("draws a day-two sleeper fragment independently from the left edge", () => {
    render(<EldStatusGraph log={dayTwo} />)
    const firstSpan = screen.getAllByTestId("duty-trace-span")[0]
    expect(firstSpan).toHaveAttribute("data-status", "SLEEPER_BERTH")
    expect(firstSpan).toHaveAttribute("data-start-second", "0")
    expect(firstSpan).toHaveAttribute(
      "x1",
      String(ELD_GRAPH_DIMENSIONS.graphLeft),
    )
  })
})
