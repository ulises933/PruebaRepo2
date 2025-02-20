import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * PrivateRoute is used to protect routes that require a logged-in user.
 * If the user is not authenticated, it redirects to the login page.
 */
function PrivateRoute({ requiredRole }) {
  const { isAuthenticated, user } = useAuth()

  // If user is not logged in, redirect to '/'
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // If we require a specific role and user doesn't match, redirect or hide
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/commissions-summary" replace />
  }

  // Render child components if everything is valid
  return <Outlet />
}

export default PrivateRoute
