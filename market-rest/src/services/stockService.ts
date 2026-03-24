import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import type { StockEntity, StockYearData } from '../models/StockEntity';
import { cacheService } from '../utils/cacheService';
import { stockYearDataService } from './stockYearDataService';

interface StockRow extends RowDataPacket {
    stockId: string;
    stockName: string;
    sector: string;
    matchPrice: number | string | null;
    peRatio: number | string | null;
    pbRatio: number | string | null;
    pcfRatio: number | string | null;
    psRatio: number | string | null;
    industryPeRatio: number | string | null;
    industryPbRatio: number | string | null;
    industryPcfRatio: number | string | null;
    industryPsRatio: number | string | null;
}

interface StockYearRow extends RowDataPacket {
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

/** STOCK hash payload (same fields as market-realtime StockDto JSON). */
type StockRedisPayload = Pick<
    StockEntity,
    | 'stockId'
    | 'stockName'
    | 'sector'
    | 'matchPrice'
    | 'peRatio'
    | 'pbRatio'
    | 'pcfRatio'
    | 'psRatio'
    | 'industryPeRatio'
    | 'industryPbRatio'
    | 'industryPcfRatio'
    | 'industryPsRatio'
>;

class StockService {
    private async persistStockScalarsToCache(entity: StockRedisPayload): Promise<void> {
        const payload: StockRedisPayload = {
            stockId: entity.stockId,
            stockName: entity.stockName,
            sector: entity.sector,
            matchPrice: entity.matchPrice,
            peRatio: entity.peRatio,
            pbRatio: entity.pbRatio,
            pcfRatio: entity.pcfRatio,
            psRatio: entity.psRatio,
            industryPeRatio: entity.industryPeRatio,
            industryPbRatio: entity.industryPbRatio,
            industryPcfRatio: entity.industryPcfRatio,
            industryPsRatio: entity.industryPsRatio,
        };
        await cacheService.hset('STOCK', entity.stockId, payload);
    }

    private async queryYearData(stockId: string): Promise<Record<number, StockYearData>> {
        const [yearRows] = await pool.query<StockYearRow[]>(
            `
            SELECT
                year,
                net_income          AS netIncome,
                total_equity        AS totalEquity,
                intangibles,
                operating_cash_flow AS operatingCashFlow,
                free_cash_flow      AS freeCashFlow,
                revenue,
                dividend_per_share  AS dividendPerShare,
                shares_outstanding  AS sharesOutstanding,
                price_end_year      AS priceEndYear,
                cost_of_equity      AS costOfEquity,
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
            WHERE stock_id = :stockId
            ORDER BY year DESC
            `,
            { stockId }
        );

        return yearRows.reduce<Record<number, StockYearData>>((acc, row) => {
            acc[row.year] = {
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
            return acc;
        }, {});
    }

    async getStockById(stockId: string): Promise<StockEntity | null> {
        const cached = await cacheService.hget<StockEntity>('STOCK', stockId);
        if (cached) {
            let yearData = await stockYearDataService.getYearDataRecordFromRedis(stockId);
            if (!yearData) {
                yearData = await this.queryYearData(stockId);
                if (Object.keys(yearData).length > 0) {
                    await stockYearDataService.persistAllForStock(stockId, yearData);
                }
            }
            return { ...cached, yearData, favoredByUsers: [] };
        }

        const [stockRows] = await pool.query<StockRow[]>(
            `
            SELECT
                stock_id   AS stockId,
                stock_name AS stockName,
                sector,
                match_price      AS matchPrice,
                pe_ratio         AS peRatio,
                pb_ratio         AS pbRatio,
                pcf_ratio        AS pcfRatio,
                ps_ratio         AS psRatio,
                industry_pe_ratio  AS industryPeRatio,
                industry_pb_ratio  AS industryPbRatio,
                industry_pcf_ratio AS industryPcfRatio,
                industry_ps_ratio  AS industryPsRatio
            FROM stock_entity
            WHERE stock_id = :stockId
            LIMIT 1
            `,
            { stockId }
        );

        const stockRow = stockRows[0];
        if (!stockRow) {
            return null;
        }

        const yearData = await this.queryYearData(stockId);

        const entity: StockEntity = {
            stockId: stockRow.stockId,
            stockName: stockRow.stockName,
            sector: stockRow.sector,
            matchPrice: toNumber(stockRow.matchPrice),
            peRatio: toNumber(stockRow.peRatio),
            pbRatio: toNumber(stockRow.pbRatio),
            pcfRatio: toNumber(stockRow.pcfRatio),
            psRatio: toNumber(stockRow.psRatio),
            industryPeRatio: toNumber(stockRow.industryPeRatio),
            industryPbRatio: toNumber(stockRow.industryPbRatio),
            industryPcfRatio: toNumber(stockRow.industryPcfRatio),
            industryPsRatio: toNumber(stockRow.industryPsRatio),
            yearData,
            favoredByUsers: [],
        };
        await this.persistStockScalarsToCache(entity);
        await stockYearDataService.persistAllForStock(stockId, yearData);
        return entity;
    }

    async getAllStocksId(): Promise<string[]> {
        const [stockRows] = await pool.query<StockRow[]>(
            `
            SELECT stock_id AS stockId
            FROM stock_entity
            `
        );
        return stockRows.map(row => row.stockId);
    }
}

export const stockService = new StockService();

