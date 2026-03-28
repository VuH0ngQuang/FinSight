import { authFetch } from './config'

export interface PortfolioAllocateRequest {
  userId: string
  budget: number
  numberOfStocks: number
  lotSize?: number
}

export interface PortfolioAllocationItem {
  stockId: string
  stockName?: string
  topsisScore: number
  allocationPercentage: number
  numberOfShares: number
  pricePerShare: number
  totalCost: number
}

export interface PortfolioAllocationResponse {
  allocations: PortfolioAllocationItem[]
  totalInvestment: number
  remainingBudget: number
  budget: number
}

type RawPortfolioAllocationItem = Partial<PortfolioAllocationItem> & { shares?: number }
type RawPortfolioAllocationResponse = {
  allocations?: RawPortfolioAllocationItem[]
  totalInvestment?: number
  remainingBudget?: number
  budget?: number
}
type ApiEnvelope<T> = {
  success?: boolean
  errorCode?: number
  errorMessage?: string | null
  data?: T
}

export const allocatePortfolio = async (req: PortfolioAllocateRequest): Promise<PortfolioAllocationResponse> => {
  const res = await authFetch('/portfolio/allocate', { method: 'POST', body: JSON.stringify(req) })
  if (!res.ok) throw new Error('Failed to compute portfolio allocation')

  const raw = (await res.json()) as RawPortfolioAllocationResponse | ApiEnvelope<RawPortfolioAllocationResponse>
  const payload = ('data' in raw && raw.data ? raw.data : raw) as RawPortfolioAllocationResponse
  const rawAllocations = Array.isArray(payload.allocations) ? payload.allocations : []

  return {
    allocations: rawAllocations.map((item) => ({
      stockId: String(item.stockId ?? ''),
      stockName: item.stockName,
      topsisScore: Number(item.topsisScore ?? 0),
      allocationPercentage: Number(item.allocationPercentage ?? 0),
      numberOfShares: Number(item.numberOfShares ?? item.shares ?? 0),
      pricePerShare: Number(item.pricePerShare ?? 0),
      totalCost: Number(item.totalCost ?? 0),
    })),
    totalInvestment: Number(payload.totalInvestment ?? 0),
    remainingBudget: Number(payload.remainingBudget ?? 0),
    budget: Number(payload.budget ?? 0),
  }
}
