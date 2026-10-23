import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type RequireAuthProps = {
  children: React.ReactNode
}

function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return <div className="page-state">Checking session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return children
}

export default RequireAuth