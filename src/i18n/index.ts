import { createI18n } from 'vue-i18n'

import en from '@/i18n/locales/en'
import vi from '@/i18n/locales/vi'

export const LOCALE_STORAGE_KEY = 'locale'
export const DEFAULT_LOCALE = 'vi'
export const SUPPORTED_LOCALES = ['vi', 'en'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export function getInitialLocale(): SupportedLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)

    if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored))
      return stored as SupportedLocale
  }
  catch { }

  return DEFAULT_LOCALE
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    vi,
    en,
  },
})

export default i18n
