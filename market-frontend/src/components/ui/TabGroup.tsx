import type { ReactNode } from 'react'

export interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabGroupProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

const TabGroup = ({ tabs, active, onChange }: TabGroupProps) => (
  <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          active === tab.id
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
        {tab.label}
      </button>
    ))}
  </div>
)

export default TabGroup
