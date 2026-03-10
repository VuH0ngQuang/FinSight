export interface PortfolioAllocationRequest {
  userId: string;
  budget: number;
  numberOfStocks: number;
  lotSize?: number;
}
