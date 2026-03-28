import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './ui/LoadingSpinner'

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { userId, isAdmin, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner fullScreen />
  if (!userId) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default AdminRoute
