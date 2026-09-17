export interface PageTarget {
  lastPage: number
  outOfRange: boolean
}

export function resolvePageTarget(requestedPage: number, apiTotalPages: number): PageTarget {
  const safeTotal = Number.isFinite(apiTotalPages) ? Math.floor(apiTotalPages) : 0
  const lastPage = Math.max(1, safeTotal)
  const safeRequested = Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1

  return {
    lastPage,
    outOfRange: safeRequested > lastPage,
  }
}