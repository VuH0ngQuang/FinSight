import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  accent?: 'blue' | 'emerald' | 'red' | 'amber' | 'slate'
  icon?: ReactNode
}

const accentRing: Record<string, string> = {
  blue: 'ring-blue-100',
  emerald: 'ring-emerald-100',
  red: 'ring-red-100',
  amber: 'ring-amber-100',
  slate: 'ring-slate-100',
}

const accentIcon: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
}

const StatCard = ({ label, value, sub, accent = 'blue', icon }: StatCardProps) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ${accentRing[accent]}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
        <div className="text-2xl font-bold text-slate-900 truncate">{value}</div>
        {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
      </div>
      {icon && (
        <div className={`ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentIcon[accent]}`}>
          {icon}
        </div>
      )}
    </div>
  </div>
)

export default StatCard
