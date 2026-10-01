import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { autocompleteLocations } from "@/api/locations"
import { useLocationAutocomplete } from "@/hooks/use-location-autocomplete"

vi.mock("@/api/locations", () => ({
  autocompleteLocations: vi.fn(),
}))

const mockedAutocompleteLocations = vi.mocked(autocompleteLocations)

describe("useLocationAutocomplete", () => {
  beforeEach(() => {
    mockedAutocompleteLocations.mockReset()
  })

  it("does not search until at least three characters are entered", async () => {
    const { result } = renderHook(() => useLocationAutocomplete("Ch"))

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 350))
    })

    expect(mockedAutocompleteLocations).not.toHaveBeenCalled()
    expect(result.current.suggestions).toEqual([])
    expect(result.current.hasSearched).toBe(false)
  })

  it("debounces and returns location suggestions", async () => {
    mockedAutocompleteLocations.mockResolvedValue([
      {
        label: "233 South Wacker Drive, Chicago, IL, USA",
        latitude: 41.8789,
        longitude: -87.6359,
      },
    ])

    const { result } = renderHook(() => useLocationAutocomplete("233 S Wa"))

    await waitFor(
      () => expect(mockedAutocompleteLocations).toHaveBeenCalledOnce(),
      { timeout: 1000 },
    )
    await waitFor(() => expect(result.current.hasSearched).toBe(true))

    expect(result.current.suggestions).toHaveLength(1)
    expect(result.current.suggestions[0].label).toContain("Wacker")
  })

  it("degrades autocomplete failures to an empty optional result", async () => {
    mockedAutocompleteLocations.mockRejectedValue(new Error("provider down"))

    const { result } = renderHook(() => useLocationAutocomplete("Chicago"))

    await waitFor(
      () => expect(mockedAutocompleteLocations).toHaveBeenCalledOnce(),
      { timeout: 1000 },
    )
    await waitFor(() => expect(result.current.hasSearched).toBe(true))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.suggestions).toEqual([])
  })
})
