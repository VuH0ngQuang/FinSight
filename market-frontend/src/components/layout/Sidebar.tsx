import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getMqttConnectionStatus, subscribeToMqttStatus } from '../../services/mqtt'
import { useState, useEffect } from 'react'

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
  >
    <span className="h-5 w-5 shrink-0">{icon}</span>
    {label}
  </NavLink>
)

const Sidebar = () => {
  const { userId, isAdmin, logout } = useAuth()
  const [mqttConnected, setMqttConnected] = useState(getMqttConnectionStatus())

  useEffect(() => {
    return subscribeToMqttStatus(setMqttConnected)
  }, [])

  return (
    <aside className="flex h-full w-56 flex-col border-r border-slate-200 bg-white px-3 py-4">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">F</div>
        <span className="text-base font-bold text-slate-900">FinSight</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <NavItem to="/" label="Dashboard" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
        } />
        <NavItem to="/stocks" label="Stock Scanner" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        } />
        <NavItem to="/portfolio" label="Portfolio" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        } />
        <NavItem to="/payment" label="Pricing" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        } />
        <NavItem to="/subscriptions" label="Subscriptions" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        } />
        <NavItem to="/profile" label="Profile" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        } />
        {isAdmin && (
          <NavItem to="/admin" label="Admin" icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          } />
        )}
      </nav>

      <div className="border-t border-slate-100 pt-3 space-y-3">
        {/* MQTT status */}
        <div className="flex items-center gap-2 px-3 text-xs text-slate-500">
          <span className={`h-2 w-2 rounded-full ${mqttConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          {mqttConnected ? 'Live' : 'Offline'}
        </div>
        {userId ? (
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        ) : (
          <NavLink
            to="/login"
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in
          </NavLink>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
