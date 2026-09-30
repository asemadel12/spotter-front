import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ApiRequestError } from "@/api/client"
import { TripPlannerForm } from "@/components/trip/trip-planner-form"

async function fillValidForm(cycleHours = "20") {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Current Location"), "Chicago, IL")
  await user.type(screen.getByLabelText("Pickup Location"), "St. Louis, MO")
  await user.type(screen.getByLabelText("Drop-off Location"), "Dallas, TX")
  const cycleInput = screen.getByLabelText("Current Cycle Used (Hrs)")
  await user.clear(cycleInput)
  await user.type(cycleInput, cycleHours)
  return user
}

describe("TripPlannerForm", () => {
  it("requires every location", async () => {
    const user = userEvent.setup()
    render(<TripPlannerForm isPending={false} onSubmit={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Plan Trip" }))

    expect(await screen.findByText("Enter your current location.")).toBeVisible()
    expect(screen.getByText("Enter the pickup location.")).toBeVisible()
    expect(screen.getByText("Enter the drop-off location.")).toBeVisible()
  })

  it("rejects cycle hours below zero", async () => {
    render(<TripPlannerForm isPending={false} onSubmit={vi.fn()} />)
    const user = await fillValidForm("-0.5")
    await user.click(screen.getByRole("button", { name: "Plan Trip" }))
    expect(await screen.findByText("Cycle hours cannot be below 0.")).toBeVisible()
  })

  it("rejects cycle hours above 70", async () => {
    render(<TripPlannerForm isPending={false} onSubmit={vi.fn()} />)
    const user = await fillValidForm("70.1")
    await user.click(screen.getByRole("button", { name: "Plan Trip" }))
    expect(await screen.findByText("Cycle hours cannot exceed 70.")).toBeVisible()
  })

  it("accepts decimals and submits the exact trimmed API payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TripPlannerForm isPending={false} onSubmit={onSubmit} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText("Current Location"), "  Chicago, IL  ")
    await user.type(screen.getByLabelText("Pickup Location"), "St. Louis, MO")
    await user.type(screen.getByLabelText("Drop-off Location"), "Dallas, TX")
    const cycleInput = screen.getByLabelText("Current Cycle Used (Hrs)")
    await user.clear(cycleInput)
    await user.type(cycleInput, "20.5")
    await user.click(screen.getByRole("button", { name: "Plan Trip" }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        current_location: "Chicago, IL",
        pickup_location: "St. Louis, MO",
        dropoff_location: "Dallas, TX",
        current_cycle_used_hours: 20.5,
      }),
    )
  })

  it("disables submission and shows pending copy while planning", () => {
    render(<TripPlannerForm isPending onSubmit={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Planning Route..." })).toBeDisabled()
  })

  it("surfaces DRF validation errors against the correct field", async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiRequestError("Invalid request", 400, {
        current_cycle_used_hours: ["Cycle hours must be at most 70."],
      }),
    )
    render(<TripPlannerForm isPending={false} onSubmit={onSubmit} />)
    const user = await fillValidForm()
    await user.click(screen.getByRole("button", { name: "Plan Trip" }))

    expect(await screen.findByText("Cycle hours must be at most 70.")).toBeVisible()
    expect(screen.getByLabelText("Current Cycle Used (Hrs)")).toHaveAttribute(
      "aria-invalid",
      "true",
    )
  })

  it("surfaces location-not-found errors against the named location", async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiRequestError("Could not resolve pickup location.", 400, {
        error: {
          code: "location_not_found",
          field: "pickup_location",
          message: "Could not resolve pickup location.",
        },
      }),
    )
    render(<TripPlannerForm isPending={false} onSubmit={onSubmit} />)
    const user = await fillValidForm()
    await user.click(screen.getByRole("button", { name: "Plan Trip" }))

    expect(await screen.findByText("Could not resolve pickup location.")).toBeVisible()
    expect(screen.getByLabelText("Pickup Location")).toHaveAttribute(
      "aria-invalid",
      "true",
    )
  })

  it("shows a safe generic backend planning error", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiRequestError("Trip routing service is temporarily unavailable.", 502),
      )
    render(<TripPlannerForm isPending={false} onSubmit={onSubmit} />)
    const user = await fillValidForm()
    await user.click(screen.getByRole("button", { name: "Plan Trip" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Trip routing service is temporarily unavailable.",
    )
  })

  it("shows a readable network failure", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiRequestError("Unable to reach the trip planning service.", 0),
      )
    render(<TripPlannerForm isPending={false} onSubmit={onSubmit} />)
    const user = await fillValidForm()
    await user.click(screen.getByRole("button", { name: "Plan Trip" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to reach the trip planning service.",
    )
  })
})
