import { Route, Routes } from 'react-router-dom'
import NavBar from './pages/NavBar'
import Stock from './pages/Stock'

const Dashboard = () => (
  <section className="space-y-4">
    <p className="text-sm text-slate-400">Welcome back 👋</p>
    <h1 className="text-3xl font-semibold text-white">Dashboard Overview</h1>
    <p className="text-slate-300">
      Replace this placeholder with real dashboard widgets.
    </p>
  </section>
)

const Favorite = () => (
  <section>
    <h1 className="text-2xl text-white">Favorite Assets</h1>
    <p className="text-slate-300">Coming soon.</p>
  </section>
)

const Wallet = () => (
  <section>
    <h1 className="text-2xl font-semibold text-white">Wallet</h1>
    <p className="text-slate-300">Track balances here.</p>
  </section>
)

function App() {
  return (
    <div className="flex h-screen bg-slate-950 p-8 text-white">
      <div className="flex h-full w-full gap-8">
        <div className="flex h-full items-center">
          <NavBar />
        </div>

        <main className="flex-1 overflow-hidden rounded-3xl bg-[#0f0f10] p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/favorite" element={<Favorite />} />
            <Route path="/wallet" element={<Wallet />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
