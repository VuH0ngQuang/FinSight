import { authFetch } from './config'
import type { StockYearApiRecord } from '../stockDetail'

export interface CreateStockYearDataRequest {
  stockId: string
  year: number
  data: StockYearApiRecord
}

export interface UpdateStockYearDataRequest {
  stockId: string
  year: number
  data: Partial<StockYearApiRecord>
}

export interface DeleteStockYearDataRequest {
  stockId: string
  year: number
}

export const getStockYearData = async (stockId: string, year: number): Promise<StockYearApiRecord> => {
  const res = await authFetch(`/stockYearData/get/${encodeURIComponent(stockId)}/${year}`)
  if (!res.ok) throw new Error(`Failed to load year data for ${stockId} (${year})`)
  const json = (await res.json()) as unknown
  const payload =
      json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
          ? (json as Record<string, unknown>).data
          : json
  return payload as StockYearApiRecord
}

export const createStockYearData = async (req: CreateStockYearDataRequest): Promise<void> => {
  const res = await authFetch(`/stockYearData/create/${req.year}`, {
    method: 'POST',
    body: JSON.stringify({ stockId: req.stockId, ...req.data }),
  })
  if (!res.ok) throw new Error('Failed to create stock year data')
}

export const updateStockYearData = async (req: UpdateStockYearDataRequest): Promise<void> => {
  const res = await authFetch(`/stockYearData/update/${req.year}`, {
    method: 'PUT',
    body: JSON.stringify({ stockId: req.stockId, ...req.data }),
  })
  if (!res.ok) throw new Error('Failed to update stock year data')
}

export const deleteStockYearData = async (req: DeleteStockYearDataRequest): Promise<void> => {
  const res = await authFetch('/stockYearData/delete', {
    method: 'DELETE',
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error('Failed to delete stock year data')
}

const rawIngestionBase = import.meta.env.VITE_INGESTION_API_BASE_URL ?? 'http://103.162.20.119:1111'
const normalizedIngestionBase = rawIngestionBase.replace(/\/+$/, '')
const INGESTION_API_BASE_URL = normalizedIngestionBase.endsWith('/api')
  ? normalizedIngestionBase
  : `${normalizedIngestionBase}/api`

export const uploadStockYearDataExcel = async (file: File): Promise<string> => {
  const token = localStorage.getItem('finsight_token')
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${INGESTION_API_BASE_URL}/stockYearDataUpload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const message = await res.text()
  if (!res.ok) {
    throw new Error(message || 'Failed to upload stock year data Excel file')
  }

  return message || 'Stock data uploaded successfully'
}
