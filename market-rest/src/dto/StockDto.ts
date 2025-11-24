import { StockYearDataDto } from "./StockYearDataDto";

export interface StockDto {
    stockId: string;
    stockName: string;
    sector: string;
    matchPrice: number;
    industryPeRatio: number;
    industryPbRatio: number;
    industryPcfRatio: number;
    industryPsRatio: number;
    stockYearData: StockYearDataDto;
}

