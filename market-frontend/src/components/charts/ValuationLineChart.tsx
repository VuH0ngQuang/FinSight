import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { StockYearApiRecord } from '../../services/stockDetail'

interface ValuationLineChartProps {
  yearData: Record<string, StockYearApiRecord>
}

const LINES = [
  { key: 'ddm', name: 'DDM', color: '#2563eb' },
  { key: 'dcf', name: 'DCF', color: '#16a34a' },
  { key: 'ri', name: 'RI', color: '#9333ea' },
  { key: 'priceEndYear', name: 'Price', color: '#dc2626' },
]

const ValuationLineChart = ({ yearData }: ValuationLineChartProps) => {
  const data = Object.entries(yearData)
    .map(([year, d]) => ({
      year,
      ddm: d.ddm ?? null,
      dcf: d.dcf ?? null,
      ri: d.ri ?? null,
      priceEndYear: d.priceEndYear ?? null,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year))

  if (data.length === 0) return <p className="text-sm text-slate-400 text-center py-8">No valuation data</p>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} width={60} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          formatter={(v: unknown) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {LINES.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default ValuationLineChart
