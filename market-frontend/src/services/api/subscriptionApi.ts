import { apiFetch, authFetch, parseApiJson } from './config'

export interface SubscriptionPlanDto {
  planId: number
  planName: string
  price: number
  billingCycle: 'MONTHLY' | 'YEARLY'
}

export const getSubscriptionPlans = async (): Promise<SubscriptionPlanDto[]> => {
  const res = await apiFetch('/subscription/plans')
  if (!res.ok) throw new Error('Failed to load subscription plans')

  const json = await parseApiJson<unknown>(res)
  const payload =
    json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
      ? (json as Record<string, unknown>).data
      : json

  if (!Array.isArray(payload)) return []

  return payload
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      planId: Number(item.planId ?? 0),
      planName: String(item.planName ?? ''),
      price: Number(item.price ?? 0),
      billingCycle: String(item.billingCycle ?? '').toUpperCase() === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
    }))
}

export interface CreateSubscriptionPayload {
  userId: string
  subscriptionPlanId: number
  type: '1M' | '1Y'
}

export const createSubscription = async (payload: CreateSubscriptionPayload): Promise<string> => {
  const res = await authFetch('/subscription/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const json = await parseApiJson<{ success: boolean; data: string | null; errorMessage: string | null }>(res)
  if (!json.success || !json.data) {
    throw new Error(json.errorMessage ?? 'Failed to create subscription')
  }
  return json.data
}
