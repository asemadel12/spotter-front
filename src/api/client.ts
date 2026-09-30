import type { ApiErrorPayload } from "@/types/api"

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api"

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  return (configured || DEFAULT_API_BASE_URL).replace(/\/$/, "")
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly payload?: ApiErrorPayload

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.payload = payload
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
  } catch {
    throw new ApiRequestError(
      "Unable to reach the trip planning service.",
      0,
    )
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new ApiRequestError(
      extractSafeMessage(payload),
      response.status,
      payload as ApiErrorPayload,
    )
  }
  return payload as T
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    if (!response.ok) return undefined
    throw new ApiRequestError(
      "The trip planning service returned an invalid response.",
      response.status,
    )
  }
}

function extractSafeMessage(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message
  }
  return "The trip could not be planned. Please review your details and try again."
}
