import axios from 'axios'

import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Tự động gắn Authorization: Bearer <token> cho mọi request sau khi đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token)
    config.headers.Authorization = `Bearer ${token}`

  return config
})

export default api