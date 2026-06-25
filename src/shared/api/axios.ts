import axios from 'axios'
import { API_BASE_URL, TOKEN_KEY } from '@/shared/config/env'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip the 401 redirect for auth endpoints — the thunk handles those errors itself.
    // Only redirect when a protected resource rejects an expired/missing token.
    const url = (error.config?.url as string | undefined) ?? ''
    const isAuthEndpoint = url.startsWith('/Account/')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
