import { STATUS_INACTIVE } from '@/constants/status'

export function isInactiveStatus(status?: string | null): boolean {
  if (status === null || status === undefined)
    return false

  return String(status).trim().toUpperCase() === STATUS_INACTIVE
}

export function isActiveStatus(status?: string | null): boolean {
  return !isInactiveStatus(status)
}

export function excludeInactive<T extends { status?: string | null }>(
  rows: T[],
): T[] {
  return rows.filter(row => isActiveStatus(row.status))
}
