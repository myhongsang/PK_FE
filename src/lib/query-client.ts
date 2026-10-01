import { QueryClient } from '@tanstack/vue-query'

export const STALE_TIME_MS = 60_000

const GC_TIME_MS = 5 * 60_000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      retry: 0,
    },
  },
})
