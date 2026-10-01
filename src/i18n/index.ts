import { createI18n } from 'vue-i18n'

import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '@/constants/i18n'
import en from '@/i18n/locales/en'
import vi from '@/i18n/locales/vi'
import type { SupportedLocale } from '@/constants/i18n'

const DEFAULT_LOCALE = 'vi'

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
