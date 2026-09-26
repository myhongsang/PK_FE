import axios from 'axios'

import {
  API_BASE_URL,
  API_ENDPOINTS,
} from '@/constants/api'
import { authStore } from '@/stores/auth'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = authStore.getState().token
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
      authStore.getState().clearSession()

      if (!window.location.pathname.startsWith('/login'))
        window.location.replace('/login?reason=expired')
    }

    return Promise.reject(error)
  },
)

export default api
