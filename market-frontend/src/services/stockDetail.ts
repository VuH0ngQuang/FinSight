import { API_STOCK_DETAIL_URL } from '../config/api'

export type StockYearApiRecord = {
  netIncome?: number
  totalEquity?: number
  intangibles?: number
  operatingCashFlow?: number
  freeCashFlow?: number
  revenue?: number
  dividendPerShare?: number
  sharesOutstanding?: number
  priceEndYear?: number
  costOfEquity?: number
  wacc?: number
  dividendGrowthRate?: number
  ddm?: number
  dcf?: number
  ri?: number
  pe?: number
  pbv?: number
  pcf?: number
  ps?: number
}

export type StockDetailResponse = {
  stockId: string
  stockName: string | null
  sector: string
  matchPrice: number
  peRatio: number
  pbRatio: number
  pcfRatio: number
  psRatio: number
  industryPeRatio: number
  industryPbRatio: number
  industryPcfRatio: number
  industryPsRatio: number
  yearData?: Record<string, StockYearApiRecord>
  favoredByUsers?: string[]
}

const CACHE_KEY = '@finsight/stock-detail-cache-v1'

const storageAvailable = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
const storage = storageAvailable ? window.localStorage : null

const symbolCache = new Map<string, StockDetailResponse>()
let cacheHydrated = false

const normalizeSymbol = (value: string) => value.trim().toUpperCase()

const hydrateCache = () => {
  if (cacheHydrated) {
    return
  }

  cacheHydrated = true

  if (!storage) {
    return
  }

  try {
    const serialized = storage.getItem(CACHE_KEY)
    if (!serialized) {
      return
    }
    const parsed = JSON.parse(serialized) as Record<string, StockDetailResponse>

    if (typeof parsed !== 'object' || parsed === null) {
      return
    }

    Object.entries(parsed).forEach(([key, value]) => {
      if (!value || typeof key !== 'string') {
        return
      }

      if (isStockDetailResponse(value)) {
        symbolCache.set(normalizeSymbol(key), value)
      }
    })
  } catch {
    // Ignore malformed cache entries
  }
}

const persistCache = () => {
  if (!storage) {
    return
  }

  try {
    const payload = Object.fromEntries(symbolCache.entries())
    storage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore quota or serialization errors
  }
}

const isString = (value: unknown): value is string => typeof value === 'string'
const isMaybeString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string'
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isStockDetailResponse = (value: unknown): value is StockDetailResponse => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as StockDetailResponse

  const requiredNumbers = [
    candidate.matchPrice,
    candidate.peRatio,
    candidate.pbRatio,
    candidate.pcfRatio,
    candidate.psRatio,
    candidate.industryPeRatio,
    candidate.industryPbRatio,
    candidate.industryPcfRatio,
    candidate.industryPsRatio,
  ]

  return (
    isString(candidate.stockId) &&
    isMaybeString(candidate.stockName) &&
    isString(candidate.sector) &&
    requiredNumbers.every(isNumber) &&
    (candidate.yearData === undefined || typeof candidate.yearData === 'object')
  )
}

const stockDetailEndpoint = (symbol: string) =>
  `${API_STOCK_DETAIL_URL}/${encodeURIComponent(symbol)}`

export const getCachedStockDetail = (symbol?: string) => {
  if (!symbol) {
    return null
  }

  hydrateCache()

  return symbolCache.get(normalizeSymbol(symbol)) ?? null
}

export const fetchStockDetail = async (symbol: string, signal?: AbortSignal) => {
  const normalizedSymbol = normalizeSymbol(symbol)
  if (!normalizedSymbol) {
    throw new Error('Stock symbol is required to load details.')
  }

  hydrateCache()

  const cached = symbolCache.get(normalizedSymbol)
  if (cached) {
    return cached
  }

  const response = await fetch(stockDetailEndpoint(normalizedSymbol), { signal })
  if (!response.ok) {
    const message =
      response.status === 404
        ? `Stock ${normalizedSymbol} was not found.`
        : response.statusText || 'Unable to load stock details.'
    throw new Error(message)
  }

  const payload = (await response.json()) as unknown
  if (!isStockDetailResponse(payload)) {
    throw new Error('Unexpected payload received from the stock detail endpoint.')
  }

  symbolCache.set(normalizedSymbol, payload)
  persistCache()

  return payload
}

