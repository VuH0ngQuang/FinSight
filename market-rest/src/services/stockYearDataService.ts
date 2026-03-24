import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import type { StockYearDataDto } from '../dto/StockYearDataDto';
import type { StockYearData } from '../models/StockEntity';
import { cacheService } from '../utils/cacheService';

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
    const cacheField = `${stockId}:${year}`;
    const cached = await cacheService.hget<StockYearDataDto>('STOCKYEARDATA', cacheField);
    if (cached) return cached;

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

    const result: StockYearDataDto = {
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

    await cacheService.hset('STOCKYEARDATA', `${stockId}:${year}`, result);
    return result;
  }

  /**
   * Build full year map from Redis (fields `stockId:year` in STOCKYEARDATA).
   * Returns null when no rows exist in Redis (caller may fall back to DB).
   */
  async getYearDataRecordFromRedis(stockId: string): Promise<Record<number, StockYearData> | null> {
    const entries = await cacheService.hScanMatch('STOCKYEARDATA', `${stockId}:*`);
    if (entries.length === 0) {
      return null;
    }
    const acc: Record<number, StockYearData> = {};
    for (const { field, value } of entries) {
      const yearPart = field.split(':')[1];
      const year = Number(yearPart);
      if (!Number.isFinite(year)) {
        continue;
      }
      try {
        const parsed = JSON.parse(value) as Record<string, unknown>;
        acc[year] = {
          netIncome: toNumber(parsed.netIncome as number | string | null),
          totalEquity: toNumber(parsed.totalEquity as number | string | null),
          intangibles: toNumber(parsed.intangibles as number | string | null),
          operatingCashFlow: toNumber(parsed.operatingCashFlow as number | string | null),
          freeCashFlow: toNumber(parsed.freeCashFlow as number | string | null),
          revenue: toNumber(parsed.revenue as number | string | null),
          dividendPerShare: toNumber(parsed.dividendPerShare as number | string | null),
          sharesOutstanding: toNumber(parsed.sharesOutstanding as number | string | null),
          priceEndYear: toNumber(parsed.priceEndYear as number | string | null),
          costOfEquity: toNumber(parsed.costOfEquity as number | string | null),
          wacc: toNumber(parsed.wacc as number | string | null),
          dividendGrowthRate: toNumber(parsed.dividendGrowthRate as number | string | null),
          ddm: toNumber(parsed.ddm as number | string | null),
          dcf: toNumber(parsed.dcf as number | string | null),
          ri: toNumber(parsed.ri as number | string | null),
          pe: toNumber(parsed.pe as number | string | null),
          pbv: toNumber(parsed.pbv as number | string | null),
          pcf: toNumber(parsed.pcf as number | string | null),
          ps: toNumber(parsed.ps as number | string | null),
        };
      } catch {
        continue;
      }
    }
    return Object.keys(acc).length > 0 ? acc : null;
  }

  /** Write all year rows for a stock (fields `stockId:year` in STOCKYEARDATA). */
  async persistAllForStock(stockId: string, yearData: Record<number, StockYearData>): Promise<void> {
    const tasks = Object.entries(yearData).map(([yearStr, data]) => {
      const y = Number(yearStr);
      if (!Number.isFinite(y)) {
        return Promise.resolve();
      }
      const dto: StockYearDataDto = { stockId, ...data };
      return cacheService.hset('STOCKYEARDATA', `${stockId}:${y}`, dto);
    });
    await Promise.all(tasks);
  }
}

export const stockYearDataService = new StockYearDataService();

