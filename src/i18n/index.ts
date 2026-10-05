import { createI18n } from 'vue-i18n'

import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '@/constants/i18n'
import en from '@/i18n/locales/en'
import vi from '@/i18n/locales/vi'
import { deepMerge } from '@/i18n/utils/deep-merge'
import type { SupportedLocale } from '@/constants/i18n'

const DEFAULT_LOCALE = 'vi'

const i18nModules = import.meta.glob<{ default: Record<string, any> }>(
  './modules/*.i18n.ts',
  { eager: true },
)

function buildLocaleMessages(base: Record<string, any>, locale: string) {
  const merged = deepMerge({}, base)

  for (const module of Object.values(i18nModules)) {
    const messages = module.default?.[locale]
    if (messages)
      deepMerge(merged, messages)
  }

  return merged
}

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
    vi: buildLocaleMessages(vi as Record<string, any>, 'vi'),
    en: buildLocaleMessages(en as Record<string, any>, 'en'),
  },
})

export default i18n
