import { STATUS_INACTIVE } from '@/constants/status'

/**
 * Backend dùng soft delete: bản ghi bị xoá vẫn nằm trong DB với status INACTIVE.
 * Bản ghi cũ/thiếu field status được coi là còn hiệu lực (ACTIVE).
 */
export function isInactiveStatus(status?: string | null): boolean {
  if (status === null || status === undefined)
    return false

  return String(status).trim().toUpperCase() === STATUS_INACTIVE
}

export function isActiveStatus(status?: string | null): boolean {
  return !isInactiveStatus(status)
}

/** Loại bỏ các bản ghi đã bị xoá (status INACTIVE) khỏi dữ liệu trả về. */
export function excludeInactive<T extends { status?: string | null }>(
  rows: T[],
): T[] {
  return rows.filter(row => isActiveStatus(row.status))
}
