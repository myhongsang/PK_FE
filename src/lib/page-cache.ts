interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const TTL_MS = 60_000

const MAX_ENTRIES = 100

const pageCache = new Map<string, CacheEntry<unknown>>()

export function buildCacheKey(
  namespace: string,
  parts: Record<string, string | number | undefined> = {},
): string {
  const query = Object.keys(parts)
    .filter(key => parts[key] !== undefined && parts[key] !== '')
    .sort()
    .map(key => `${key}=${parts[key]}`)
    .join('&')

  return query ? `${namespace}?${query}` : `${namespace}?`
}

export function getCached<T>(key: string): T | undefined {
  const hit = pageCache.get(key)

  if (!hit)
    return undefined

  if (Date.now() > hit.expiresAt) {
    pageCache.delete(key)
    return undefined
  }

  pageCache.delete(key)
  pageCache.set(key, hit)

  return hit.value as T
}

export function setCached<T>(key: string, value: T): T {
  pageCache.set(key, { value, expiresAt: Date.now() + TTL_MS })
  trimOldest()

  return value
}

function trimOldest() {
  while (pageCache.size > MAX_ENTRIES) {
    const oldest = pageCache.keys().next().value

    if (oldest === undefined)
      break

    pageCache.delete(oldest)
  }
}

export function invalidatePageCache(namespace?: string): void {
  if (!namespace) {
    pageCache.clear()
    return
  }

  const prefix = `${namespace}?`

  for (const key of [...pageCache.keys()]) {
    if (key.startsWith(prefix))
      pageCache.delete(key)
  }
}
