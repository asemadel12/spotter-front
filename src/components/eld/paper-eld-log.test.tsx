import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PaperEldLog } from "@/components/eld/paper-eld-log"
import { tripPlanFixture } from "@/test/fixtures/trip-plan"

describe("PaperEldLog", () => {
  it("renders the assessment paper-log template with the backend duty trace", () => {
    const log = tripPlanFixture.daily_logs.logs[0]
    render(<PaperEldLog log={log} locations={tripPlanFixture.locations} />)

    const paper = screen.getByTestId("provided-eld-paper")
    const image = screen.getByTestId("provided-eld-paper-image")
    const canvas = screen.getByTestId("provided-eld-paper-canvas")

    expect(paper).toBeVisible()
    expect(canvas).toBeVisible()
    expect(image).toHaveAttribute("src", "/blank-paper-log.svg")
    expect(screen.getAllByTestId("paper-duty-trace-span").length).toBeGreaterThan(0)
    expect(screen.getByText("683.5 mi")).toBeVisible()
  })

  it("prints resolved city-state labels into the paper remarks area", () => {
    const source = tripPlanFixture.daily_logs.logs[0]
    const log = {
      ...source,
      remarks: source.remarks.map((remark, index) =>
        index === 0
          ? {
              ...remark,
              location: {
                ref: "en_route",
                label: "Amarillo, TX",
              },
            }
          : remark,
      ),
    }

    render(<PaperEldLog log={log} locations={tripPlanFixture.locations} />)

    expect(screen.getByTestId("paper-log-fields")).toHaveTextContent(
      "Amarillo, TX",
    )
  })

  it("uses each log day's first and last recorded locations for From and To", () => {
    const source = tripPlanFixture.daily_logs.logs[0]
    const log = {
      ...source,
      remarks: [
        {
          ...source.remarks[0],
          location: { ref: "current_location", label: "Chicago, IL" },
        },
        {
          ...source.remarks[1],
          location: { ref: "pickup_location", label: "St. Louis, MO" },
        },
      ],
    }

    render(<PaperEldLog log={log} locations={tripPlanFixture.locations} />)

    const fields = screen.getByTestId("paper-log-fields")
    expect(fields).toHaveTextContent("Chicago, IL")
    expect(fields).toHaveTextContent("St. Louis, MO")
    expect(fields).not.toHaveTextContent("Dallas, Dallas County, Texas, USA")
  })

  it("draws duty statuses on the exact row centers of the supplied grid", () => {
    const log = tripPlanFixture.daily_logs.logs[0]
    render(<PaperEldLog log={log} locations={tripPlanFixture.locations} />)

    const spans = screen.getAllByTestId("paper-duty-trace-span")
    expect(spans[0]).toHaveAttribute("y1", "194.75")
    expect(spans[0]).toHaveAttribute("y2", "194.75")
  })

})
