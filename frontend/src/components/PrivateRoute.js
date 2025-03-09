import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthSSO } from "../context/AuthContextSSO";

/**
 * PrivateRoute is used to protect routes that require a logged-in user.
 * If the user is not authenticated via regular login or SSO, it redirects to the login page.
 */
function PrivateRoute({ requiredRole }) {
  const { isAuthenticated, user } = useAuth();
  const { isSSOAuthenticated, ssoUser } = useAuthSSO();

  // Check if user is authenticated either through regular login or SSO
  const isUserAuthenticated = isAuthenticated || isSSOAuthenticated;
  const activeUser = isAuthenticated ? user : ssoUser;

  // If user is not authenticated at all, redirect to login
  if (!isUserAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If we require a specific role and user doesn't match, redirect
  if (requiredRole && activeUser?.role !== requiredRole) {
    return <Navigate to="/commissions-summary" replace />;
  }

  // Render child components if everything is valid
  return <Outlet />;
}

export default PrivateRoute;
