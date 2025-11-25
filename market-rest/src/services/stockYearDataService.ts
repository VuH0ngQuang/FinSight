import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import type { StockYearDataDto } from '../dto/StockYearDataDto';

interface StockYearRow extends RowDataPacket {
  stockId: string;
  year: number;
  netIncome: number | string | null;
  totalEquity: number | string | null;
  intangibles: number | string | null;
  operatingCashFlow: number | string | null;
  freeCashFlow: number | string | null;
  revenue: number | string | null;
  dividendPerShare: number | string | null;
  sharesOutstanding: number | string | null;
  priceEndYear: number | string | null;
  costOfEquity: number | string | null;
  wacc: number | string | null;
  dividendGrowthRate: number | string | null;
  ddm: number | string | null;
  dcf: number | string | null;
  ri: number | string | null;
  pe: number | string | null;
  pbv: number | string | null;
  pcf: number | string | null;
  ps: number | string | null;
}

const toNumber = (value: number | string | null): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === 'number' ? value : Number(value);
};

class StockYearDataService {
  async getByStockAndYear(stockId: string, year: number): Promise<StockYearDataDto | null> {
    const [rows] = await pool.query<StockYearRow[]>(
      `
      SELECT
        stock_id AS stockId,
        year,
        net_income AS netIncome,
        total_equity AS totalEquity,
        intangibles,
        operating_cash_flow AS operatingCashFlow,
        free_cash_flow AS freeCashFlow,
        revenue,
        dividend_per_share AS dividendPerShare,
        shares_outstanding AS sharesOutstanding,
        price_end_year AS priceEndYear,
        cost_of_equity AS costOfEquity,
        wacc,
        dividend_growth_rate AS dividendGrowthRate,
        ddm,
        dcf,
        ri,
        pe,
        pbv,
        pcf,
        ps
      FROM stock_year_data
      WHERE stock_id = :stockId AND year = :year
      LIMIT 1
      `,
      { stockId, year }
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      stockId: row.stockId,
      netIncome: toNumber(row.netIncome),
      totalEquity: toNumber(row.totalEquity),
      intangibles: toNumber(row.intangibles),
      operatingCashFlow: toNumber(row.operatingCashFlow),
      freeCashFlow: toNumber(row.freeCashFlow),
      revenue: toNumber(row.revenue),
      dividendPerShare: toNumber(row.dividendPerShare),
      sharesOutstanding: toNumber(row.sharesOutstanding),
      priceEndYear: toNumber(row.priceEndYear),
      costOfEquity: toNumber(row.costOfEquity),
      wacc: toNumber(row.wacc),
      dividendGrowthRate: toNumber(row.dividendGrowthRate),
      ddm: toNumber(row.ddm),
      dcf: toNumber(row.dcf),
      ri: toNumber(row.ri),
      pe: toNumber(row.pe),
      pbv: toNumber(row.pbv),
      pcf: toNumber(row.pcf),
      ps: toNumber(row.ps),
    };
  }
}

export const stockYearDataService = new StockYearDataService();

