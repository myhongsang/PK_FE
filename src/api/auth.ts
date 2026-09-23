import api from '@/api/api'
import i18n from '@/i18n'
import {
  API_ENDPOINTS,
  REMEMBERED_EMAIL_STORAGE_KEY,
  REMEMBER_STORAGE_KEY,
  TOKEN_EXPIRY_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '@/constants/api'
import type { LoginPayload, LoginResult } from '@/types/auth'

let verifiedSession: LoginResult | null | undefined
let expiryTimer: ReturnType<typeof setTimeout> | undefined

const MAX_TIMER_DELAY = 2_147_000_000

function decodeJwtExpiresAt(accessToken: string): number | undefined {
  try {
    const payload = accessToken.split('.')[1]

    if (!payload)
      return undefined

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(base64)) as { exp?: unknown }
    const exp = Number(claims.exp)

    return Number.isFinite(exp) && exp > 0 ? exp * 1000 : undefined
  }
  catch {
    return undefined
  }
}

function resolveExpiresAt(raw: any, accessToken: string): number | undefined {
  const expiresIn = Number(raw?.expiresIn)

  if (Number.isFinite(expiresIn) && expiresIn > 0)
    return Date.now() + 10 * 1000

  return decodeJwtExpiresAt(accessToken)
}

function persistSession(result: LoginResult, remember: boolean): void {
  const primary = remember ? localStorage : sessionStorage
  const secondary = remember ? sessionStorage : localStorage

  primary.setItem(TOKEN_STORAGE_KEY, result.accessToken)
  primary.setItem(USER_STORAGE_KEY, JSON.stringify(result.user))

  if (result.expiresAt === undefined)
    primary.removeItem(TOKEN_EXPIRY_STORAGE_KEY)
  else
    primary.setItem(TOKEN_EXPIRY_STORAGE_KEY, String(result.expiresAt))

  secondary.removeItem(TOKEN_STORAGE_KEY)
  secondary.removeItem(USER_STORAGE_KEY)
  secondary.removeItem(TOKEN_EXPIRY_STORAGE_KEY)

  try {
    localStorage.setItem(REMEMBER_STORAGE_KEY, remember ? '1' : '0')

    if (remember)
      localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, result.user.email)
    else
      localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY)
  }
  catch { }
}

export function getRememberPreference(): boolean {
  try {
    return localStorage.getItem(REMEMBER_STORAGE_KEY) !== '0'
  }
  catch {
    return true
  }
}

export function getRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_STORAGE_KEY) ?? ''
  }
  catch {
    return ''
  }
}

function clearStoredSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(USER_STORAGE_KEY)
  sessionStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY)
}

function clearExpiryTimer(): void {
  if (expiryTimer)
    clearTimeout(expiryTimer)

  expiryTimer = undefined
}

function handleSessionExpired(): void {
  expiryTimer = undefined
  verifiedSession = undefined
  clearStoredSession()

  if (!window.location.pathname.startsWith('/login'))
    window.location.replace('/login?reason=expired')
}

export function scheduleExpiryCheck(expiresAt?: number): void {
  clearExpiryTimer()

  if (expiresAt === undefined)
    return

  if (Date.now() >= expiresAt) {
    handleSessionExpired()
    return
  }

  const delay = expiresAt - Date.now() - 1000

   if (delay > MAX_TIMER_DELAY)
    return

  expiryTimer = setTimeout(handleSessionExpired, Math.max(delay, 0))
}

export async function login(
  payload: LoginPayload
): Promise<LoginResult> {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: payload.email,
      password: payload.password,
    })

    const raw: any = response.data?.data ?? response.data ?? {}
    const rawUser: any = raw.user ?? {}

    const accessToken = raw.accessToken ?? raw.token ?? ''

    const result: LoginResult = {
      accessToken,
      user: {
        id: rawUser.id ?? '',
        name: rawUser.name ?? '',
        email: rawUser.email ?? '',
      },
      expiresAt: resolveExpiresAt(raw, accessToken),
    }

    persistSession(result, payload.remember === true)
    scheduleExpiryCheck(result.expiresAt)

    verifiedSession = result

    return result
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('auth.loginFailed')
    )
  }
}

export function signOut(): void {
  clearExpiryTimer()
  verifiedSession = null
  clearStoredSession()
}

export function getStoredSession(): LoginResult | null {
  try {
    const accessToken = sessionStorage.getItem(TOKEN_STORAGE_KEY)
      ?? localStorage.getItem(TOKEN_STORAGE_KEY)
    const rawUser = sessionStorage.getItem(USER_STORAGE_KEY)
      ?? localStorage.getItem(USER_STORAGE_KEY)

    if (!accessToken || !rawUser)
      return null

    const rawExpiresAt = sessionStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY)
      ?? localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY)
    const expiresAt = rawExpiresAt === null ? undefined : Number(rawExpiresAt)

    if (expiresAt !== undefined && (!Number.isFinite(expiresAt) || Date.now() >= expiresAt)) {
      clearStoredSession()
      return null
    }

    const storedUser: any = JSON.parse(rawUser)

    return {
      accessToken,
      user: {
        id: storedUser?.id ?? '',
        name: storedUser?.name ?? '',
        email: storedUser?.email ?? '',
      },
      expiresAt: expiresAt !== undefined && Number.isFinite(expiresAt) ? expiresAt : undefined,
    }
  }
  catch {
    clearStoredSession()
    return null
  }
}

export async function verifyStoredSession(): Promise<LoginResult | null> {
  const stored = getStoredSession()

  if (!stored) {
    clearExpiryTimer()
    verifiedSession = undefined
    return null
  }

  if (verifiedSession) {
    scheduleExpiryCheck(verifiedSession.expiresAt)
    return verifiedSession
  }

  try {
    await api.get(API_ENDPOINTS.USERS, { timeout: 5000 })
    verifiedSession = stored
    scheduleExpiryCheck(stored.expiresAt)
    return verifiedSession
  }
  catch {
    signOut()
    return null
  }
}