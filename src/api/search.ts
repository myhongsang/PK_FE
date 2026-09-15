import api from '@/api/api'

export const SEARCH_PAGE_SIZE = 100
const MAX_SEARCH_PAGES = 20

export function extractRows(data: any): any[] {
  if (Array.isArray(data))
    return data

  if (Array.isArray(data?.data))
    return data.data

  if (Array.isArray(data?.results))
    return data.results

  return []
}

function totalPagesOf(data: any, headers: any): number | null {
  const hint =
    data?.meta?.total_pages
    ?? data?.meta?.totalPages
    ?? data?.total_pages
    ?? data?.totalPages
    ?? data?.meta?.last_page
    ?? data?.last_page

  if (typeof hint === 'number' && hint > 0)
    return hint

  const headerHint = headers?.['x-total-pages'] ?? headers?.['x-pagination-pages']
  const parsed = Number(headerHint)

  if (Number.isFinite(parsed) && parsed > 0)
    return Math.ceil(parsed)

  return null
}

export async function fetchAllRows(
function totalOf(data: any, headers: any): number | null {
  const hint =
    data?.meta?.total
    ?? data?.total
    ?? data?.total_count
    ?? data?.count

  const parsed = Number(hint)

  if (Number.isFinite(parsed) && parsed >= 0)
    return parsed

  const headerHint = headers?.['x-total-count'] ?? headers?.['x-total']
  const headerParsed = Number(headerHint)

  if (Number.isFinite(headerParsed) && headerParsed >= 0)
    return headerParsed

  return null
}

function perPageOf(data: any): number {
  const hint =
    data?.meta?.per_page
    ?? data?.meta?.limit
    ?? data?.per_page
    ?? data?.page_size
    ?? data?.limit

  const parsed = Number(hint)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : PAGE_SIZE
}

function pageMetaOf(data: any, headers: any, requestedPage: number): PageMeta {
  const total = totalOf(data, headers)
  const totalPages =
    totalPagesOf(data, headers)
    ?? (total !== null ? Math.ceil(total / PAGE_SIZE) : Math.max(1, requestedPage))

  return {
    currentPage: requestedPage,
    perPage: perPageOf(data),
    total,
    totalPages,
  }
}

export async function fetchRowsPage<T = any>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<any[]> {
  const rows: any[] = []
  const seen = new Set<string>()
): Promise<PageResult<T>> {
  const response = await api.get(path, {
    params: {
      ...(params ?? {}),
      page,
      limit: PAGE_SIZE,
    },
  })

  for (let page = 1; page <= MAX_SEARCH_PAGES; page++) {
    const response = await api.get(path, {
      params: {
        ...(params ?? {}),
        page,
        per_page: SEARCH_PAGE_SIZE,
      },
    })

    const current = extractRows(response.data)
    if (current.length === 0)
      break

    let newCount = 0

    for (const row of current) {
      const key = String(row?.id ?? JSON.stringify(row))

      if (!seen.has(key)) {
        seen.add(key)
        rows.push(row)
        newCount++
      }
    }

    const totalPages = totalPagesOf(response.data, response.headers)

    if (totalPages !== null && page >= totalPages)
      break

    if (page > 1 && (current.length < SEARCH_PAGE_SIZE || newCount === 0))
      break
  }

  return rows
}