import { useEffect, useRef, useState } from 'react'
import { fetchStockDetail, type StockDetailResponse } from '../services/stockDetail'
import { getAllStockIds } from '../services/api/stockApi'

export const useStockList = (options?: { forceRefreshOnMount?: boolean }) => {
  const forceRefreshOnMount = options?.forceRefreshOnMount ?? false
  const [symbols, setSymbols] = useState<string[] | null>(null)
  const [details, setDetails] = useState<Record<string, StockDetailResponse>>({})
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(new Set<string>())

  useEffect(() => {
    const controller = new AbortController()
    let mounted = true
    getAllStockIds()
      .then((ids) => {
        if (!mounted) return
        setSymbols(ids)
      })
      .catch((e: unknown) => {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Failed to load stocks')
      })
    return () => { mounted = false; controller.abort() }
  }, [])

  useEffect(() => {
    if (!symbols || symbols.length === 0) return
    const controller = new AbortController()
    let mounted = true

    const toLoad = symbols.filter((s) => !details[s] && !loadingRef.current.has(s))
    if (toLoad.length === 0) return

    toLoad.forEach((s) => loadingRef.current.add(s))

    void Promise.all(
      toLoad.map(async (symbol) => {
        try {
          const detail = await fetchStockDetail(symbol, controller.signal, {
            forceRefresh: forceRefreshOnMount,
          })
          if (!mounted) return
          setDetails((prev) => prev[symbol] ? prev : { ...prev, [symbol]: detail })
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') return
        } finally {
          loadingRef.current.delete(symbol)
        }
      })
    )

    return () => { mounted = false; controller.abort() }
  }, [symbols, forceRefreshOnMount]) // eslint-disable-line react-hooks/exhaustive-deps

  return { symbols, details, error, isLoading: symbols === null }
}
