import { Route, Routes, Outlet } from 'react-router-dom'
import NavBar from './pages/NavBar'
import Stock2 from './pages/Stock2'
import StockDetail2 from './pages/StockDetail2'
import DashBoard2 from './pages/DashBoard2'
import Profile from './pages/Profile'
import Login from './pages/Login'

const MainLayout = () => (
  <div className="flex h-screen bg-slate-950 p-8 text-white">
    <div className="flex h-full w-full gap-8">
      <div className="flex h-full items-center">
        <NavBar />
      </div>

      <main className="flex-1 overflow-hidden rounded-3xl bg-[#0f0f10] p-10">
        <Outlet />
      </main>
    </div>
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<DashBoard2 />} />
        <Route path="/stock" element={<Stock2 />} />
        <Route path="/stock/:symbol" element={<StockDetail2 />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
