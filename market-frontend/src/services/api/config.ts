const rawBase = import.meta.env.VITE_API_BASE_URL ?? 'http://103.162.20.119:3000'
const normalizedBase = rawBase.replace(/\/+$/, '')
export const API_BASE_URL = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`

export const apiFetch = async (path: string, options: RequestInit = {}, token?: string | null): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers })
}

export const getToken = (): string | null => localStorage.getItem('finsight_token')
export const getUserId = (): string | null => localStorage.getItem('finsight_userId')
export const getIsAdmin = (): boolean => localStorage.getItem('finsight_isAdmin') === 'true'

export const authFetch = (path: string, options: RequestInit = {}): Promise<Response> =>
  apiFetch(path, options, getToken())
