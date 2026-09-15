export interface PageMeta {
  currentPage: number
  perPage: number
  total: number | null
  totalPages: number
}

export interface PageResult<T> {
  rows: T[]
  meta: PageMeta
}