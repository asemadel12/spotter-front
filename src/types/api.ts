import type { TripPlanRequest } from "@/types/trip"

export interface ApplicationError {
  code: string
  field?: keyof TripPlanRequest
  message: string
}

export interface ApiError {
  error: ApplicationError
}

export type DrfValidationErrors = Partial<
  Record<keyof TripPlanRequest | "non_field_errors", string[]>
>

export type ApiErrorPayload = ApiError | DrfValidationErrors
