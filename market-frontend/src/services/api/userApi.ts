import { authFetch, apiFetch, parseApiJson, readApiResponseText } from './config'

export interface AhpConfigDetailDto {
  ahpConfigId: string
  criteriaJson?: string | null
  pairwiseMatrixJson?: string | null
  weightsJson?: string | null
}

export interface SubscriptionPlanDto {
  planId?: number
  planName?: string
  price?: number
  billingCycle?: string
}

export interface SubscriptionDto {
  subscriptionId?: string
  startDate?: string
  endDate?: string
  status?: string
  subscriptionPlan?: SubscriptionPlanDto
}

export interface UserDetailDto {
  userId: string
  username: string
  email: string
  phoneNumber?: string
  createdAt?: string
  subscriptions?: SubscriptionDto[]
  ahpConfig?: AhpConfigDetailDto | null
  isAdmin?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: string
  isAdmin?: boolean
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  phoneNumber?: string
}

export interface UpdateUserRequest {
  userId: string
  username?: string
  email?: string
  phoneNumber?: string
}

export interface UpdatePasswordRequest {
  userId: string
  currentPassword: string
  newPassword: string
}

export interface FavoriteStockRequest {
  userId: string
  stockId: string
}

export const loginUser = async (req: LoginRequest): Promise<LoginResponse> => {
  const res = await apiFetch('/user/login', { method: 'POST', body: JSON.stringify(req) })
  if (!res.ok) {
    const err = await readApiResponseText(res)
    throw new Error(err || 'Login failed')
  }
  return parseApiJson<LoginResponse>(res)
}

export const createUser = async (req: CreateUserRequest): Promise<LoginResponse> => {
  const res = await apiFetch('/user/create', { method: 'POST', body: JSON.stringify(req) })
  if (!res.ok) {
    const err = await readApiResponseText(res)
    throw new Error(err || 'Registration failed')
  }
  return parseApiJson<LoginResponse>(res)
}

export const getUserDetail = async (userId: string): Promise<UserDetailDto> => {
  const res = await authFetch(`/user/getDetail/${userId}`)
  if (!res.ok) throw new Error('Failed to load user detail')
  const json = await parseApiJson<unknown>(res)

  const payload =
    json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
      ? (json as Record<string, unknown>).data
      : json

  const normalized = payload as UserDetailDto
  const rawAhp = (normalized as unknown as { ahpConfig?: unknown }).ahpConfig
  if (rawAhp && typeof rawAhp === 'object') {
    const a = rawAhp as Record<string, unknown>
    const ahpConfigId = a.ahpConfigId
    normalized.ahpConfig = {
      ahpConfigId: ahpConfigId == null ? '' : String(ahpConfigId),
      criteriaJson: a.criteriaJson == null ? null : String(a.criteriaJson),
      pairwiseMatrixJson: a.pairwiseMatrixJson == null ? null : String(a.pairwiseMatrixJson),
      weightsJson: a.weightsJson == null ? null : String(a.weightsJson),
    }
  } else {
    normalized.ahpConfig = rawAhp === null ? null : undefined
  }

  const rawSubs = (normalized as unknown as { subscriptions?: unknown }).subscriptions
  if (Array.isArray(rawSubs)) {
    normalized.subscriptions = rawSubs
      .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
      .map((s) => {
        const plan = s.subscriptionPlan as Record<string, unknown> | undefined
        return {
          subscriptionId: s.subscriptionId == null ? undefined : String(s.subscriptionId),
          startDate: s.startDate == null ? undefined : String(s.startDate),
          endDate: s.endDate == null ? undefined : String(s.endDate),
          status: s.status == null ? undefined : String(s.status),
          subscriptionPlan: plan
            ? {
                planId: typeof plan.planId === 'number' ? plan.planId : Number(plan.planId ?? NaN),
                planName: plan.planName == null ? undefined : String(plan.planName),
                price: typeof plan.price === 'number' ? plan.price : Number(plan.price ?? NaN),
                billingCycle: plan.billingCycle == null ? undefined : String(plan.billingCycle),
              }
            : undefined,
        }
      })
  }

  return normalized
}

export const updateUser = async (req: UpdateUserRequest): Promise<void> => {
  const res = await authFetch('/user/update', { method: 'PUT', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to update profile')
}

export const updatePassword = async (req: UpdatePasswordRequest): Promise<void> => {
  const res = await authFetch('/user/updatePassword', { method: 'PUT', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to update password')
}

export const deleteUser = async (userId: string): Promise<void> => {
  const res = await authFetch('/user/delete', { method: 'DELETE', body: JSON.stringify({ userId }) })
  if (!res.ok) throw new Error('Failed to delete account')
}

/** Admin-only: reset another user's password without requiring their current password */
export const adminResetPassword = async (req: { userId: string; password: string }): Promise<void> => {
  const res = await authFetch('/user/updatePassword', { method: 'PUT', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to reset password')
}

export const addFavoriteStock = async (req: FavoriteStockRequest): Promise<void> => {
  const res = await authFetch('/user/addFavoriteStock', { method: 'POST', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to add favorite')
}

export const removeFavoriteStock = async (req: FavoriteStockRequest): Promise<void> => {
  const res = await authFetch('/user/removeFavoriteStock', { method: 'POST', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to remove favorite')
}

/** Returns stock symbols the user saved as favorites (watchlist). */
export const getFavoriteStockIds = async (userId: string): Promise<string[]> => {
  const res = await authFetch(`/user/favoriteStocks/${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to load watchlist')
  const json = await parseApiJson<unknown>(res)
  const payload =
    json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
      ? (json as Record<string, unknown>).data
      : json
  if (!Array.isArray(payload)) return []
  return payload.map((s) => String(s).trim().toUpperCase()).filter(Boolean)
}
