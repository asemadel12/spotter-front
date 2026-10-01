import { LoaderCircle, type LucideIcon } from "lucide-react"
import type { KeyboardEvent, Ref } from "react"
import { useId, useState } from "react"

import { Input } from "@/components/ui/input"
import { useLocationAutocomplete } from "@/hooks/use-location-autocomplete"
import type { LocationSuggestion } from "@/types/route"

interface LocationAutocompleteInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  inputRef?: Ref<HTMLInputElement>
  placeholder: string
  disabled: boolean
  invalid: boolean
  describedBy: string
  icon: LucideIcon
}

export function LocationAutocompleteInput({
  id,
  value,
  onChange,
  onBlur,
  inputRef,
  placeholder,
  disabled,
  invalid,
  describedBy,
  icon: Icon,
}: LocationAutocompleteInputProps) {
  const listboxId = useId()
  const [isFocused, setIsFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [suppressSuggestions, setSuppressSuggestions] = useState(false)
  const { suggestions, isLoading, hasSearched } =
    useLocationAutocomplete(value)

  const canShowResults =
    isFocused && !suppressSuggestions && value.trim().length >= 3
  const isOpen =
    canShowResults && (isLoading || hasSearched || suggestions.length > 0)

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.label)
    setHighlightedIndex(-1)
    setSuppressSuggestions(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === "Escape") setIsFocused(false)
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlightedIndex((current) =>
        current >= suggestions.length - 1 ? 0 : current + 1,
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlightedIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      )
      return
    }

    if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault()
      selectSuggestion(suggestions[highlightedIndex])
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      setIsFocused(false)
    }
  }

  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-slate-400"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setHighlightedIndex(-1)
          setSuppressSuggestions(false)
        }}
        onFocus={() => {
          setIsFocused(true)
          setSuppressSuggestions(false)
        }}
        onBlur={() => {
          setIsFocused(false)
          setHighlightedIndex(-1)
          onBlur()
        }}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-9"
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          highlightedIndex >= 0
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined
        }
        autoComplete="off"
      />

      {isLoading && (
        <LoaderCircle
          className="pointer-events-none absolute right-3 top-3.5 size-4 animate-spin text-slate-400"
          aria-label="Searching locations"
        />
      )}

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Location suggestions"
              className="max-h-64 overflow-y-auto py-1"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                  className={[
                    "cursor-pointer px-3 py-2.5 text-sm text-slate-700",
                    highlightedIndex === index
                      ? "bg-blue-50 text-blue-900"
                      : "hover:bg-slate-50",
                  ].join(" ")}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion.label}
                </li>
              ))}
            </ul>
          ) : !isLoading && hasSearched ? (
            <p className="px-3 py-3 text-xs leading-5 text-slate-500">
              No suggestions found. You can still use the location exactly as
              entered.
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
