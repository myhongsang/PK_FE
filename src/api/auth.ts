import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { ROLE_ADMIN, ROLE_EMPLOYEE, type UserRole } from '@/constants/role'
import { authStore } from '@/stores/auth'
import type { LoginPayload, LoginResult } from '@/types/auth'

let verifiedSession: LoginResult | null | undefined
let expiryTimer: ReturnType<typeof setTimeout> | undefined

const MAX_TIMER_DELAY = 2_147_000_000

const REMEMBER_STORAGE_KEY = 'remember_login'

const REMEMBERED_EMAIL_STORAGE_KEY = 'remembered_email'

function decodeJwtPayload(accessToken: string): Record<string, unknown> {
  try {
    const payload = accessToken.split('.')[1]

    if (!payload)
      return {}

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

    return JSON.parse(atob(base64)) as Record<string, unknown>
  }
  catch {
    return {}
  }
}

function decodeJwtExpiresAt(accessToken: string): number | undefined {
  const exp = Number(decodeJwtPayload(accessToken).exp)

  return Number.isFinite(exp) && exp > 0 ? exp * 1000 : undefined
}

function normalizeRole(value: unknown): UserRole | null {
  const role = String(value ?? '').trim().toUpperCase()

  return role === ROLE_ADMIN || role === ROLE_EMPLOYEE ? (role as UserRole) : null
}

// Ưu tiên role trong response, fallback sang JWT cho phiên đã lưu từ trước, mặc định EMPLOYEE.
function resolveRole(rawRole: unknown, accessToken: string): UserRole {
  return normalizeRole(rawRole)
    ?? normalizeRole(decodeJwtPayload(accessToken).role)
    ?? ROLE_EMPLOYEE
}

function resolveExpiresAt(raw: any, accessToken: string): number | undefined {
  const expiresIn = Number(raw?.expiresIn)

  if (Number.isFinite(expiresIn) && expiresIn > 0)
    return Date.now() + 10 * 1000

  return decodeJwtExpiresAt(accessToken)
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

function clearExpiryTimer(): void {
  if (expiryTimer)
    clearTimeout(expiryTimer)

  expiryTimer = undefined
}

function handleSessionExpired(): void {
  expiryTimer = undefined
  verifiedSession = undefined
  authStore.getState().clearSession()

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
        role: resolveRole(rawUser.role, accessToken),
      },
      expiresAt: resolveExpiresAt(raw, accessToken),
    }

    // Persist session to Zustand store (which syncs to localStorage)
    authStore.getState().setSession(result)

    try {
      localStorage.setItem(REMEMBER_STORAGE_KEY, payload.remember ? '1' : '0')
      if (payload.remember) {
        localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, result.user.email)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY)
      }
    } catch { }

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
  authStore.getState().clearSession()
}

export function getStoredSession(): LoginResult | null {
  const { token, user, expiresAt } = authStore.getState()

  if (!token || !user) {
    return null
  }

  if (expiresAt && Date.now() >= expiresAt) {
    authStore.getState().clearSession()
    return null
  }

  return {
    accessToken: token,
    user: {
      id: user.id ?? '',
      name: user.name ?? '',
      email: user.email ?? '',
      role: resolveRole(user.role, token),
    },
    expiresAt: expiresAt ?? undefined,
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
