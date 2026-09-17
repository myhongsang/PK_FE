export type EmptyReason =
  | 'collection'
  | 'category'
  | 'filtered'

export interface EmptyStateInput {
  categoryId: string
  categoryIsEmpty: boolean
  searchTerm: string
  hasRangeFilter: boolean
}

export function resolveEmptyReason({
  categoryId,
  categoryIsEmpty,
  searchTerm,
  hasRangeFilter,
}: EmptyStateInput): EmptyReason {
  if (categoryId !== '' && categoryIsEmpty)
    return 'category'

  if (categoryId !== '' || searchTerm !== '' || hasRangeFilter)
    return 'filtered'

  return 'collection'
}