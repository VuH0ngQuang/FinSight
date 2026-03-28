import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './ui/LoadingSpinner'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userId, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner fullScreen />
  if (!userId) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default ProtectedRoute
