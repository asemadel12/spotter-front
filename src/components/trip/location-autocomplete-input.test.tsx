import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MapPin } from "lucide-react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { LocationAutocompleteInput } from "@/components/trip/location-autocomplete-input"
import { useLocationAutocomplete } from "@/hooks/use-location-autocomplete"

vi.mock("@/hooks/use-location-autocomplete", () => ({
  useLocationAutocomplete: vi.fn(),
}))

const mockedUseLocationAutocomplete = vi.mocked(useLocationAutocomplete)

const suggestions = [
  {
    label: "Dallas, TX, USA",
    latitude: 32.7767,
    longitude: -96.797,
  },
  {
    label: "Dallas Downtown Historic District, Dallas, TX, USA",
    latitude: 32.7802,
    longitude: -96.8001,
  },
]

function renderInput({
  value = "Dal",
  onChange = vi.fn(),
}: {
  value?: string
  onChange?: (value: string) => void
} = {}) {
  render(
    <LocationAutocompleteInput
      id="location"
      value={value}
      onChange={onChange}
      onBlur={vi.fn()}
      placeholder="Enter a location"
      disabled={false}
      invalid={false}
      describedBy="location-help"
      icon={MapPin}
    />,
  )
  return { onChange }
}

describe("LocationAutocompleteInput interactions", () => {
  beforeEach(() => {
    mockedUseLocationAutocomplete.mockReset()
    mockedUseLocationAutocomplete.mockReturnValue({
      suggestions,
      isLoading: false,
      hasSearched: true,
    })
  })

  it("does not open suggestions before three visible characters", async () => {
    renderInput({ value: "Da" })
    const input = screen.getByRole("combobox")
    await userEvent.click(input)

    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("selects a suggestion with the mouse", async () => {
    const onChange = vi.fn()
    renderInput({ onChange })
    const input = screen.getByRole("combobox")
    await userEvent.click(input)
    await userEvent.click(screen.getByRole("option", { name: "Dallas, TX, USA" }))

    expect(onChange).toHaveBeenCalledWith("Dallas, TX, USA")
  })

  it("selects the highlighted suggestion with ArrowDown and Enter", async () => {
    const onChange = vi.fn()
    renderInput({ onChange })
    const input = screen.getByRole("combobox")
    await userEvent.click(input)
    await userEvent.keyboard("{ArrowDown}{Enter}")

    expect(onChange).toHaveBeenCalledWith("Dallas, TX, USA")
  })

  it("wraps ArrowUp to the final suggestion", async () => {
    const onChange = vi.fn()
    renderInput({ onChange })
    const input = screen.getByRole("combobox")
    await userEvent.click(input)
    await userEvent.keyboard("{ArrowUp}{Enter}")

    expect(onChange).toHaveBeenCalledWith(
      "Dallas Downtown Historic District, Dallas, TX, USA",
    )
  })

  it("shows the free-text fallback when search returns no suggestions", async () => {
    mockedUseLocationAutocomplete.mockReturnValue({
      suggestions: [],
      isLoading: false,
      hasSearched: true,
    })
    renderInput({ value: "Texas City" })
    await userEvent.click(screen.getByRole("combobox"))

    expect(
      screen.getByText(
        "No suggestions found. You can still use the location exactly as entered.",
      ),
    ).toBeVisible()
  })

  it("shows loading state without forcing a selection", async () => {
    mockedUseLocationAutocomplete.mockReturnValue({
      suggestions: [],
      isLoading: true,
      hasSearched: false,
    })
    renderInput({ value: "Dallas" })
    await userEvent.click(screen.getByRole("combobox"))

    expect(screen.getByLabelText("Searching locations")).toBeVisible()
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true")
  })
})
