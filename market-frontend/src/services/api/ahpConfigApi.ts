import { authFetch } from './config'

export interface AhpConfigDto {
  ahpConfigId: string
  userId: string
  criteriaJson: string
  pairwiseMatrixJson: string
  weightsJson: string
}

export interface SaveAhpConfigRequest {
  ahpConfigId: string
  userId: string
  criteriaJson: string
  pairwiseMatrixJson: string
  weightsJson: string
}

interface AhpConfigResponsePayload {
  success?: boolean
  errorMessage?: string | null
  data?: unknown
}

interface AhpConfigResponseEnvelope {
  payload?: AhpConfigResponsePayload
  success?: boolean
  errorMessage?: string | null
  data?: unknown
}

const assertAhpConfigSuccess = async (res: Response, fallback: string): Promise<void> => {
  const text = await res.text().catch(() => '')
  let json: AhpConfigResponseEnvelope | null = null

  if (text) {
    try {
      json = JSON.parse(text) as AhpConfigResponseEnvelope
    } catch {
      if (!res.ok) throw new Error(text)
    }
  }

  const payload = json?.payload
  const success = payload?.success ?? json?.success
  if (!res.ok || success === false) {
    throw new Error(payload?.errorMessage ?? json?.errorMessage ?? fallback)
  }
}

export const getAhpConfig = async (userId: string): Promise<AhpConfigDto | null> => {
  const res = await authFetch(`/ahpConfig/get/${userId}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load AHP config')
  const json = (await res.json()) as unknown
  const payload =
    json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
      ? (json as Record<string, unknown>).data
      : json
  return payload as AhpConfigDto
}

export const createAhpConfig = async (req: SaveAhpConfigRequest): Promise<void> => {
  const res = await authFetch('/ahpConfig/create', { method: 'POST', body: JSON.stringify(req) })
  await assertAhpConfigSuccess(res, 'Failed to create AHP config')
}

export const updateAhpConfig = async (req: SaveAhpConfigRequest): Promise<void> => {
  const res = await authFetch('/ahpConfig/update', { method: 'PUT', body: JSON.stringify(req) })
  await assertAhpConfigSuccess(res, 'Failed to update AHP config')
}
