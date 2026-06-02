import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { startMqttConnection } from '../../services/mqtt'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/stocks': 'Stock Scanner',
  '/portfolio': 'Portfolio Allocator',
  '/profile': 'Profile & Settings',
  '/payment': 'Pricing',
  '/admin': 'Admin Panel',
}

const AppShell = () => {
  const location = useLocation()
  const pathBase = '/' + location.pathname.split('/')[1]
  const title = PAGE_TITLES[pathBase] ?? 'FinSight'

  useEffect(() => {
    return startMqttConnection()
  }, [])

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
