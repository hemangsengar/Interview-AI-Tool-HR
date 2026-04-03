const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl)
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
  }

  return ''
}

export const API_BASE_URL = getApiBaseUrl()
export const hasConfiguredApiBaseUrl = Boolean(API_BASE_URL)
