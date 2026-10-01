import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PaperEldLog } from "@/components/eld/paper-eld-log"
import { tripPlanFixture } from "@/test/fixtures/trip-plan"

describe("PaperEldLog", () => {
  it("renders the assessment paper-log template with the backend duty trace", () => {
    const log = tripPlanFixture.daily_logs.logs[0]
    render(<PaperEldLog log={log} locations={tripPlanFixture.locations} />)

    const paper = screen.getByTestId("provided-eld-paper")
    const image = screen
      .getByTestId("provided-eld-paper-svg")
      .querySelector("image")

    expect(paper).toBeVisible()
    expect(image).toHaveAttribute("href", "/blank-paper-log.png")
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
})
