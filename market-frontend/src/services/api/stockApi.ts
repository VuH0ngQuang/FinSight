import { authFetch } from './config'

export interface CreateStockRequest {
  stockId: string
  stockName?: string
  sector?: string
  peRatio?: number
  pbRatio?: number
  pcfRatio?: number
  psRatio?: number
  industryPeRatio?: number
  industryPbRatio?: number
  industryPcfRatio?: number
  industryPsRatio?: number
}

export interface UpdateIndustryRatiosRequest {
  stockId: string
  industryPeRatio: number
  industryPbRatio: number
  industryPcfRatio: number
  industryPsRatio: number
}

export const getAllStockIds = async (): Promise<string[]> => {
  const res = await authFetch('/stock/getAllStocksId')
  if (!res.ok) throw new Error('Failed to load stock IDs')
  return res.json() as Promise<string[]>
}

export const createStock = async (req: CreateStockRequest): Promise<void> => {
  const res = await authFetch('/stock/create', { method: 'POST', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to create stock')
}

export const updateStock = async (req: CreateStockRequest): Promise<void> => {
  const res = await authFetch('/stock/update', { method: 'PUT', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to update stock')
}

export const deleteStock = async (stockId: string): Promise<void> => {
  const res = await authFetch('/stock/delete', { method: 'DELETE', body: JSON.stringify({ stockId }) })
  if (!res.ok) throw new Error('Failed to delete stock')
}

export const updateIndustryRatios = async (req: UpdateIndustryRatiosRequest): Promise<void> => {
  const res = await authFetch('/stock/updateIndustryRatios', { method: 'PUT', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to update industry ratios')
}
