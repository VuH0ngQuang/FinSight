import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStockList } from '../hooks/useStockList'
import { useMarketData } from '../hooks/useMarketData'
import { buildMetrics, computeTopsis } from '../utils/topsis'
import { addFavoriteStock, removeFavoriteStock } from '../services/api/userApi'
import StatCard from '../components/ui/StatCard'
import PriceTag from '../components/ui/PriceTag'
import Badge from '../components/ui/Badge'
import VietstockIframe from '../components/charts/VietstockIframe'
import { formatScore, formatRatio } from '../utils/formatters'

const Dashboard = () => {
  const { userId, userDetail, refreshUserDetail } = useAuth()
  const { symbols, details, isLoading } = useStockList()
  const { getMatchPrice, isRecentlyUpdated } = useMarketData()
  const [chartSymbol, setChartSymbol] = useState('VNINDEX')

  // Compute TOPSIS scores
  const topsisScores = useMemo(() => {
    if (!symbols) return new Map<string, number>()
    const rows = symbols.map((s) => ({ symbol: s, metrics: buildMetrics(details[s]) }))
    return computeTopsis(rows)
  }, [symbols, details])

  const avgScore = useMemo(() => {
    if (topsisScores.size === 0) return 0
    const vals = [...topsisScores.values()]
    return vals.reduce((s, v) => s + v, 0) / vals.length
  }, [topsisScores])

  const topSymbol = useMemo(() => {
    let best = ''
    let bestScore = -1
    topsisScores.forEach((score, sym) => { if (score > bestScore) { bestScore = score; best = sym } })
    return best
  }, [topsisScores])

  // Favorites from userDetail
  const favoriteSymbols: string[] = useMemo(() => {
    if (!userId || !symbols) return []
    return symbols.filter((s) => {
      const detail = details[s]
      return detail?.favoredByUsers?.includes(userId)
    })
  }, [userId, symbols, details])

  const handleRemoveFavorite = async (stockId: string) => {
    if (!userId) return
    try {
      await removeFavoriteStock({ userId, stockId })
      await refreshUserDetail()
    } catch { /* ignore */ }
  }

  const handleAddFavorite = async (stockId: string) => {
    if (!userId) return
    try {
      await addFavoriteStock({ userId, stockId })
      await refreshUserDetail()
    } catch { /* ignore */ }
  }

  const subscription = userDetail?.subscriptions?.[0]?.subscriptionPlan?.planName ?? 'Free'
  const totalStocks = symbols?.length ?? 0

  return (
    <div className="flex gap-6 h-full">
      {/* Main */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Stocks"
            value={isLoading ? '…' : totalStocks}
            accent="blue"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          <StatCard
            label="Avg TOPSIS Score"
            value={avgScore > 0 ? formatScore(avgScore) : '—'}
            sub="Market benchmark"
            accent="emerald"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>}
          />
          <StatCard
            label="Top Performer"
            value={topSymbol || '—'}
            sub={topSymbol ? formatScore(topsisScores.get(topSymbol) ?? 0) : undefined}
            accent="amber"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
          />
          <StatCard
            label="Subscription"
            value={<Badge variant="blue">{subscription}</Badge>}
            accent="blue"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
          />
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Technical Chart</h2>
            <div className="flex items-center gap-2">
              <input
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none uppercase"
                placeholder="VNINDEX"
                value={chartSymbol}
                onChange={(e) => setChartSymbol(e.target.value.toUpperCase())}
              />
            </div>
          </div>
          <VietstockIframe symbol={chartSymbol} height={623} />
        </div>

        {/* Favorite mini-cards */}
        {favoriteSymbols.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Favorites Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoriteSymbols.slice(0, 6).map((sym) => {
                const d = details[sym]
                const score = topsisScores.get(sym)
                return (
                  <Link key={sym} to={`/stocks/${sym}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{sym}</span>
                      <PriceTag price={getMatchPrice(sym) ?? d?.matchPrice} isFlashing={isRecentlyUpdated(sym)} size="sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                      <div><span className="block text-slate-400">P/E</span>{formatRatio(d?.peRatio)}</div>
                      <div><span className="block text-slate-400">P/B</span>{formatRatio(d?.pbRatio)}</div>
                      <div><span className="block text-slate-400">Score</span>{score != null ? formatScore(score) : '—'}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Watchlist sidebar */}
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Watchlist</h2>
            <Link to="/stocks" className="text-xs text-blue-600 hover:text-blue-700">Browse all</Link>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {favoriteSymbols.length === 0 && !isLoading && (
              <div className="p-6 text-center text-sm text-slate-400">
                No favorites yet. <Link to="/stocks" className="text-blue-600 hover:underline">Browse stocks</Link>
              </div>
            )}
            {favoriteSymbols.map((sym) => {
              const d = details[sym]
              const livePrice = getMatchPrice(sym) ?? d?.matchPrice
              const flashing = isRecentlyUpdated(sym)
              return (
                <div key={sym} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link to={`/stocks/${sym}`} className="font-semibold text-slate-900 hover:text-blue-600 text-sm">{sym}</Link>
                    <p className="text-xs text-slate-400 truncate">{d?.stockName ?? d?.sector ?? ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriceTag price={livePrice} isFlashing={flashing} size="sm" />
                    <button
                      onClick={() => void handleRemoveFavorite(sym)}
                      className="text-red-400 hover:text-red-600"
                      title="Remove from watchlist"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}

            {/* All stocks for quick add */}
            {symbols && symbols.filter((s) => !favoriteSymbols.includes(s)).slice(0, 10).map((sym) => {
              const d = details[sym]
              return (
                <div key={sym} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors opacity-60">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-700 text-sm">{sym}</span>
                    <p className="text-xs text-slate-400 truncate">{d?.sector ?? ''}</p>
                  </div>
                  <button
                    onClick={() => void handleAddFavorite(sym)}
                    className="text-slate-300 hover:text-blue-500"
                    title="Add to watchlist"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
