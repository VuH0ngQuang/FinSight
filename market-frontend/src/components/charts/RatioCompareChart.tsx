import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RatioCompareChartProps {
  pe: number
  pb: number
  pcf: number
  ps: number
  industryPe: number
  industryPb: number
  industryPcf: number
  industryPs: number
}

const RatioCompareChart = ({ pe, pb, pcf, ps, industryPe, industryPb, industryPcf, industryPs }: RatioCompareChartProps) => {
  const data = [
    { ratio: 'P/E', Stock: pe, Industry: industryPe },
    { ratio: 'P/B', Stock: pb, Industry: industryPb },
    { ratio: 'P/CF', Stock: pcf, Industry: industryPcf },
    { ratio: 'P/S', Stock: ps, Industry: industryPs },
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="ratio" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} width={40} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          formatter={(v: unknown) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Stock" fill="#2563eb" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Industry" fill="#94a3b8" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RatioCompareChart
