export type NumericInput = string | number | null | undefined

export function parseNumberInput(value: NumericInput): number | undefined {
  if (value === null || value === undefined)
    return undefined

  if (typeof value === 'number')
    return Number.isFinite(value) && value >= 0 ? value : undefined

  const text = value.trim()

  if (text === '')
    return undefined

  const parsed = Number(text)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

export function parseIntegerInput(value: NumericInput): number | undefined {
  const parsed = parseNumberInput(value)

  return parsed !== undefined && Number.isInteger(parsed) ? parsed : undefined
}

export function hasNumberInput(value: NumericInput): boolean {
  return value !== null && value !== undefined && String(value).trim() !== ''
}
