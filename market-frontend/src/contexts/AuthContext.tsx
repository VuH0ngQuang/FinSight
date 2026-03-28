import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getUserDetail, type UserDetailDto } from '../services/api/userApi'

const USER_DETAIL_STORAGE_KEY = 'finsight_userDetail'

const readStoredUserDetail = (): UserDetailDto | null => {
  try {
    const raw = localStorage.getItem(USER_DETAIL_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserDetailDto
  } catch {
    return null
  }
}

const persistUserDetail = (detail: UserDetailDto | null) => {
  try {
    if (!detail) {
      localStorage.removeItem(USER_DETAIL_STORAGE_KEY)
      return
    }
    localStorage.setItem(USER_DETAIL_STORAGE_KEY, JSON.stringify(detail))
  } catch {
    // ignore quota / serialization failures
  }
}

interface AuthState {
  userId: string | null
  token: string | null
  isAdmin: boolean
  userDetail: UserDetailDto | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (userId: string, token: string, isAdmin: boolean) => Promise<void>
  logout: () => void
  refreshUserDetail: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const normalizeStoredValue = (value: string | null): string | null => {
  if (value == null) return null
  const v = value.trim()
  if (!v || v === 'undefined' || v === 'null') return null
  return v
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    userId: normalizeStoredValue(localStorage.getItem('finsight_userId')),
    token: normalizeStoredValue(localStorage.getItem('finsight_token')),
    isAdmin: localStorage.getItem('finsight_isAdmin') === 'true',
    userDetail: readStoredUserDetail(),
    isLoading: true,
  })

  const fetchUserDetail = useCallback(async (userId: string) => {
    try {
      const detail = await getUserDetail(userId)
      persistUserDetail(detail)
      setState((prev) => ({ ...prev, userDetail: detail, isLoading: false }))
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  useEffect(() => {
    if (state.userId) {
      void fetchUserDetail(state.userId)
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (userId: string, token: string, isAdmin: boolean) => {
    localStorage.setItem('finsight_userId', userId)
    // Backend currently doesn't return JWT yet; avoid persisting the literal string "undefined".
    localStorage.setItem('finsight_token', normalizeStoredValue(token) ?? '')
    localStorage.setItem('finsight_isAdmin', String(isAdmin))
    setState((prev) => ({ ...prev, userId, token, isAdmin, isLoading: true }))
    await fetchUserDetail(userId)
  }, [fetchUserDetail])

  const logout = useCallback(() => {
    localStorage.removeItem('finsight_userId')
    localStorage.removeItem('finsight_token')
    localStorage.removeItem('finsight_isAdmin')
    localStorage.removeItem(USER_DETAIL_STORAGE_KEY)
    setState({ userId: null, token: null, isAdmin: false, userDetail: null, isLoading: false })
  }, [])

  const refreshUserDetail = useCallback(async () => {
    if (state.userId) await fetchUserDetail(state.userId)
  }, [state.userId, fetchUserDetail])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUserDetail }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
