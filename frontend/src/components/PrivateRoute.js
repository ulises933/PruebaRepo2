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

  //Remove this later
  console.log("isAuthenticated", isAuthenticated);
  console.log("isSSOAuthenticated", isSSOAuthenticated);

  // Check if user is authenticated either through regular login or SSO
  const isUserAuthenticated = isAuthenticated || isSSOAuthenticated;
  const activeUser = isAuthenticated
    ? user
    : isSSOAuthenticated
    ? ssoUser
    : null;

  // If user is not logged in through either method, redirect to '/'
  if (!isUserAuthenticated && !isSSOAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If we require a specific role and user doesn't match, redirect or hide
  if (requiredRole) {
    // For regular login, check user role
    if (isAuthenticated && user?.role !== requiredRole) {
      return <Navigate to="/commissions-summary" replace />;
    }
    // For SSO login, check ssoUser role
    if (isSSOAuthenticated && ssoUser?.role !== requiredRole) {
      return <Navigate to="/commissions-summary" replace />;
    }
  }

  // Render child components if everything is valid
  return <Outlet />;
}

export default PrivateRoute;
