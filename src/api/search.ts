import api from '@/api/api'

import type { PageMeta, PageResult } from '@/types/pagination'

export const PAGE_SIZE = 25

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
    ?? data?.meta?.last_page
    ?? data?.total_pages
    ?? data?.last_page

  if (typeof hint === 'number' && hint > 0)
    return hint

  const headerHint = headers?.['x-total-pages'] ?? headers?.['x-pagination-pages']
  const parsed = Number(headerHint)

  if (Number.isFinite(parsed) && parsed > 0)
    return Math.ceil(parsed)

  return null
}

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
  page: number,
  params?: Record<string, string | number | undefined>,
): Promise<PageResult<T>> {
  const response = await api.get(path, {
    params: {
      ...(params ?? {}),
      page,
      per_page: PAGE_SIZE,
    },
  })

  return {
    rows: extractRows(response.data) as T[],
    meta: pageMetaOf(response.data, response.headers, page),
  }
}