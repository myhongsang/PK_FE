import api from '@/api/api'
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/constants/api'
import type { LoginPayload, LoginResult } from '@/types/auth'

// Cached result of the last token verification against the BE.
// `undefined` means "not verified yet during this page load".
let verifiedSession: LoginResult | null | undefined

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

    const result: LoginResult = {
      accessToken: raw.accessToken ?? raw.token ?? '',
      user: {
        id: rawUser.id ?? '',
        name: rawUser.name ?? '',
        email: rawUser.email ?? '',
      },
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, result.accessToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user))

    // A freshly issued token is valid by definition — cache it so the
    // navigation to the dashboard right after login skips re-verification.
    verifiedSession = result

    return result
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Incorrect email or password. Please try again.'
    )
  }
}

export function signOut(): void {
  verifiedSession = null
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function getStoredSession(): LoginResult | null {
  try {
    const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    const rawUser = localStorage.getItem(USER_STORAGE_KEY)

    if (!accessToken || !rawUser)
      return null

    const storedUser: any = JSON.parse(rawUser)

    return {
      accessToken,
      user: {
        id: storedUser?.id ?? '',
        name: storedUser?.name ?? '',
        email: storedUser?.email ?? '',
      },
    }
  }
  catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

/**
 * Verify the stored session against the BE before letting the user in.
 *
 * Unlike `getStoredSession` (which only checks that a token exists in
 * localStorage), this actually validates the token with the BE on every page
 * load, so a session left over from before a BE restart can no longer grant
 * access to the dashboard. Any failure — 401/403 from the BE, the BE being
 * down/restarted, or a network error — is treated as "not authenticated":
 * the stale session is cleared and the user is sent to the login page.
 *
 * The successful result is cached per page load, so subsequent in-app
 * navigations do not hit the BE again (the axios 401 interceptor still
 * handles sessions expiring mid-session).
 */
export async function verifyStoredSession(): Promise<LoginResult | null> {
  const stored = getStoredSession()

  if (!stored) {
    verifiedSession = undefined
    return null
  }

  if (verifiedSession)
    return verifiedSession

  try {
    // Any authenticated endpoint works here; `/users` is already used by the
    // app and returns 401 for an invalid token. Swap it for `/auth/me` once
    // the BE exposes a dedicated endpoint.
    await api.get(API_ENDPOINTS.USERS, { timeout: 5000 })
    verifiedSession = stored
    return verifiedSession
  }
  catch {
    signOut()
    return null
  }
}