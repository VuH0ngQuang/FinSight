import { useEffect, useState } from 'react'
import { subscribeToMarketData, type MarketDataPayload } from '../services/mqtt'

export const useMarketData = () => {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [recentUpdates, setRecentUpdates] = useState<Record<string, number>>({})

  useEffect(() => {
    const handleMarketData = (data: MarketDataPayload) => {
      const stockId = data.stockId.toUpperCase()
      const now = Date.now()
      setPrices((prev) => ({
        ...prev,
        [stockId]: data.matchPrice,
      }))
      setRecentUpdates((prev) => ({
        ...prev,
        [stockId]: now,
      }))
    }

    const unsubscribe = subscribeToMarketData(handleMarketData)

    return () => {
      unsubscribe()
    }
  }, [])

  const getMatchPrice = (stockId: string): number | undefined => {
    return prices[stockId.toUpperCase()]
  }

  const isRecentlyUpdated = (stockId: string, thresholdMs = 1000): boolean => {
    const updateTime = recentUpdates[stockId.toUpperCase()]
    if (!updateTime) return false
    return Date.now() - updateTime < thresholdMs
  }

  return { prices, getMatchPrice, isRecentlyUpdated }
}

