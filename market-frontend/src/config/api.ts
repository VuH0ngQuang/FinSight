const rawBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? 'http://103.162.20.119:3000'
const normalizedBase = rawBase.replace(/\/+$/u, '') || 'http://103.162.20.119:3000'
const apiBase = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`

export const API_PROFILE_URL = `${apiBase}/profile`
export const API_STOCK_IDS_URL = `${apiBase}/stock/getAllStocksId`
export const API_STOCK_DETAIL_URL = `${apiBase}/stock/get`
