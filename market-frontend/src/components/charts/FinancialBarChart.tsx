import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { StockYearApiRecord } from '../../services/stockDetail'

interface FinancialBarChartProps {
  yearData: Record<string, StockYearApiRecord>
}

const fmt = (v: number) => {
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  return v.toFixed(0)
}

const FinancialBarChart = ({ yearData }: FinancialBarChartProps) => {
  const data = Object.entries(yearData)
    .map(([year, d]) => ({
      year,
      Revenue: d.revenue ?? null,
      'Net Income': d.netIncome ?? null,
      'Op. CF': d.operatingCashFlow ?? null,
      FCF: d.freeCashFlow ?? null,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year))

  if (data.length === 0) return <p className="text-sm text-slate-400 text-center py-8">No financial data</p>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#64748b' }} width={60} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          formatter={(v: unknown) => typeof v === 'number' ? fmt(v) : String(v)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Revenue" fill="#2563eb" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Net Income" fill="#16a34a" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Op. CF" fill="#9333ea" radius={[3, 3, 0, 0]} />
        <Bar dataKey="FCF" fill="#f59e0b" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default FinancialBarChart
