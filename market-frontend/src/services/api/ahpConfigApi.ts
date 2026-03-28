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
  if (!res.ok) throw new Error('Failed to create AHP config')
}

export const updateAhpConfig = async (req: SaveAhpConfigRequest): Promise<void> => {
  const res = await authFetch('/ahpConfig/update', { method: 'PUT', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to update AHP config')
}
