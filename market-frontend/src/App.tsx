import { Route, Routes } from 'react-router-dom'
import NavBar from './pages/NavBar'
import Stock from './pages/Stock'
import StockDetail from './pages/StockDetail'
import DashBoard from './pages/DashBoard'
import Profile from './pages/Profile'

function App() {
  return (
    <div className="flex h-screen bg-slate-950 p-8 text-white">
      <div className="flex h-full w-full gap-8">
        <div className="flex h-full items-center">
          <NavBar />
        </div>

        <main className="flex-1 overflow-hidden rounded-3xl bg-[#0f0f10] p-10">
          <Routes>
            <Route path="/" element={<DashBoard />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
