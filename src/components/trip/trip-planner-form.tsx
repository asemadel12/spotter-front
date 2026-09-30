import { zodResolver } from "@hookform/resolvers/zod"
import { Clock3, Flag, MapPin, Package, Route } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { ApiRequestError } from "@/api/client"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ApiError, DrfValidationErrors, TripPlanRequest } from "@/types/trip"

const tripPlanSchema = z.object({
  current_location: z.string().trim().min(1, "Enter your current location."),
  pickup_location: z.string().trim().min(1, "Enter the pickup location."),
  dropoff_location: z.string().trim().min(1, "Enter the drop-off location."),
  current_cycle_used_hours: z
    .number({ invalid_type_error: "Enter the cycle hours used." })
    .min(0, "Cycle hours cannot be below 0.")
    .max(70, "Cycle hours cannot exceed 70."),
})

interface TripPlannerFormProps {
  isPending: boolean
  onSubmit: (values: TripPlanRequest) => Promise<unknown>
}

const fields = [
  {
    name: "current_location" as const,
    label: "Current Location",
    placeholder: "Chicago, IL",
    icon: MapPin,
  },
  {
    name: "pickup_location" as const,
    label: "Pickup Location",
    placeholder: "St. Louis, MO",
    icon: Package,
  },
  {
    name: "dropoff_location" as const,
    label: "Drop-off Location",
    placeholder: "Dallas, TX",
    icon: Flag,
  },
]

export function TripPlannerForm({ isPending, onSubmit }: TripPlannerFormProps) {
  const [requestError, setRequestError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<TripPlanRequest>({
    resolver: zodResolver(tripPlanSchema),
    defaultValues: {
      current_location: "",
      pickup_location: "",
      dropoff_location: "",
      current_cycle_used_hours: 0,
    },
  })

  const submit = handleSubmit(async (values) => {
    clearErrors()
    setRequestError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiRequestError && applyFieldErrors(error, setError)) {
        return
      }
      setRequestError(
        error instanceof ApiRequestError
          ? error.message
          : "Unable to reach the trip planning service.",
      )
    }
  })

  const useSampleTrip = () => {
    setValue("current_location", "Chicago, IL", { shouldValidate: true })
    setValue("pickup_location", "St. Louis, MO", { shouldValidate: true })
    setValue("dropoff_location", "Dallas, TX", { shouldValidate: true })
    setValue("current_cycle_used_hours", 20, { shouldValidate: true })
    setRequestError(null)
  }

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Route className="size-4" aria-hidden="true" />
        </div>
        <CardTitle>Plan a trip</CardTitle>
        <CardDescription>
          Enter the required trip details. Routing and HOS compliance are
          calculated by the backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={submit} noValidate>
          {fields.map(({ name, label, placeholder, icon: Icon }) => (
            <div className="space-y-2" key={name}>
              <Label htmlFor={name}>{label}</Label>
              <div className="relative">
                <Icon
                  className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id={name}
                  className="pl-9"
                  placeholder={placeholder}
                  disabled={isPending}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={`${name}-error`}
                  {...register(name)}
                />
              </div>
              {errors[name] && (
                <p id={`${name}-error`} className="text-xs text-red-600">
                  {errors[name]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="current_cycle_used_hours">
              Current Cycle Used (Hrs)
            </Label>
            <div className="relative">
              <Clock3
                className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="current_cycle_used_hours"
                type="number"
                min="0"
                max="70"
                step="0.1"
                className="pl-9"
                disabled={isPending}
                aria-invalid={Boolean(errors.current_cycle_used_hours)}
                aria-describedby="current_cycle_used_hours-error"
                {...register("current_cycle_used_hours", { valueAsNumber: true })}
              />
            </div>
            {errors.current_cycle_used_hours && (
              <p id="current_cycle_used_hours-error" className="text-xs text-red-600">
                {errors.current_cycle_used_hours.message}
              </p>
            )}
          </div>

          {requestError && <Alert aria-live="polite">{requestError}</Alert>}

          <div className="grid gap-2 pt-1">
            <Button
              type="submit"
              className="h-11 bg-blue-600 hover:bg-blue-700"
              disabled={isPending}
            >
              {isPending ? "Planning Route..." : "Plan Trip"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-9 text-slate-500"
              onClick={useSampleTrip}
              disabled={isPending}
            >
              Use sample trip
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

type SetFormError = ReturnType<typeof useForm<TripPlanRequest>>["setError"]

function applyFieldErrors(
  error: ApiRequestError,
  setError: SetFormError,
): boolean {
  const payload = error.payload
  if (!payload) return false
  if ("error" in payload) {
    const applicationError = (payload as ApiError).error
    if (applicationError.field && applicationError.field in tripPlanSchema.shape) {
      setError(applicationError.field, { message: applicationError.message })
      return true
    }
    return false
  }

  let applied = false
  for (const field of Object.keys(tripPlanSchema.shape) as Array<
    keyof TripPlanRequest
  >) {
    const messages = (payload as DrfValidationErrors)[field]
    if (messages?.length) {
      setError(field, { message: messages[0] })
      applied = true
    }
  }
  return applied
}
