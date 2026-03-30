import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getFavoriteStockIds } from '../services/api/userApi'
import { useAuthContext } from './AuthContext'

interface WatchlistContextValue {
  /** Uppercase stock symbols */
  favoriteIds: ReadonlySet<string>
  isLoading: boolean
  refresh: () => Promise<void>
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuthContext()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!userId) {
      setFavoriteIds(new Set())
      return
    }
    setIsLoading(true)
    try {
      const ids = await getFavoriteStockIds(userId)
      setFavoriteIds(new Set(ids))
    } catch {
      setFavoriteIds(new Set())
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ favoriteIds, isLoading, refresh }),
    [favoriteIds, isLoading, refresh],
  )

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}

export const useWatchlist = (): WatchlistContextValue => {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}
