import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";

/**
 * Context for handling Single Sign-On (SSO) authentication state
 * Provides functionality for Microsoft Azure AD authentication
 */
const AuthContextSSO = createContext(null);

/**
 * Provider component that wraps the app and makes SSO auth available to any
 * child component that calls useAuthSSO().
 */
export const AuthProviderSSO = ({ children }) => {
  const { instance, accounts } = useMsal();
  const [ssoUser, setSsoUser] = useState(null);
  const [isSSOAuthenticated, setIsSSOAuthenticated] = useState(false);

  // Effect to handle automatic sign-in when accounts exist
  useEffect(() => {
    if (accounts.length > 0) {
      setSsoUser(accounts[0]);
      setIsSSOAuthenticated(true);
    }
  }, [accounts]);

  /**
   * Initiates the SSO login process using a popup window
   * Updates the auth state with the user's account info on success
   */
  const loginSSO = useCallback(async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      setSsoUser(response.account);
      setIsSSOAuthenticated(true);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [instance]);

  /**
   * Handles SSO logout by clearing the auth state and redirecting
   * to the specified post-logout URL
   */
  const logoutSSO = useCallback(async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
      setSsoUser(null);
      setIsSSOAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }, [instance]);

  // Context value that will be provided to consumers
  const value = {
    ssoUser,
    isSSOAuthenticated,
    loginSSO,
    logoutSSO,
  };

  return (
    <AuthContextSSO.Provider value={value}>{children}</AuthContextSSO.Provider>
  );
};

/**
 * Hook that enables components to access the SSO auth context
 * Must be used within an AuthProviderSSO component
 */
export const useAuthSSO = () => {
  const context = useContext(AuthContextSSO);
  if (!context) {
    throw new Error("useAuthSSO must be used within an AuthProviderSSO");
  }
  return context;
};
