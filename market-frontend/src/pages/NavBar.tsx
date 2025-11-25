import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'

type IconProps = {
  className?: string
}

const IconDashboard: ComponentType<IconProps> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h7v7H4zM13 4h7v5h-7zM13 13h7v7h-7zM4 13h7v5H4z" />
  </svg>
)

const IconStock: ComponentType<IconProps> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 9 12 13 16 20 9" />
    <polyline points="20 9 20 15 14 15" />
  </svg>
)

const IconBookmark: ComponentType<IconProps> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
)

const IconWallet: ComponentType<IconProps> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7h18v12H3z" />
    <path d="M3 7V5a2 2 0 0 1 2-2h13" />
    <path d="M16 12h2" />
  </svg>
)

const navItems: Array<{
  label: string
  icon: ComponentType<IconProps>
  to: string
}> = [
  { label: 'Dashboard', icon: IconDashboard, to: '/' },
  { label: 'Stock', icon: IconStock, to: '/stock' },
  { label: 'Favorite', icon: IconBookmark, to: '/favorite' },
  { label: 'Wallet', icon: IconWallet, to: '/wallet' },
]

const NavBar = () => {
  return (
    <nav className="h-full w-60 rounded-3xl bg-[#0f0f10] px-5 py-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
      <ul className="flex flex-col gap-3">
        {navItems.map(({ label, icon: Icon, to }) => (
          <li key={label}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-[0_15px_40px_rgba(255,255,255,0.18)]'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavBar