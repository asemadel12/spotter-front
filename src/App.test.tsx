import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import App from "@/App"
import { PlanningLoadingState } from "@/components/trip/planning-loading-state"

describe("planner states", () => {
  it("starts with an empty state and no fake result data", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    )

    expect(screen.getByText("Your planned trip will appear here")).toBeVisible()
    expect(screen.queryByRole("region", { name: "Trip summary" })).not.toBeInTheDocument()
    expect(screen.queryByText("932.1 mi")).not.toBeInTheDocument()
  })

  it("renders an accessible pending skeleton treatment", () => {
    render(<PlanningLoadingState />)
    expect(screen.getByRole("status")).toHaveTextContent(
      "Planning your route and HOS schedule.",
    )
  })
})
