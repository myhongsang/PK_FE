import api from './api'
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/constants'

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResult {
  accessToken: string
  user: {
    id: string
    name: string
    email: string
  }
}

export async function login(
  payload: LoginPayload
): Promise<LoginResult> {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: payload.email,
      password: payload.password,
    })

    // Backend có thể trả payload trực tiếp hoặc bọc trong { data: ... } -> chuẩn hóa
    const raw: any = response.data?.data ?? response.data ?? {}
    const rawUser: any = raw.user ?? {}

    // Đảm bảo các trường luôn tồn tại để UI không bị lỗi khi backend trả thiếu
    const result: LoginResult = {
      accessToken: raw.accessToken ?? raw.token ?? '',
      user: {
        id: rawUser.id ?? '',
        name: rawUser.name ?? '',
        email: rawUser.email ?? '',
      },
    }

    // Lưu phiên đăng nhập để refresh trang không bị bắt đăng nhập lại
    // (token -> interceptor tự gắn vào header; user -> hiển thị tên trên UI)
    localStorage.setItem(TOKEN_STORAGE_KEY, result.accessToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user))

    return result
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Incorrect email or password. Please try again.'
    )
  }
}

export function signOut(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

/** Khôi phục phiên đăng nhập đã lưu trong localStorage (nếu có) */
export function getStoredSession(): LoginResult | null {
  try {
    const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    const rawUser = localStorage.getItem(USER_STORAGE_KEY)

    // Thiếu token hoặc thông tin user -> coi như chưa đăng nhập
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
    // Dữ liệu trong localStorage bị hỏng -> dọn sạch và yêu cầu đăng nhập lại
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}