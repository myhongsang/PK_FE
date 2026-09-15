import { reactive } from 'vue'

export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)

    if (stored === 'light' || stored === 'dark')
      return stored
  }
  catch {  }

  return 'light'
}

function applyMode(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.style.colorScheme = mode
}

export const theme = reactive({
  mode: getInitialMode(),
})

export function initTheme(): void {
  applyMode(theme.mode)
}

export function toggleTheme(): void {
  theme.mode = theme.mode === 'dark' ? 'light' : 'dark'

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.mode)
  }
  catch {  }

  applyMode(theme.mode)
}
