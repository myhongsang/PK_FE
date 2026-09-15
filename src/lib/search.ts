export function normalizeText(value: string): string {
  if (!value)
    return ''

  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
}

export function matchesSearch(
  value: string | null | undefined,
  term: string,
): boolean {
  const normalizedTerm = normalizeText(term)

  if (!normalizedTerm)
    return true

  if (!value)
    return false

  return normalizeText(value).includes(normalizedTerm)
}

export interface SearchSuggestion {
  label: string
  detail?: string
}
