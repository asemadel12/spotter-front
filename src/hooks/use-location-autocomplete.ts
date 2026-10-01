import { useEffect, useState } from "react"

import { autocompleteLocations } from "@/api/locations"
import type { LocationSuggestion } from "@/types/route"

const AUTOCOMPLETE_DELAY_MS = 300
const MIN_QUERY_LENGTH = 3

interface LocationAutocompleteState {
  suggestions: LocationSuggestion[]
  isLoading: boolean
  hasSearched: boolean
}

export function useLocationAutocomplete(query: string): LocationAutocompleteState {
  const [state, setState] = useState<LocationAutocompleteState>({
    suggestions: [],
    isLoading: false,
    hasSearched: false,
  })

  useEffect(() => {
    const normalized = query.trim()
    if (normalized.length < MIN_QUERY_LENGTH) {
      setState({
        suggestions: [],
        isLoading: false,
        hasSearched: false,
      })
      return
    }

    let controller: AbortController | null = null
    const timer = window.setTimeout(async () => {
      controller = new AbortController()
      setState((current) => ({
        ...current,
        isLoading: true,
        hasSearched: false,
      }))

      try {
        const suggestions = await autocompleteLocations(
          normalized,
          controller.signal,
        )
        setState({
          suggestions,
          isLoading: false,
          hasSearched: true,
        })
      } catch {
        if (controller.signal.aborted) return
        setState({
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
  }, [query])

  return state
}
