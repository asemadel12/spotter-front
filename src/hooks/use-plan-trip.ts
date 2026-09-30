import { useMutation } from "@tanstack/react-query"

import { planTrip } from "@/api/trips"

export function usePlanTrip() {
  return useMutation({ mutationFn: planTrip })
}
