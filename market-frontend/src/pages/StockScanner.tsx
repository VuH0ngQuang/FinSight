import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWatchlist } from '../contexts/WatchlistContext'
import { useAhpWeights } from '../hooks/useAhpWeights'
import { useStockList } from '../hooks/useStockList'
import { useMarketData } from '../hooks/useMarketData'
import { buildMetrics, computeTopsis } from '../utils/topsis'
import { addFavoriteStock, removeFavoriteStock } from '../services/api/userApi'
import { formatPrice, formatScore } from '../utils/formatters'
import StatCard from '../components/ui/StatCard'
import ScoreBar from '../components/ui/ScoreBar'
import PriceTag from '../components/ui/PriceTag'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorBanner from '../components/ui/ErrorBanner'

const StockScanner = () => {
  const { userId } = useAuth()
  const { favoriteIds, refresh: refreshWatchlist } = useWatchlist()
  const ahpWeights = useAhpWeights(userId ?? undefined)
  const { symbols, details, isLoading, error } = useStockList({ forceRefreshOnMount: true })
  const { getMatchPrice, isRecentlyUpdated } = useMarketData()
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')
  const [favLoading, setFavLoading] = useState<Set<string>>(new Set())

  const { scores: topsisScores, compareRank } = useMemo(() => {
    if (!symbols) return { scores: new Map<string, number>(), compareRank: () => 0 as number }
    const rows = symbols.map((s) => ({ symbol: s, metrics: buildMetrics(details[s]) }))
    return computeTopsis(rows, ahpWeights)
  }, [symbols, details, ahpWeights])

  const sectors = useMemo(() => {
    const set = new Set<string>()
    Object.values(details).forEach((d) => { if (d.sector) set.add(d.sector) })
    return [...set].sort()
  }, [details])

  const rows = useMemo(() => {
    if (!symbols) return []
    return symbols
      .map((s) => ({
        symbol: s,
        detail: details[s],
        score: topsisScores.get(s) ?? 0,
        isFav: userId ? favoriteIds.has(s.toUpperCase()) : false,
      }))
      .filter((r) => {
        const matchSearch = r.symbol.toLowerCase().includes(search.toLowerCase()) ||
          (r.detail?.stockName ?? '').toLowerCase().includes(search.toLowerCase())
        const matchSector = !sectorFilter || r.detail?.sector === sectorFilter
        return matchSearch && matchSector
      })
      .sort((a, b) => compareRank(a.symbol, b.symbol))
  }, [symbols, details, topsisScores, compareRank, search, sectorFilter, userId, favoriteIds])

  const avgScore = useMemo(() => {
    const vals = [...topsisScores.values()]
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
  }, [topsisScores])

  const sortedScores = useMemo(
    () => [...topsisScores.entries()].sort((a, b) => compareRank(a[0], b[0])),
    [topsisScores, compareRank],
  )
  const topEntry = sortedScores[0]
  const bottomEntry = sortedScores[sortedScores.length - 1]

  const toggleFavorite = async (symbol: string, isFav: boolean) => {
    if (!userId) return
    setFavLoading((prev) => new Set(prev).add(symbol))
    try {
      if (isFav) await removeFavoriteStock({ userId, stockId: symbol })
      else await addFavoriteStock({ userId, stockId: symbol })
      await refreshWatchlist()
    } catch { /* ignore */ } finally {
      setFavLoading((prev) => { const s = new Set(prev); s.delete(symbol); return s })
    }
  }

  if (isLoading && !symbols) return <LoadingSpinner label="Loading stocks..." />
  if (error) return <ErrorBanner message={error} />

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Stock Scanner</h1>
          <p className="text-sm text-slate-500">
            TOPSIS-ranked across {symbols?.length ?? 0} stocks
            {!userId && ' using equal default AHP weights'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              className="rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            <option value="">All sectors</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Avg Score" value={formatScore(avgScore)} sub={`${symbols?.length ?? 0} stocks`} accent="blue" />
        <StatCard label="Top Performer" value={topEntry?.[0] ?? '—'} sub={topEntry ? formatScore(topEntry[1]) : undefined} accent="emerald" />
        <StatCard label="Lowest Performer" value={bottomEntry?.[0] ?? '—'} sub={bottomEntry ? formatScore(bottomEntry[1]) : undefined} accent="red" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Symbol', 'Company', 'Sector', 'Live Price', 'P/E', 'P/B', 'P/CF', 'P/S', 'TOPSIS Score', '★'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.length === 0 && (
              <tr><td colSpan={10} className="py-10 text-center text-slate-400">No stocks match your filters</td></tr>
            )}
            {rows.map(({ symbol, detail, score, isFav }) => {
              const livePrice = getMatchPrice(symbol) ?? detail?.matchPrice
              const flashing = isRecentlyUpdated(symbol)
              const hasDetail = !!detail
              return (
                <tr key={symbol} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/stocks/${symbol}`} className="font-bold text-blue-600 hover:text-blue-700 hover:underline">{symbol}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-32 truncate">{detail?.stockName ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{detail?.sector ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <PriceTag price={livePrice} isFlashing={flashing} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">{hasDetail ? formatPrice(detail.peRatio) : <span className="text-slate-200 animate-pulse">—</span>}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{hasDetail ? formatPrice(detail.pbRatio) : <span className="text-slate-200 animate-pulse">—</span>}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{hasDetail ? formatPrice(detail.pcfRatio) : <span className="text-slate-200 animate-pulse">—</span>}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{hasDetail ? formatPrice(detail.psRatio) : <span className="text-slate-200 animate-pulse">—</span>}</td>
                  <td className="px-4 py-3 w-40">
                    {hasDetail ? <ScoreBar score={score} /> : <div className="h-1.5 rounded bg-slate-100 animate-pulse" />}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={favLoading.has(symbol) || !userId}
                      onClick={() => void toggleFavorite(symbol, isFav)}
                      className={`transition-colors ${isFav ? 'text-red-500 hover:text-red-700' : 'text-slate-300 hover:text-red-400'}`}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StockScanner
