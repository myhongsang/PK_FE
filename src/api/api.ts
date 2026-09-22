import axios from 'axios'

import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/constants/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY)
    ?? localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token)
    config.headers.Authorization = `Bearer ${token}`

  return config
})

api.interceptors.response.use(
  response => response,
  (error) => {
    if (
      error.response?.status === 401
      && error.config?.url !== API_ENDPOINTS.AUTH.LOGIN
    ) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      sessionStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
      window.location.reload()
    }

    return Promise.reject(error)
  },
)

export default api