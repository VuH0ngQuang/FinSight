import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CRITERIA_LABELS } from '../../utils/ahp'

const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#f59e0b', '#dc2626', '#06b6d4', '#ec4899']

const AhpWeightsBarChart = ({ weights }: { weights: number[] }) => {
  const data = CRITERIA_LABELS.map((label, i) => ({
    label,
    weight: weights[i] != null ? Math.round(weights[i] * 10000) / 100 : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
        <YAxis dataKey="label" type="category" tick={{ fontSize: 12, fill: '#64748b' }} width={40} />
        <Tooltip formatter={(v: unknown) => `${String(v)}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default AhpWeightsBarChart
