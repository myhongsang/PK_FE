export const LOCALE_STORAGE_KEY = 'locale'

export const SUPPORTED_LOCALES = ['vi', 'en'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]