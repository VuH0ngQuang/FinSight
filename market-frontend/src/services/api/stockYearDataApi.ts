import { authFetch, parseApiJson, readApiResponseText } from './config'
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
  const json = await parseApiJson<unknown>(res)
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

export interface UploadValidationIssue {
  severity: 'ERROR' | 'WARNING' | string
  field: string
  message: string
}

export interface UploadValidationResult {
  errors: UploadValidationIssue[]
  warnings: UploadValidationIssue[]
}

export interface UploadValidationResponse {
  status: 'FAILED' | 'WAITING_CONFIRMATION' | 'SUCCESS' | 'CONFIRMED' | string
  uploadId: string | null
  message: string
  validation: UploadValidationResult | null
}

const parseUploadValidationResponse = (raw: string): UploadValidationResponse => {
  if (!raw) {
    return {
      status: 'SUCCESS',
      uploadId: null,
      message: 'Stock data uploaded successfully',
      validation: { errors: [], warnings: [] },
    }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UploadValidationResponse>
    return {
      status: parsed.status ?? 'SUCCESS',
      uploadId: parsed.uploadId ?? null,
      message: parsed.message ?? raw,
      validation: parsed.validation ?? { errors: [], warnings: [] },
    }
  } catch {
    return {
      status: 'SUCCESS',
      uploadId: null,
      message: raw,
      validation: { errors: [], warnings: [] },
    }
  }
}

export const uploadStockYearDataExcel = async (file: File): Promise<UploadValidationResponse> => {
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

  const response = parseUploadValidationResponse(await readApiResponseText(res))
  if (!res.ok) {
    throw new Error(response.message || 'Failed to upload stock year data Excel file')
  }

  return response
}

export const confirmStockYearDataUpload = async (uploadId: string): Promise<UploadValidationResponse> => {
  const token = localStorage.getItem('finsight_token')

  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${INGESTION_API_BASE_URL}/stockYearDataUpload/${encodeURIComponent(uploadId)}/confirm`, {
    method: 'POST',
    headers,
  })

  const response = parseUploadValidationResponse(await readApiResponseText(res))
  if (!res.ok) {
    throw new Error(response.message || 'Failed to confirm stock year data upload')
  }

  return response
}
