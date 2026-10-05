type Dict = Record<string, any>

function isPlainObject(value: unknown): value is Dict {
  return (
    typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
  )
}

export function deepMerge<T extends Dict>(target: T, ...sources: Dict[]): T {
  for (const source of sources) {
    if (!isPlainObject(source))
      continue

    for (const key of Object.keys(source)) {
      const srcValue = source[key]
      const targetValue = (target as Dict)[key]

      if (isPlainObject(srcValue) && isPlainObject(targetValue)) {
        ;(target as Dict)[key] = deepMerge({ ...targetValue }, srcValue)
      } else if (isPlainObject(srcValue)) {
        ;(target as Dict)[key] = deepMerge({}, srcValue)
      } else {
        ;(target as Dict)[key] = srcValue
      }
    }
  }

  return target
}
