import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { normalizedPriceboard } from '../data/priceboard'
import type { Stock as StockModel } from '../models/Stock'
import { API_STOCK_IDS_URL } from '../config/api'
import {
  fetchStockDetail,
  getCachedStockDetail,
  type StockDetailResponse,
} from '../services/stockDetail'
import { useMarketData } from '../hooks/useMarketData'

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
  row: StockModel,
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
  rows: StockModel[],
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

const getScoreColorClass = (row: StockModel, score: number) => {
  if (row.scoreClass) {
    return row.scoreClass
  }

  if (score >= 0.7) {
    return 'text-emerald-400'
  }

  if (score >= 0.4) {
    return 'text-amber-300'
  }

  return 'text-rose-300'
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

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [allowedSymbols, setAllowedSymbols] = useState<string[] | null>(null)
  const [stockDetails, setStockDetails] = useState<Record<string, StockDetailResponse>>(
    () => {
      const cachedDetails: Record<string, StockDetailResponse> = {}
      normalizedPriceboard.forEach((row) => {
        const cached = getCachedStockDetail(row.symbol)
        if (cached) {
          cachedDetails[row.symbol] = cached
        }
      })
      return cachedDetails
    },
  )
  const loadingSymbolsRef = useRef(new Set<string>())
  const { getMatchPrice, isRecentlyUpdated } = useMarketData()

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    const loadStockSymbols = async () => {
      try {
        const response = await fetch(API_STOCK_IDS_URL, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to load stock symbols')
        }

        const data = (await response.json()) as unknown

        if (!Array.isArray(data)) {
          throw new Error('Unexpected payload while loading stock symbols')
        }

        if (!isMounted) {
          return
        }

        const normalizedSymbols = data
          .map((symbol) => String(symbol ?? '').trim())
          .filter((symbol) => symbol.length > 0)
          .map((symbol) => symbol.toUpperCase())

        setAllowedSymbols(normalizedSymbols)
      } catch (error) {
        if (!isMounted) {
          return
        }

        // eslint-disable-next-line no-console
        console.error('Unable to load stock symbols', error)
      }
    }

    loadStockSymbols()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const displayedPriceboard = useMemo(() => {
    if (allowedSymbols === null) {
      return normalizedPriceboard
    }

    return normalizedPriceboard.filter((row) =>
      allowedSymbols.includes(row.symbol),
    )
  }, [allowedSymbols])

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    const symbolsToLoad = displayedPriceboard
      .map((row) => row.symbol)
      .filter(
        (symbol) =>
          !stockDetails[symbol] && !loadingSymbolsRef.current.has(symbol),
      )

    if (symbolsToLoad.length === 0) {
      return () => {
        controller.abort()
      }
    }

    symbolsToLoad.forEach((symbol) => loadingSymbolsRef.current.add(symbol))

    void Promise.all(
      symbolsToLoad.map(async (symbol) => {
        try {
          const detail = await fetchStockDetail(symbol, controller.signal)
          if (!isMounted) {
            return
          }

          setStockDetails((prev) =>
            prev[symbol] ? prev : { ...prev, [symbol]: detail },
          )
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return
          }
        } finally {
          loadingSymbolsRef.current.delete(symbol)
        }
      }),
    )

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [displayedPriceboard, stockDetails])

  const filteredPriceboard = useMemo(
    () =>
      displayedPriceboard.filter((row) =>
        row.symbol.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      ),
    [displayedPriceboard, searchTerm],
  )

  const statsSource = useMemo(() => {
    if (displayedPriceboard.length > 0) {
      return displayedPriceboard
    }

    return normalizedPriceboard
  }, [displayedPriceboard])

  const topsisScores = useMemo(
    () => computeTopsisScores(statsSource, stockDetails),
    [statsSource, stockDetails],
  )

  const scoredStatsSource = useMemo(
    () =>
      statsSource.map((row) => {
        const computedScore = topsisScores.get(row.symbol)
        const score = Number.isFinite(computedScore ?? NaN)
          ? (computedScore as number)
          : 0
        return { row, score }
      }),
    [statsSource, topsisScores],
  )

  const averageScore = useMemo(() => {
    if (scoredStatsSource.length === 0) {
      return 0
    }

    const total = scoredStatsSource.reduce((sum, entry) => sum + entry.score, 0)
    return total / scoredStatsSource.length
  }, [scoredStatsSource])

  const bestStockEntry = useMemo(() => {
    if (scoredStatsSource.length === 0) {
      return null
    }

    return scoredStatsSource.reduce((best, entry) =>
      entry.score > best.score ? entry : best,
    )
  }, [scoredStatsSource])

  const worstStockEntry = useMemo(() => {
    if (scoredStatsSource.length === 0) {
      return null
    }

    return scoredStatsSource.reduce((worst, entry) =>
      entry.score < worst.score ? entry : worst,
    )
  }, [scoredStatsSource])

  const scoreBySymbol = useMemo(() => {
    const map = new Map<string, number>()
    scoredStatsSource.forEach(({ row, score }) => {
      map.set(row.symbol, score)
    })
    return map
  }, [scoredStatsSource])

  const bestStock = bestStockEntry?.row ?? null
  const worstStock = worstStockEntry?.row ?? null
  const bestDetail = bestStock ? stockDetails[bestStock.symbol] : null
  const worstDetail = worstStock ? stockDetails[worstStock.symbol] : null

  const trimmedSearchTerm = searchTerm.trim()
  const searchMessage =
    trimmedSearchTerm.length > 0
      ? `No symbols match "${trimmedSearchTerm}".`
      : 'No symbols match the current filters.'

  const tableEmptyMessage =
    allowedSymbols && allowedSymbols.length === 0
      ? 'You have not configured any stock symbols yet.'
      : searchMessage

  return (
    <section className="space-y-6 text-white">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Live ratios</p>
          <h1 className="text-4xl font-semibold tracking-tight">Priceboard</h1>
        </div>
        <div className="flex w-full justify-end md:w-auto">
          <label htmlFor="stock-search" className="sr-only">
            Search list
          </label>
          <div className="flex w-full max-w-xs items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-inner">
            <svg
              className="h-4 w-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16" y1="16" x2="22" y2="22" />
            </svg>
            <input
              id="stock-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search symbol"
              className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#121212] to-[#040506] p-5">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Average Score</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {formatScoreValue(averageScore)}
          </p>
          <p className="text-sm text-slate-300">
            Across {statsSource.length} stock{statsSource.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#121212] to-[#040506] p-5">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Top performer</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {bestStock?.symbol ?? '—'}
          </p>
          <p className="text-sm text-emerald-300">
            Score {bestStockEntry ? formatScoreValue(bestStockEntry.score) : '—'} · Match price{' '}
            {bestStock
              ? formatLiveValue(
                  getMatchPrice(bestStock.symbol) ??
                    bestDetail?.matchPrice ??
                    bestStock.matchPrice,
                  2,
                )
              : '—'}
          </p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#121212] to-[#040506] p-5">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Needs attention</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {worstStock?.symbol ?? '—'}
          </p>
          <p className="text-sm text-rose-300">
            Score {worstStockEntry ? formatScoreValue(worstStockEntry.score) : '—'} · Match price{' '}
            {worstStock
              ? formatLiveValue(
                  getMatchPrice(worstStock.symbol) ??
                    worstDetail?.matchPrice ??
                    worstStock.matchPrice,
                  2,
                )
              : '—'}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#212121] shadow-[0_35px_90px_rgba(0,0,0,0.65)]">
        <div
          className="grid text-[0.75rem] font-semibold uppercase tracking-[0.35em] text-white justify-center items-center"
          style={{
            gridTemplateColumns: `repeat(${headers.length}, minmax(70px, 1fr))`,
          }}
        >
          {headers.map((header) => (
            <div
              key={header}
              className="border-b border-white/5 px-4 py-3 text-center whitespace-normal break-words last:border-r-0 flex flex-col justify-center min-h-[64px] bg-gradient-to-b from-white/5 to-transparent"
            >
              {renderHeaderLabel(header)}
            </div>
          ))}
        </div>

        <div className="bg-[#212121] max-h-[650px] overflow-y-auto scrollbar-hide">
          {filteredPriceboard.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              {tableEmptyMessage}
            </div>
          ) : (
            filteredPriceboard.map((row, rowIndex) => {
              const isBest = bestStock ? row.symbol === bestStock.symbol : false
              const isWorst = worstStock ? row.symbol === worstStock.symbol : false
              const rowBg = isBest
                ? 'bg-white/5'
                : isWorst
                ? 'bg-rose-500/5'
                : rowIndex % 2 === 0
                ? 'bg-white/5'
                : 'bg-transparent'

              const detail = stockDetails[row.symbol]
              const realtimePrice = getMatchPrice(row.symbol)
              const matchPriceValue = realtimePrice ?? detail?.matchPrice ?? row.matchPrice
              const pbValue = detail?.pbRatio ?? row.pb
              const pcfValue = detail?.pcfRatio ?? row.pcf
              const peValue = detail?.peRatio ?? row.pe
              const psValue = detail?.psRatio ?? row.ps
              const scoreValue = scoreBySymbol.get(row.symbol) ?? row.overallScore ?? 0

              const isPriceUpdated = isRecentlyUpdated(row.symbol)
              const columns = [
                {
                  value: row.symbol,
                  className: 'text-left font-bold tracking-wide',
                  isSymbol: true,
                },
                {
                  value: formatLiveValue(matchPriceValue, 2),
                  isPrice: true,
                },
                {
                  value: formatLiveValue(pbValue),
                },
                {
                  value: formatLiveValue(pcfValue),
                },
                {
                  value: formatLiveValue(peValue),
                },
                {
                  value: formatLiveValue(psValue),
                },
                {
                  value: formatScoreValue(scoreValue),
                  isScore: true,
                  scoreValue,
                },
              ]

              return (
                <div
                  key={row.symbol}
                  className={`grid border-b border-white/5 text-sm font-semibold text-white justify-center items-center transition ${rowBg}`}
                  style={{
                    gridTemplateColumns: `repeat(${headers.length}, minmax(70px, 1fr))`,
                  }}
                >
                  {columns.map(
                    (
                      { value, className, isSymbol, isScore, isPrice, scoreValue: columnScore },
                      columnIndex,
                    ) => {
                      const numericScore = columnScore ?? 0
                      const textClass = isScore
                        ? getScoreColorClass(row, numericScore)
                        : 'text-white/80'
                      const flashClass =
                        isPrice && isPriceUpdated ? 'animate-flash' : ''

                      return (
                        <div
                          key={`${row.symbol}-${value}-${columnIndex}`}
                          className={`px-4 py-3 text-center transition-colors duration-300 ${className ?? ''} ${textClass} ${flashClass}`}
                        >
                          {isSymbol ? (
                            <Link
                              to={`/stock/${row.symbol}`}
                              className="block text-left text-white/90 hover:text-white"
                            >
                              {value}
                            </Link>
                          ) : (
                            value
                          )}
                          {isScore && (
                            <div className="mt-1 h-1 rounded-full bg-white/10">
                              <span
                                className="block h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400"
                                style={{
                                  width: `${Math.max(
                                    Math.min(numericScore * 100, 100),
                                    0,
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    },
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export default Stock

