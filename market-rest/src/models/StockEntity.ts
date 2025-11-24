import type { UserEntity } from "./UserEntity";

export interface StockEntity {
    stockId: string;
    stockName: string;
    sector: string;
    matchPrice: number;
    peRatio: number;
    pbRatio: number;
    pcfRatio: number;
    psRatio: number;
    industryPeRatio: number;
    industryPbRatio: number;
    industryPcfRatio: number;
    industryPsRatio: number;
    yearData: Record<number, StockYearData>;
    favoredByUsers: UserEntity[];
}

export interface StockYearData {
    netIncome: number;
    totalEquity: number;
    intangibles: number;
    operatingCashFlow: number;
    freeCashFlow: number;
    revenue: number;
    dividendPerShare: number;
    sharesOutstanding: number;
    priceEndYear: number;
    costOfEquity: number;
    wacc: number;
    dividendGrowthRate: number;
    ddm: number;
    dcf: number;
    ri: number;
    pe: number;
    pbv: number;
    pcf: number;
    ps: number;
}

