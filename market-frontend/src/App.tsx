import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WatchlistProvider } from './contexts/WatchlistContext'
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
import Checkout from './pages/Checkout'
import AdminPanel from './pages/AdminPanel'
import SubscriptionHistory from './pages/SubscriptionHistory'

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
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
          <Route path="/payment/checkout" element={<Checkout />} />
          <Route path="/subscriptions" element={<SubscriptionHistory />} />
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
      </WatchlistProvider>
    </AuthProvider>
  )
}

export default App
