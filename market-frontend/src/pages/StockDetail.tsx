import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { findPriceRow } from '../data/priceboard'
import { getStockYearDataForSymbol, StockYearData } from '../data/stockyeardata'
import {
  fetchStockDetail,
  getCachedStockDetail,
  type StockDetailResponse,
  type StockYearApiRecord,
} from '../services/stockDetail'
import { useMarketData } from '../hooks/useMarketData'

type ChartMode = 'vietstock' | 'local'

const formatDisplayValue = (value?: number | null) =>
  value === undefined || value === null
    ? '—'
    : value.toLocaleString('en-US', { maximumFractionDigits: 2 })

const toNumber = (value?: number) => (typeof value === 'number' ? value : 0)

const buildStockYearHistoryFromApi = (
  stockId: string,
  yearData?: Record<string, StockYearApiRecord>,
) => {
  if (!yearData) {
    return []
  }

  return Object.entries(yearData)
    .map(([yearKey, entry]) => {
      const parsedYear = Number(yearKey)
      if (!Number.isFinite(parsedYear)) {
        return null
      }

      return new StockYearData({
        stockId,
        year: parsedYear,
        netIncome: toNumber(entry.netIncome),
        totalEquity: toNumber(entry.totalEquity),
        intangibles: toNumber(entry.intangibles),
        operatingCashFlow: toNumber(entry.operatingCashFlow),
        freeCashFlow: toNumber(entry.freeCashFlow),
        revenue: toNumber(entry.revenue),
        dividendPerShare: toNumber(entry.dividendPerShare),
        sharesOutstanding: toNumber(entry.sharesOutstanding),
        priceEndYear: toNumber(entry.priceEndYear),
        costOfEquity: toNumber(entry.costOfEquity),
        wacc: toNumber(entry.wacc),
        dividendGrowthRate: toNumber(entry.dividendGrowthRate),
        ddm: toNumber(entry.ddm),
        dcf: toNumber(entry.dcf),
        ri: toNumber(entry.ri),
        pe: toNumber(entry.pe),
        pbv: toNumber(entry.pbv),
        pcf: toNumber(entry.pcf),
        ps: toNumber(entry.ps),
      })
    })
    .filter((row): row is StockYearData => row !== null)
    .sort((a, b) => b.year - a.year)
}

const StockDetail = () => {
  const { symbol } = useParams<{ symbol?: string }>()
  const [chartMode, setChartMode] = useState<ChartMode>('vietstock')
  const normalizedSymbol = useMemo(
    () => symbol?.trim().toUpperCase() ?? '',
    [symbol],
  )
  const fallbackRow = useMemo(() => findPriceRow(symbol), [symbol])
  const fallbackYearHistory = useMemo(
    () => getStockYearDataForSymbol(symbol),
    [symbol],
  )
  const [stockDetail, setStockDetail] = useState<StockDetailResponse | null>(() =>
    getCachedStockDetail(symbol),
  )
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { getMatchPrice, isRecentlyUpdated } = useMarketData()

  useEffect(() => {
    if (!symbol) {
      setStockDetail(null)
      setFetchError(null)
      setIsFetching(false)
      return
    }

    let isMounted = true
    const controller = new AbortController()

    const loadDetails = async () => {
      setIsFetching(true)
      setFetchError(null)
      setStockDetail(getCachedStockDetail(symbol))

      try {
        const detail = await fetchStockDetail(symbol, controller.signal)
        if (!isMounted) {
          return
        }

        setStockDetail(detail)
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setFetchError(error instanceof Error ? error.message : 'Unable to load stock details.')
      } finally {
        if (isMounted) {
          setIsFetching(false)
        }
      }
    }

    loadDetails()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [symbol])

  if (!symbol) {
    return (
      <section className="space-y-4 text-white">
        <div className="rounded-3xl border border-white/5 bg-[#0d0d0f]/70 p-6 text-center">
          <p className="text-lg font-semibold">Symbol not found</p>
          <p className="text-sm text-slate-400">
            Please go back to the priceboard and try another symbol.
          </p>
          <Link
            to="/stock"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:border-white"
          >
            Return to priceboard
          </Link>
        </div>
      </section>
    )
  }

  const showMissingState = !stockDetail && !fallbackRow && !isFetching
  if (showMissingState) {
    return (
      <section className="space-y-4 text-white">
        <div className="rounded-3xl border border-white/5 bg-[#0d0d0f]/70 p-6 text-center">
          <p className="text-lg font-semibold">Symbol not found</p>
          <p className="text-sm text-slate-400">
            {fetchError ?? 'Please go back to the priceboard and try another symbol.'}
          </p>
          <Link
            to="/stock"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:border-white"
          >
            Return to priceboard
          </Link>
        </div>
      </section>
    )
  }

  const hasHistoricalData = !!stockDetail?.yearData
  const remoteYearHistory = hasHistoricalData
    ? buildStockYearHistoryFromApi(stockDetail.stockId, stockDetail.yearData)
    : []
  const chartData = hasHistoricalData ? remoteYearHistory : fallbackYearHistory
  const selectedYearDataArray = chartData.slice(0, 5)

  const realtimePrice = getMatchPrice(normalizedSymbol)
  const isPriceUpdated = isRecentlyUpdated(normalizedSymbol)
  const displayStock = {
    symbol: normalizedSymbol || fallbackRow?.symbol || symbol,
    stockName: stockDetail?.stockName ?? fallbackRow?.stockName ?? symbol,
    matchPrice: realtimePrice ?? stockDetail?.matchPrice ?? fallbackRow?.matchPrice,
    pb: stockDetail?.pbRatio ?? fallbackRow?.pb,
    pcf: stockDetail?.pcfRatio ?? fallbackRow?.pcf,
    pe: stockDetail?.peRatio ?? fallbackRow?.pe,
    ps: stockDetail?.psRatio ?? fallbackRow?.ps,
    industryPe: stockDetail?.industryPeRatio ?? fallbackRow?.pe,
    industryPb: stockDetail?.industryPbRatio ?? fallbackRow?.pb,
    industryPcf: stockDetail?.industryPcfRatio ?? fallbackRow?.pcf,
    industryPs: stockDetail?.industryPsRatio ?? fallbackRow?.ps,
    overallScore: fallbackRow?.overallScore ?? 0,
  }

  const hasLocalData = selectedYearDataArray.length > 0
  const showLocalChart = chartMode === 'local' && hasLocalData
  const chartButtonClass = (mode: ChartMode) =>
    `rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
      chartMode === mode ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'
    }`

  return (
    <section className="flex h-full min-h-0 flex-col space-y-6 text-white">
      <div className="flex items-center gap-4">
        <Link
          to="/stock"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-3xl font-thin text-slate-400 hover:bg-red-600"
        >
          ←
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">
          {displayStock.stockName} - ({displayStock.symbol})
        </h1>
      </div>

      {isFetching && !hasHistoricalData && (
        <p className="text-xs text-slate-400">
          Loading live financials for {displayStock.symbol}…
        </p>
      )}
      {fetchError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {fetchError} Showing preview data when possible.
        </div>
      )}

      <div className="flex rounded-3xl bg-[#2c2c2c] p-4 text-center text-sm">
        <div className={`w-1/5 px-2 transition-colors duration-300 ${isPriceUpdated ? 'animate-flash' : ''}`}>
          <p className="text-xs text-slate-300">Match price</p>
          <p className="mt-1 text-base font-semibold">
            {formatDisplayValue(displayStock.matchPrice)}
          </p>
        </div>
        <div className="w-1/5 px-2">
          <p className="text-xs text-slate-300">P/B ratio</p>
          <p className="mt-1 text-base font-semibold">{formatDisplayValue(displayStock.pb)}</p>
        </div>
        <div className="w-1/5 px-2">
          <p className="text-xs text-slate-300">P/CF ratio</p>
          <p className="mt-1 text-base font-semibold">{formatDisplayValue(displayStock.pcf)}</p>
        </div>
        <div className="w-1/5 px-2">
          <p className="text-xs text-slate-300">P/E ratio</p>
          <p className="mt-1 text-base font-semibold">{formatDisplayValue(displayStock.pe)}</p>
        </div>
        <div className="w-1/5 px-2">
          <p className="text-xs text-slate-300">P/S ratio</p>
          <p className="mt-1 text-base font-semibold">{formatDisplayValue(displayStock.ps)}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
              <button
                type="button"
                className={chartButtonClass('vietstock')}
                onClick={() => setChartMode('vietstock')}
              >
                Chart
              </button>

              <button
                type="button"
                className={chartButtonClass('local')}
                onClick={() => setChartMode('local')}
              >
                Financials
              </button>
            </div>

            <div className="text-xs text-slate-300">Currency: Vietnam Dong</div>
          </div>

          {chartMode === 'local' && !hasLocalData && (
            <p className="text-xs text-rose-300">
              Historical year data is not available for {displayStock.symbol}. Showing the Vietstock chart instead.
            </p>
          )}

          <div className="flex-1 min-h-0">
            {showLocalChart ? (
              <StockYearChart data={selectedYearDataArray} />
            ) : (
              <VietstockChart symbol={displayStock.symbol} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const VietstockChart = ({ symbol }: { symbol?: string }) => (
  <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d0f]/70">
    <iframe
      title={`${symbol} interactive chart`}
      src={`https://ta.vietstock.vn/vds?lang=vi&stockcode=${symbol}`}
      className="h-full w-full border-0"
      loading="lazy"
      allowFullScreen
    />
  </div>
)

const StockYearChart = ({ data }: { data: StockYearData[] }) => {
  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null || !isFinite(value)) return '—'
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const fields: Array<{ label: string; get: (d: StockYearData) => number | undefined }> = [
    { label: 'Net income', get: (d) => d.netIncome },
    { label: 'Total equity', get: (d) => d.totalEquity },
    { label: 'Intangibles', get: (d) => d.intangibles },
    { label: 'Operating cash flow', get: (d) => d.operatingCashFlow },
    { label: 'Free cash flow', get: (d) => d.freeCashFlow },
    { label: 'Revenue', get: (d) => d.revenue },
    { label: 'Dividend per share', get: (d) => d.dividendPerShare },
    { label: 'Shares outstanding', get: (d) => d.sharesOutstanding },
    { label: 'Price end year', get: (d) => d.priceEndYear },
    { label: 'Cost of equity', get: (d) => d.costOfEquity },
    { label: 'WACC', get: (d) => d.wacc },
    { label: 'Dividend growth rate', get: (d) => d.dividendGrowthRate },
    { label: 'DDM', get: (d) => d.ddm },
    { label: 'DCF', get: (d) => d.dcf },
    { label: 'RI', get: (d) => d.ri },
    { label: 'PE', get: (d) => d.pe },
    { label: 'PB', get: (d) => d.pbv },
    { label: 'PCF', get: (d) => d.pcf },
    { label: 'PS', get: (d) => d.ps },
  ]

  return (
    <div className="h-full w-full overflow-auto rounded-2xl border border-white/10 bg-[#0c0d0f]/70 p-4 scrollbar-hide">
      <table className="w-full table-fixed text-right text-sm text-white">
        <colgroup>
          <col className="w-64" />
          {data.map((d) => (
            <col key={d.year} />
          ))}
        </colgroup>

        <thead>
          <tr>
            <th className="sticky left-0 z-20 bg-[#0c0d0f]/90 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              Metric
            </th>
            {data.map((d) => (
              <th
                key={d.year}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300"
              >
                {d.year}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {fields.map((field) => (
            <tr key={field.label} className="border-t border-white/5">
              <td className="sticky left-0 z-10 bg-[#0c0d0f]/90 px-3 py-2 text-left text-xs font-medium text-slate-400">
                {field.label}
              </td>
              {data.map((d) => (
                <td key={d.year} className="px-3 py-2 font-semibold">
                  {formatNumber(field.get(d))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StockDetail

