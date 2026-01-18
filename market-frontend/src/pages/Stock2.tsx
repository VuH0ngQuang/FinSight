import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Stock } from '../models/Stock'
import { API_STOCK_IDS_URL } from '../config/api'
import { fetchStockDetail, type StockDetailResponse } from '../services/stockDetail'
import { useMarketData } from '../hooks/useMarketData'

// --- Icons (Inline SVG) ---
const SearchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
)

const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
    </svg>
)

const TrendingDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
        <polyline points="16 17 22 17 22 11" />
    </svg>
)

const ActivityIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
)

// --- Constants & Types ---

const headers = [
    'Symbol',
    'Match Price',
    'P/B ratio',
    'P/CF ratio',
    'P/E ratio',
    'P/S ratio',
    'Overall Score',
]

const multiLineHeaders: Record<string, string[]> = {
    'Overall Score': ['Overall', 'Score'],
}

const weightsJson = '[0.142857, 0.142857, 0.142857, 0.142857, 0.142857, 0.142857, 0.142857]'
const SCORE_WEIGHTS = JSON.parse(weightsJson) as number[]
const CRITERIA = ['ddm', 'dcf', 'ri', 'pe', 'pbv', 'pcf', 'ps'] as const
type Criterion = (typeof CRITERIA)[number]
type CriterionMetrics = Record<Criterion, number>
const BENEFIT_CRITERIA = new Set<Criterion>(['ddm', 'dcf', 'ri'])

// --- Helper Functions ---

const formatLiveValue = (
    value: number | string | undefined | null,
    digits = 2,
) => {
    if (value === undefined || value === null || value === '') {
        return '—'
    }

    const parsed = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(parsed)) {
        return '—'
    }

    return parsed.toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })
}

const sanitizeMetric = (value?: number | null) =>
    typeof value === 'number' && Number.isFinite(value) ? value : 0

const getLatestYearSnapshot = (detail?: StockDetailResponse) => {
    if (!detail?.yearData) {
        return null
    }

    return (
        Object.entries(detail.yearData)
            .map(([year, data]) => ({
                year: Number(year),
                data,
            }))
            .filter(({ year }) => Number.isFinite(year))
            .sort((a, b) => b.year - a.year)[0]?.data ?? null
    )
}

const buildCriterionMetrics = (
    _row: Stock,
    detail?: StockDetailResponse,
): CriterionMetrics => {
    const latest = getLatestYearSnapshot(detail)

    return {
        ddm: sanitizeMetric(latest?.ddm),
        dcf: sanitizeMetric(latest?.dcf),
        ri: sanitizeMetric(latest?.ri),
        // use latest year ratios instead of live/detail ratios
        pe: sanitizeMetric(latest?.pe),
        pbv: sanitizeMetric(latest?.pbv),
        pcf: sanitizeMetric(latest?.pcf),
        ps: sanitizeMetric(latest?.ps),
    }
}

const computeTopsisScores = (
    rows: Stock[],
    details: Record<string, StockDetailResponse | undefined>,
) => {
    const datasets = rows.map((row) => ({
        symbol: row.symbol,
        metrics: buildCriterionMetrics(row, details[row.symbol]),
    }))

    if (datasets.length === 0) {
        return new Map<string, number>()
    }

    const denominators: Record<Criterion, number> = CRITERIA.reduce(
        (acc, criterion) => {
            const sumSquares = datasets.reduce(
                (sum, entry) => sum + entry.metrics[criterion] ** 2,
                0,
            )
            acc[criterion] = sumSquares > 0 ? Math.sqrt(sumSquares) : 1
            return acc
        },
        {} as Record<Criterion, number>,
    )

    const weightedVectors = datasets.map((entry) => {
        const weighted: Record<Criterion, number> = {} as Record<Criterion, number>
        CRITERIA.forEach((criterion, index) => {
            const normalized =
                denominators[criterion] === 0
                    ? 0
                    : entry.metrics[criterion] / denominators[criterion]
            weighted[criterion] = normalized * (SCORE_WEIGHTS[index] ?? 0)
        })
        return {
            symbol: entry.symbol,
            weighted,
        }
    })

    const idealBest: Record<Criterion, number> = {} as Record<Criterion, number>
    const idealWorst: Record<Criterion, number> = {} as Record<Criterion, number>

    CRITERIA.forEach((criterion) => {
        const values = weightedVectors.map((entry) => entry.weighted[criterion])
        const benefit = BENEFIT_CRITERIA.has(criterion)
        idealBest[criterion] = benefit ? Math.max(...values) : Math.min(...values)
        idealWorst[criterion] = benefit ? Math.min(...values) : Math.max(...values)
    })

    const scores = new Map<string, number>()

    weightedVectors.forEach(({ symbol, weighted }) => {
        let distanceBest = 0
        let distanceWorst = 0

        CRITERIA.forEach((criterion) => {
            const value = weighted[criterion]
            distanceBest += (value - idealBest[criterion]) ** 2
            distanceWorst += (value - idealWorst[criterion]) ** 2
        })

        const sp = Math.sqrt(distanceBest)
        const sm = Math.sqrt(distanceWorst)
        const denominator = sp + sm
        const closeness = denominator === 0 ? 0 : sm / denominator
        scores.set(symbol, Number.isFinite(closeness) ? closeness : 0)
    })

    return scores
}

const getScoreColorClass = (row: Stock, score: number) => {
    if (row.scoreClass) {
        return row.scoreClass
    }
    if (score >= 0.7) return 'text-emerald-400'
    if (score >= 0.4) return 'text-amber-400'
    return 'text-rose-400'
}

const formatScoreValue = (score: number) =>
    score.toLocaleString('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    })

const renderHeaderLabel = (header: string) => {
    const segments = multiLineHeaders[header] ?? [header]
    return segments.map((segment, index) => (
        <span key={`${header}-${segment}-${index}`} className="block leading-tight">
            {segment}
        </span>
    ))
}

// --- Main Component ---

const Stock2 = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [allowedSymbols, setAllowedSymbols] = useState<string[] | null>(null)
    const [stockDetails, setStockDetails] = useState<Record<string, StockDetailResponse>>({})
    const loadingSymbolsRef = useRef(new Set<string>())
    const { getMatchPrice, isRecentlyUpdated } = useMarketData()

    // --- Data Loading Effects (Same as Original) ---
    useEffect(() => {
        const controller = new AbortController()
        let isMounted = true

        const loadStockSymbols = async () => {
            try {
                const response = await fetch(API_STOCK_IDS_URL, { signal: controller.signal })
                if (!response.ok) throw new Error('Unable to load stock symbols')
                const data = (await response.json()) as unknown
                if (!Array.isArray(data)) throw new Error('Unexpected payload')
                if (!isMounted) return

                const normalizedSymbols = data
                    .map((symbol) => String(symbol ?? '').trim())
                    .filter((symbol) => symbol.length > 0)
                    .map((symbol) => symbol.toUpperCase())

                setAllowedSymbols(normalizedSymbols)
            } catch (error) {
                if (!isMounted) return
                console.error('Unable to load stock symbols', error)
            }
        }

        loadStockSymbols()
        return () => { isMounted = false; controller.abort() }
    }, [])

    useEffect(() => {
        if (!allowedSymbols || allowedSymbols.length === 0) return
        const controller = new AbortController()
        let isMounted = true

        const symbolsToLoad = allowedSymbols.filter(
            (symbol) => !stockDetails[symbol] && !loadingSymbolsRef.current.has(symbol),
        )

        if (symbolsToLoad.length === 0) {
            return () => controller.abort()
        }

        symbolsToLoad.forEach((symbol) => loadingSymbolsRef.current.add(symbol))

        void Promise.all(
            symbolsToLoad.map(async (symbol) => {
                try {
                    const detail = await fetchStockDetail(symbol, controller.signal)
                    if (!isMounted) return
                    setStockDetails((prev) => (prev[symbol] ? prev : { ...prev, [symbol]: detail }))
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'AbortError') return
                } finally {
                    loadingSymbolsRef.current.delete(symbol)
                }
            }),
        )

        return () => { isMounted = false; controller.abort() }
    }, [allowedSymbols])

    // --- Computed Data ---
    const statsSource: Stock[] = useMemo(() => {
        if (!allowedSymbols || allowedSymbols.length === 0) return []
        const rows = allowedSymbols.map((symbol) => {
            const detail = stockDetails[symbol]
            return new Stock({
                stockId: symbol,
                stockName: detail?.stockName ?? symbol,
                sector: detail?.sector ?? '',
                matchPrice: detail?.matchPrice ?? 0,
                peRatio: detail?.peRatio ?? 0,
                pbRatio: detail?.pbRatio ?? 0,
                pcfRatio: detail?.pcfRatio ?? 0,
                psRatio: detail?.psRatio ?? 0,
                industryPeRatio: detail?.industryPeRatio,
                industryPbRatio: detail?.industryPbRatio,
                industryPcfRatio: detail?.industryPcfRatio,
                industryPsRatio: detail?.industryPsRatio,
            })
        })
        rows.sort((a, b) => a.symbol.localeCompare(b.symbol))
        return rows
    }, [allowedSymbols, stockDetails])

    const filteredPriceboard = useMemo(
        () => statsSource.filter((row) => row.symbol.toLowerCase().includes(searchTerm.trim().toLowerCase())),
        [statsSource, searchTerm],
    )

    const topsisScores = useMemo(() => computeTopsisScores(statsSource, stockDetails), [statsSource, stockDetails])

    const scoredStatsSource = useMemo(
        () => statsSource.map((row) => {
            const computedScore = topsisScores.get(row.symbol)
            const hasScore = Number.isFinite(computedScore ?? NaN)
            const score = hasScore ? (computedScore as number) : 0
            return { row, score, hasScore }
        }),
        [statsSource, topsisScores],
    )

    const averageScore = useMemo(() => {
        if (scoredStatsSource.length === 0) return 0
        const total = scoredStatsSource.reduce((sum, entry) => sum + entry.score, 0)
        return total / scoredStatsSource.length
    }, [scoredStatsSource])

    const bestStockEntry = useMemo(() => {
        if (scoredStatsSource.length === 0) return null
        return scoredStatsSource.reduce((best, entry) => (entry.score > best.score ? entry : best))
    }, [scoredStatsSource])

    const worstStockEntry = useMemo(() => {
        if (scoredStatsSource.length === 0) return null
        return scoredStatsSource.reduce((worst, entry) => (entry.score < worst.score ? entry : worst))
    }, [scoredStatsSource])

    const scoreBySymbol = useMemo(() => {
        const map = new Map<string, number>()
        scoredStatsSource.forEach(({ row, score, hasScore }) => {
            if (hasScore) map.set(row.symbol, score)
        })
        return map
    }, [scoredStatsSource])

    const bestStock = bestStockEntry?.row ?? null
    const worstStock = worstStockEntry?.row ?? null
    const bestDetail = bestStock ? stockDetails[bestStock.symbol] : null
    const worstDetail = worstStock ? stockDetails[worstStock.symbol] : null

    // --- UI Render ---
    return (
        <div className="flex flex-col gap-6 font-sans text-slate-100 h-full">
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-amber-500 mb-1">
                        <ActivityIcon className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Analytics</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex gap-2 items-center">
                        Market <span className="text-slate-500">Scanner</span>
                    </h1>
                </div>

                {/* Search */}
                <div className="relative group w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-xl border border-slate-800/60 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/10 focus:outline-none transition-all"
                        placeholder="Search by symbol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Average Score Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm group">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Market Average</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-white">{formatScoreValue(averageScore)}</span>
                        <span className="text-sm font-medium text-slate-400">/ 1.0</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Based on {statsSource.length} active stocks</p>
                </div>

                {/* Top Performer Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm group hover:border-emerald-500/30 transition-colors">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUpIcon className="h-4 w-4 text-emerald-500" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Top Performer</p>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold text-white">{bestStock?.symbol ?? '—'}</span>
                        <div className="text-right">
                            <div className="text-lg font-bold text-emerald-400">{bestStockEntry ? formatScoreValue(bestStockEntry.score) : '—'}</div>
                            <div className="text-[10px] text-emerald-500/70 uppercase">Score</div>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/50 pt-2">
                        <span>Price</span>
                        <span className="font-mono text-slate-200">
                            {bestStock ? formatLiveValue(getMatchPrice(bestStock.symbol) ?? bestDetail?.matchPrice ?? bestStock.matchPrice, 2) : '—'}
                        </span>
                    </div>
                </div>

                {/* Needs Attention Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm group hover:border-rose-500/30 transition-colors">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-rose-500/10 blur-2xl group-hover:bg-rose-500/20 transition-all" />
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDownIcon className="h-4 w-4 text-rose-500" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">Needs Attention</p>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold text-white">{worstStock?.symbol ?? '—'}</span>
                        <div className="text-right">
                            <div className="text-lg font-bold text-rose-400">{worstStockEntry ? formatScoreValue(worstStockEntry.score) : '—'}</div>
                            <div className="text-[10px] text-rose-500/70 uppercase">Score</div>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/50 pt-2">
                        <span>Price</span>
                        <span className="font-mono text-slate-200">
                            {worstStock ? formatLiveValue(getMatchPrice(worstStock.symbol) ?? worstDetail?.matchPrice ?? worstStock.matchPrice, 2) : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-md flex flex-col">
                {/* Table Header */}
                <div
                    className="grid border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 backdrop-blur-lg sticky top-0 z-10"
                    style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(80px, 1fr))` }}
                >
                    {headers.map((header) => (
                        <div key={header} className="px-4 py-4 text-center flex items-center justify-center h-14">
                            {renderHeaderLabel(header)}
                        </div>
                    ))}
                </div>

                {/* Table Body */}
                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700/50">
                    {filteredPriceboard.length === 0 ? (
                        <div className="flex h-40 flex-col items-center justify-center text-slate-500">
                            <SearchIcon className="mb-2 h-8 w-8 opacity-20" />
                            <p className="text-sm">No stocks found matching your criteria</p>
                        </div>
                    ) : (
                        filteredPriceboard.map((row, rowIndex) => {
                            const detail = stockDetails[row.symbol]
                            const realtimePrice = getMatchPrice(row.symbol)
                            const matchPriceValue = realtimePrice ?? detail?.matchPrice

                            const scores = {
                                pb: detail?.pbRatio,
                                pcf: detail?.pcfRatio,
                                pe: detail?.peRatio,
                                ps: detail?.psRatio
                            }

                            const rawScore = scoreBySymbol.get(row.symbol)
                            const hasScore = rawScore !== undefined
                            const scoreValue = hasScore ? rawScore : 0
                            const isPriceUpdated = isRecentlyUpdated(row.symbol)

                            return (
                                <div
                                    key={row.symbol}
                                    className={`grid border-b border-slate-800/50 text-sm font-medium transition-colors hover:bg-slate-800/30 ${rowIndex % 2 === 0 ? 'bg-slate-900/20' : 'bg-transparent'
                                        }`}
                                    style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(80px, 1fr))` }}
                                >
                                    {/* Symbol */}
                                    <div className="px-4 py-3 flex items-center justify-center">
                                        <Link
                                            to={`/stock/${row.symbol}`}
                                            className="font-bold text-amber-500 hover:text-amber-400 hover:underline decoration-amber-500/30 underline-offset-4 transition-all"
                                        >
                                            {row.symbol}
                                        </Link>
                                    </div>

                                    {/* Match Price */}
                                    <div className={`px-4 py-3 flex items-center justify-center font-mono ${isPriceUpdated ? 'animate-pulse text-white' : 'text-slate-200'}`}>
                                        {formatLiveValue(matchPriceValue, 2)}
                                    </div>

                                    {/* Ratios */}
                                    <div className="px-4 py-3 flex items-center justify-center text-slate-400">{formatLiveValue(scores.pb)}</div>
                                    <div className="px-4 py-3 flex items-center justify-center text-slate-400">{formatLiveValue(scores.pcf)}</div>
                                    <div className="px-4 py-3 flex items-center justify-center text-slate-400">{formatLiveValue(scores.pe)}</div>
                                    <div className="px-4 py-3 flex items-center justify-center text-slate-400">{formatLiveValue(scores.ps)}</div>

                                    {/* Overall Score with Bar */}
                                    <div className="px-4 py-3 flex flex-col justify-center h-full relative">
                                        <div className={`text-center font-bold mb-1.5 ${getScoreColorClass(row, scoreValue)}`}>
                                            {hasScore ? formatScoreValue(scoreValue) : '—'}
                                        </div>
                                        {hasScore && (
                                            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${scoreValue >= 0.7 ? 'bg-emerald-500' :
                                                            scoreValue >= 0.4 ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`}
                                                    style={{ width: `${Math.min(scoreValue * 100, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default Stock2
