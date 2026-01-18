import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { StockYearData } from '../data/stockyeardata'
import {
    fetchStockDetail,
    getCachedStockDetail,
    type StockDetailResponse,
    type StockYearApiRecord,
} from '../services/stockDetail'
import { useMarketData } from '../hooks/useMarketData'

// --- Icons (Inline SVG) ---
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

const ChartBarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
)

const TableIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
    </svg>
)

const ActivityIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
)

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

const StockDetail2 = () => {
    const { symbol } = useParams<{ symbol?: string }>()
    const [chartMode, setChartMode] = useState<ChartMode>('vietstock')
    const normalizedSymbol = useMemo(
        () => symbol?.trim().toUpperCase() ?? '',
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

    if (!symbol || (!stockDetail && !isFetching && !fetchError)) {
        return (
            <section className="flex flex-col items-center justify-center space-y-4 text-white p-10">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-center backdrop-blur-sm">
                    <ActivityIcon className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                    <p className="text-xl font-bold">Symbol not found</p>
                    <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                        {fetchError ?? 'The stock symbol you requested could not be found.'}
                    </p>
                    <Link
                        to="/stock"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Scanner
                    </Link>
                </div>
            </section>
        )
    }

    const hasHistoricalData = !!stockDetail?.yearData
    const chartData = hasHistoricalData
        ? buildStockYearHistoryFromApi(stockDetail.stockId, stockDetail.yearData)
        : []
    const selectedYearDataArray = chartData.slice(0, 5)

    const realtimePrice = getMatchPrice(normalizedSymbol)
    const isPriceUpdated = isRecentlyUpdated(normalizedSymbol)
    const displayStock = {
        symbol: normalizedSymbol || symbol,
        stockName: stockDetail?.stockName ?? symbol,
        matchPrice: realtimePrice ?? stockDetail?.matchPrice,
        pb: stockDetail?.pbRatio,
        pcf: stockDetail?.pcfRatio,
        pe: stockDetail?.peRatio,
        ps: stockDetail?.psRatio,
        industryPe: stockDetail?.industryPeRatio,
        industryPb: stockDetail?.industryPbRatio,
        industryPcf: stockDetail?.industryPcfRatio,
        industryPs: stockDetail?.industryPsRatio,
        overallScore: 0,
    }

    const hasLocalData = selectedYearDataArray.length > 0
    const showLocalChart = chartMode === 'local' && hasLocalData

    const activeTabClass = "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
    const inactiveTabClass = "text-slate-400 hover:text-white hover:bg-white/5"

    return (
        <section className="flex h-full min-h-0 flex-col gap-6 text-white font-sans">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                    <Link
                        to="/stock"
                        className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-400 transition-all hover:border-amber-500/30 hover:bg-slate-800 hover:text-amber-500"
                    >
                        <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight text-white">
                                {displayStock.symbol}
                            </h1>
                            {isFetching && (
                                <div className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400 animate-pulse">
                                    loading...
                                </div>
                            )}
                        </div>
                        <p className="text-lg text-slate-400 font-medium">{displayStock.stockName}</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                    <button
                        onClick={() => setChartMode('vietstock')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${chartMode === 'vietstock' ? activeTabClass : inactiveTabClass}`}
                    >
                        <ChartBarIcon className="h-4 w-4" />
                        Chart
                    </button>
                    <button
                        onClick={() => setChartMode('local')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${chartMode === 'local' ? activeTabClass : inactiveTabClass}`}
                    >
                        <TableIcon className="h-4 w-4" />
                        Financials
                    </button>
                </div>
            </div>

            {fetchError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    {fetchError} Showing preview data when possible.
                </div>
            )}

            {/* Ratios Bar */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {/* Live Price Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
                    <div className={`absolute top-0 right-0 h-16 w-16 -translate-y-6 translate-x-6 rounded-full bg-amber-500/10 blur-xl ${isPriceUpdated ? 'animate-pulse' : ''}`} />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Match Price</p>
                    <p className={`mt-2 text-2xl font-bold tracking-tight transition-colors duration-300 ${isPriceUpdated ? 'text-amber-400' : 'text-white'}`}>
                        {formatDisplayValue(displayStock.matchPrice)}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">P/B Ratio</p>
                    <p className="mt-2 text-xl font-bold text-slate-200">{formatDisplayValue(displayStock.pb)}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">P/CF Ratio</p>
                    <p className="mt-2 text-xl font-bold text-slate-200">{formatDisplayValue(displayStock.pcf)}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">P/E Ratio</p>
                    <p className="mt-2 text-xl font-bold text-slate-200">{formatDisplayValue(displayStock.pe)}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">P/S Ratio</p>
                    <p className="mt-2 text-xl font-bold text-slate-200">{formatDisplayValue(displayStock.ps)}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden rounded-3xl border border-slate-800 bg-[#0c0d0f] shadow-2xl relative">

                {chartMode === 'local' && !hasLocalData && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                        <p className="text-slate-400 mb-4">Historical data not available</p>
                        <button
                            onClick={() => setChartMode('vietstock')}
                            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition"
                        >
                            View Chart Instead
                        </button>
                    </div>
                )}

                <div className="h-full w-full">
                    {showLocalChart ? (
                        <StockYearChart data={selectedYearDataArray} />
                    ) : (
                        <VietstockChart symbol={displayStock.symbol} />
                    )}
                </div>
            </div>
        </section>
    )
}

const VietstockChart = ({ symbol }: { symbol?: string }) => (
    <div className="h-full w-full">
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
        <div className="h-full w-full overflow-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700/50">
            <table className="w-full table-fixed text-right text-sm text-slate-300">
                <colgroup>
                    <col className="w-64" />
                    {data.map((d) => (
                        <col key={d.year} />
                    ))}
                </colgroup>

                <thead>
                    <tr>
                        <th className="sticky top-0 left-0 z-20 bg-[#0c0d0f] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                            Metric
                        </th>
                        {data.map((d) => (
                            <th
                                key={d.year}
                                className="sticky top-0 bg-[#0c0d0f] px-4 py-3 text-xs font-bold uppercase tracking-wider text-amber-500 border-b border-slate-800"
                            >
                                {d.year}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {fields.map((field) => (
                        <tr key={field.label} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                            <td className="sticky left-0 z-10 bg-[#0c0d0f] px-4 py-3 text-left text-xs font-medium text-slate-400 border-r border-slate-800/50">
                                {field.label}
                            </td>
                            {data.map((d) => (
                                <td key={d.year} className="px-4 py-3 font-mono text-slate-200">
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

export default StockDetail2
