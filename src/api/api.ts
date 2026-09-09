import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'access_token'

const api = axios.create({
  baseURL: 'http://localhost:3000',
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