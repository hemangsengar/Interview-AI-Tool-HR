import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { API_BASE_URL } from '../lib/apiBaseUrl'
import { reportBackendWarmupError } from '../store/backendWarmupStore'

const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('🔑 Token from localStorage:', token ? 'EXISTS' : 'MISSING')
    console.log('📡 Request to:', config.url)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header set')
    } else {
      console.log('❌ No token found!')
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    reportBackendWarmupError(error)

    if (error.response?.status === 401) {
      // Only logout if not on login/signup pages
      const currentPath = window.location.hash || window.location.pathname
      if (!currentPath.includes('login') && !currentPath.includes('signup')) {
        useAuthStore.getState().logout()
        window.location.href = '/#/hr/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
