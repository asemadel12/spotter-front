import { apiRequest } from "@/api/client"
import type { LocationSuggestion } from "@/types/route"

interface LocationAutocompleteResponse {
  suggestions: LocationSuggestion[]
}

export async function autocompleteLocations(
  query: string,
  signal?: AbortSignal,
): Promise<LocationSuggestion[]> {
  const response = await apiRequest<LocationAutocompleteResponse>(
    `/locations/autocomplete/?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      signal,
    },
  )
  return response.suggestions
}
