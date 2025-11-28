const rawBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? '/api'
const normalizedBase = rawBase.replace(/\/+$/u, '') || '/api'

export const API_PROFILE_URL = `${normalizedBase}/profile`
export const API_STOCK_IDS_URL = `${normalizedBase}/stock/getAllStocksId`
export const API_STOCK_DETAIL_URL = `${normalizedBase}/stock/get`
