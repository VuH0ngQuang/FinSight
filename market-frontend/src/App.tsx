import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import LoginRegister from './pages/LoginRegister'
import Dashboard from './pages/Dashboard'
import StockScanner from './pages/StockScanner'
import StockDetailPage from './pages/StockDetail'
import PortfolioAllocator from './pages/PortfolioAllocator'
import ProfileSettings from './pages/ProfileSettings'
import Payment from './pages/Payment'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/stocks" element={<StockScanner />} />
          <Route path="/stocks/:symbol" element={<StockDetailPage />} />
          <Route path="/portfolio" element={<PortfolioAllocator />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
