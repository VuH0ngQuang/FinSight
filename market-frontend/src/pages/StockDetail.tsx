import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMarketData } from '../hooks/useMarketData'
import { getCachedStockDetail, fetchStockDetail, type StockDetailResponse, type StockYearApiRecord } from '../services/stockDetail'
import { getStockYearData } from '../services/api/stockYearDataApi'
import { addFavoriteStock, removeFavoriteStock } from '../services/api/userApi'
import { formatPrice, formatRatio } from '../utils/formatters'
import PriceTag from '../components/ui/PriceTag'
import Badge from '../components/ui/Badge'
import TabGroup from '../components/ui/TabGroup'
import StatCard from '../components/ui/StatCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorBanner from '../components/ui/ErrorBanner'
import VietstockIframe from '../components/charts/VietstockIframe'
import ValuationLineChart from '../components/charts/ValuationLineChart'
import FinancialBarChart from '../components/charts/FinancialBarChart'
import RatioCompareChart from '../components/charts/RatioCompareChart'

const TABS = [
  { id: 'chart', label: 'Technical Chart' },
  { id: 'financials', label: 'Financials' },
  { id: 'valuation', label: 'Valuation' },
]

const FinRow = ({ label, value }: { label: string; value?: number | null }) => (
  <tr className="border-b border-slate-50">
    <td className="py-2 pr-4 text-xs text-slate-500 whitespace-nowrap">{label}</td>
    <td className="py-2 font-mono text-xs text-slate-800 text-right">{value != null ? formatPrice(value) : '—'}</td>
  </tr>
)

const StockDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const { userId } = useAuth()
  const { getMatchPrice, isRecentlyUpdated } = useMarketData()

  const [detail, setDetail] = useState<StockDetailResponse | null>(getCachedStockDetail(symbol))
  const [loading, setLoading] = useState(!detail)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('chart')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [yearDataCache, setYearDataCache] = useState<Record<number, StockYearApiRecord>>({})
  const [yearLoading, setYearLoading] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    if (!symbol) return
    const controller = new AbortController()
    setLoading(true)
    fetchStockDetail(symbol, controller.signal, { forceRefresh: true })
      .then((d) => {
        setDetail(d)
        const years = Object.keys(d.yearData ?? {}).map(Number).sort((a, b) => b - a)
        if (years.length > 0) setSelectedYear(years[0])
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Failed to load stock')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [symbol])

  useEffect(() => {
    if (!detail || !userId) return
    setIsFav(detail.favoredByUsers?.includes(userId) ?? false)
  }, [detail, userId])

  useEffect(() => {
    if (!symbol || !selectedYear || yearDataCache[selectedYear]) return
    setYearLoading(true)
    getStockYearData(symbol, selectedYear)
      .then((d) => setYearDataCache((prev) => ({ ...prev, [selectedYear]: d })))
      .catch(() => { /* use yearData from detail */ })
      .finally(() => setYearLoading(false))
  }, [selectedYear, symbol]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFavorite = async () => {
    if (!userId || !symbol) return
    setFavLoading(true)
    try {
      if (isFav) await removeFavoriteStock({ userId, stockId: symbol })
      else await addFavoriteStock({ userId, stockId: symbol })
      setIsFav((v) => !v)
    } catch { /* ignore */ } finally {
      setFavLoading(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading stock…" />
  if (error) return <ErrorBanner message={error} />
  if (!detail) return <ErrorBanner message={`Stock "${symbol}" not found`} />

  const livePrice = getMatchPrice(symbol ?? '') ?? detail.matchPrice
  const flashing = isRecentlyUpdated(symbol ?? '')
  const years = Object.keys(detail.yearData ?? {}).map(Number).sort((a, b) => b - a)
  const currentYearData: StockYearApiRecord = selectedYear
    ? yearDataCache[selectedYear] ?? (detail.yearData ?? {})[String(selectedYear)] ?? {}
    : {}

  const getSignal = (modelValue?: number | null) => {
    if (!modelValue || !livePrice) return null
    return livePrice > modelValue ? 'overvalued' : 'undervalued'
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button onClick={() => navigate(-1)} className="mt-1 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{symbol}</h1>
              <Badge variant="slate">{detail.sector}</Badge>
              <PriceTag price={livePrice} isFlashing={flashing} size="lg" />
              <button
                disabled={favLoading || !userId}
                onClick={() => void toggleFavorite()}
                className={`transition-colors ${isFav ? 'text-red-500 hover:text-red-700' : 'text-slate-300 hover:text-red-400'}`}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            {detail.stockName && <p className="text-sm text-slate-500 mt-0.5">{detail.stockName}</p>}
          </div>
        </div>

        <TabGroup tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'chart' && <VietstockIframe symbol={symbol} height={500} />}

        {activeTab === 'financials' && (
          <div className="flex flex-col gap-5">
            {years.length > 0 && (
              <div className="flex gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                      selectedYear === y ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            {detail.yearData && Object.keys(detail.yearData).length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Revenue & Income Overview</h3>
                <FinancialBarChart yearData={detail.yearData} />
              </div>
            )}

            {selectedYear && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Financial Data — {selectedYear}</h3>
                {yearLoading ? <LoadingSpinner size="sm" /> : (
                  <table className="w-full">
                    <tbody>
                      <FinRow label="Revenue" value={currentYearData.revenue} />
                      <FinRow label="Net Income" value={currentYearData.netIncome} />
                      <FinRow label="Total Equity" value={currentYearData.totalEquity} />
                      <FinRow label="Intangibles" value={currentYearData.intangibles} />
                      <FinRow label="Operating CF" value={currentYearData.operatingCashFlow} />
                      <FinRow label="Free CF" value={currentYearData.freeCashFlow} />
                      <FinRow label="Dividend/Share" value={currentYearData.dividendPerShare} />
                      <FinRow label="Shares Outstanding" value={currentYearData.sharesOutstanding} />
                      <FinRow label="Price End Year" value={currentYearData.priceEndYear} />
                      <FinRow label="Cost of Equity" value={currentYearData.costOfEquity} />
                      <FinRow label="WACC" value={currentYearData.wacc} />
                      <FinRow label="Dividend Growth" value={currentYearData.dividendGrowthRate} />
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'valuation' && (
          <div className="flex flex-col gap-5">
            {detail.yearData && Object.keys(detail.yearData).length > 0 ? (
              <>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Valuation Models Over Time</h3>
                  <ValuationLineChart yearData={detail.yearData} />
                </div>

                {selectedYear && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Valuation Signals</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'vs DDM', value: currentYearData.ddm },
                        { label: 'vs DCF', value: currentYearData.dcf },
                        { label: 'vs RI', value: currentYearData.ri },
                      ].map(({ label, value }) => {
                        const signal = getSignal(value)
                        return (
                          <div key={label} className="rounded-lg border border-slate-100 p-3">
                            <p className="text-xs text-slate-500 mb-1">{label}</p>
                            <p className="text-xs font-mono text-slate-700 mb-2">{value != null ? formatPrice(value) : '—'}</p>
                            {signal && (
                              <Badge variant={signal === 'overvalued' ? 'red' : 'emerald'}>{signal}</Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Stock vs Industry Ratios</h3>
                  <RatioCompareChart
                    pe={detail.peRatio} pb={detail.pbRatio} pcf={detail.pcfRatio} ps={detail.psRatio}
                    industryPe={detail.industryPeRatio} industryPb={detail.industryPbRatio}
                    industryPcf={detail.industryPcfRatio} industryPs={detail.industryPsRatio}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No valuation data available</p>
            )}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-56 shrink-0 flex flex-col gap-4">
        <StatCard label="P/E Ratio" value={formatRatio(detail.peRatio)} sub={`Industry: ${formatRatio(detail.industryPeRatio)}`} accent="blue" />
        <StatCard label="P/B Ratio" value={formatRatio(detail.pbRatio)} sub={`Industry: ${formatRatio(detail.industryPbRatio)}`} accent="emerald" />
        <StatCard label="P/CF Ratio" value={formatRatio(detail.pcfRatio)} sub={`Industry: ${formatRatio(detail.industryPcfRatio)}`} accent="amber" />
        <StatCard label="P/S Ratio" value={formatRatio(detail.psRatio)} sub={`Industry: ${formatRatio(detail.industryPsRatio)}`} accent="slate" />
      </div>
    </div>
  )
}

export default StockDetailPage
