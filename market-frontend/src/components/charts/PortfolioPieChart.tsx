import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PortfolioAllocationItem } from '../../services/api/portfolioApi'

const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#f59e0b', '#dc2626', '#06b6d4', '#ec4899', '#84cc16']

const PortfolioPieChart = ({ allocations }: { allocations: PortfolioAllocationItem[] }) => {
  const data = allocations.map((a) => ({
    name: a.stockId,
    value: Math.round(a.allocationPercentage * 100) / 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={110}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name} ${value}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: unknown) => `${String(v)}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default PortfolioPieChart
