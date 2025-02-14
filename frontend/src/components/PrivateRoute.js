import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PrivateRoute({ requiredRole }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}

export default PrivateRoute
