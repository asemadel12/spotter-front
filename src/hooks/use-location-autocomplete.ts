import { useEffect, useState } from "react"

import { autocompleteLocations } from "@/api/locations"
import type { LocationSuggestion } from "@/types/route"

const AUTOCOMPLETE_DELAY_MS = 300
const MIN_QUERY_LENGTH = 3

interface LocationAutocompleteState {
  query: string
  suggestions: LocationSuggestion[]
  isLoading: boolean
  hasSearched: boolean
}

const EMPTY_STATE: Omit<LocationAutocompleteState, "query"> = {
  suggestions: [],
  isLoading: false,
  hasSearched: false,
}

export function useLocationAutocomplete(query: string) {
  const normalized = query.trim()
  const [state, setState] = useState<LocationAutocompleteState>({
    query: "",
    ...EMPTY_STATE,
  })

  useEffect(() => {
    if (normalized.length < MIN_QUERY_LENGTH) return

    let controller: AbortController | null = null
    const timer = window.setTimeout(async () => {
      const requestController = new AbortController()
      controller = requestController

      setState({
        query: normalized,
        suggestions: [],
        isLoading: true,
        hasSearched: false,
      })

      try {
        const suggestions = await autocompleteLocations(
          normalized,
          requestController.signal,
        )
        setState({
          query: normalized,
          suggestions,
          isLoading: false,
          hasSearched: true,
        })
      } catch {
        if (requestController.signal.aborted) return
        setState({
          query: normalized,
          suggestions: [],
          isLoading: false,
          hasSearched: true,
        })
      }
    }, AUTOCOMPLETE_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      controller?.abort()
    }
  }, [normalized])

  if (
    normalized.length < MIN_QUERY_LENGTH ||
    state.query !== normalized
  ) {
    return EMPTY_STATE
  }

  return {
    suggestions: state.suggestions,
    isLoading: state.isLoading,
    hasSearched: state.hasSearched,
  }
}
