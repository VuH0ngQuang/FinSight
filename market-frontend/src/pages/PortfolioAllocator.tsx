import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { allocatePortfolio, type PortfolioAllocationResponse } from '../services/api/portfolioApi'
import { formatPrice, formatPercent, formatScore } from '../utils/formatters'
import PortfolioPieChart from '../components/charts/PortfolioPieChart'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorBanner from '../components/ui/ErrorBanner'
import StatCard from '../components/ui/StatCard'

const PortfolioAllocator = () => {
  const { userId } = useAuth()
  const [budget, setBudget] = useState('')
  const [numStocks, setNumStocks] = useState('5')
  const [lotSize, setLotSize] = useState('100')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PortfolioAllocationResponse | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setError(null)
    setLoading(true)
    try {
      const res = await allocatePortfolio({
        userId,
        budget: Number(budget),
        numberOfStocks: Number(numStocks),
        lotSize: Number(lotSize) || undefined,
      })
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Allocation failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100'

  return (
    <div className="flex gap-6">
      {/* Left form */}
      <div className="w-72 shrink-0">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Allocate Portfolio</h2>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget (VND)</label>
              <input
                type="number"
                required
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={inputCls}
                placeholder="e.g. 100000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Number of stocks (2–20)</label>
              <input
                type="number"
                required
                min="2"
                max="20"
                value={numStocks}
                onChange={(e) => setNumStocks(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Lot size (optional)</label>
              <input
                type="number"
                min="1"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className={inputCls}
                placeholder="100"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !budget}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><LoadingSpinner size="sm" /><span>Computing…</span></> : 'Allocate Portfolio'}
            </button>
          </form>
          {error && <div className="mt-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}
        </div>
      </div>

      {/* Right results */}
      <div className="flex-1 flex flex-col gap-5">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <svg className="h-12 w-12 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p className="text-sm">Fill in the form to compute an AI-optimized allocation</p>
          </div>
        )}

        {result && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Total Investment"
                value={<span className="font-mono">{formatPrice(result.totalInvestment, 0)}</span>}
                accent="blue"
              />
              <StatCard
                label="Remaining Budget"
                value={<span className="font-mono">{formatPrice(result.remainingBudget, 0)}</span>}
                accent="emerald"
              />
              <StatCard
                label="Utilization"
                value={result.budget > 0 ? formatPercent(result.totalInvestment / result.budget) : '—'}
                accent="amber"
              />
            </div>

            {/* Pie chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Allocation Breakdown</h3>
              <PortfolioPieChart allocations={result.allocations ?? []} />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Stock', 'TOPSIS Score', 'Shares', 'Price/Share', 'Total Cost', '%'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(result.allocations ?? []).map((a) => (
                    <tr key={a.stockId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link to={`/stocks/${a.stockId}`} className="font-bold text-blue-600 hover:text-blue-700 hover:underline">{a.stockId}</Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">{formatScore(a.topsisScore)}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{a.numberOfShares.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{formatPrice(a.pricePerShare)}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{formatPrice(a.totalCost, 0)}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{a.allocationPercentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PortfolioAllocator
