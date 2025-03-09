import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from "../config/authConfig";
import appConfig from "../config/appConfig";
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
  const [legacyUserInfo, setLegacyUserInfo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize MSAL instance
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await instance.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize MSAL:", error);
      }
    };

    initializeMsal();
  }, [instance]);

  // Handle storage events for cross-tab synchronization
  useEffect(() => {
    if (!isInitialized) return;

    const handleStorageChange = (event) => {
      if (event.key === "msal.account.keys") {
        initializeAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isInitialized]);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    if (!isInitialized) return;

    if (accounts.length > 0) {
      try {
        const account = accounts[0];
        setSsoUser(account);

        try {
          // Try silent token acquisition first
          const tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account: account,
          });

          // Validate token with backend
          const userInfo = await validateTokenAndGetUserInfo(
            tokenResponse.accessToken
          );
          if (userInfo) {
            setIsSSOAuthenticated(true);
            localStorage.setItem(
              "ssoAuthState",
              JSON.stringify({
                isAuthenticated: true,
                account: account,
                userInfo: userInfo,
              })
            );
          }
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            // Silent token acquisition failed - user needs to login interactively
            console.log(
              "Silent token acquisition failed, need interactive login"
            );
            handleAuthError();
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        handleAuthError();
      }
    } else {
      handleAuthError();
    }
  }, [accounts, instance, isInitialized]);

  const handleAuthError = () => {
    setIsSSOAuthenticated(false);
    setSsoUser(null);
    setLegacyUserInfo(null);
    localStorage.removeItem("ssoAuthState");
  };

  // Effect to handle automatic sign-in and token validation
  useEffect(() => {
    if (!isInitialized) return;

    // Try to restore auth state from localStorage
    const storedAuthState = localStorage.getItem("ssoAuthState");
    if (storedAuthState) {
      const authState = JSON.parse(storedAuthState);
      setSsoUser(authState.account);
      setIsSSOAuthenticated(authState.isAuthenticated);
      setLegacyUserInfo(authState.userInfo?.legacy_info);
    }

    initializeAuth();
  }, [initializeAuth, isInitialized]);

  // Validate token and get user info from backend
  const validateTokenAndGetUserInfo = useCallback(async (accessToken) => {
    try {
      const response = await fetch(
        `${appConfig.apiBaseUrl}/validate_sso_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: accessToken }),
        }
      );

      if (!response.ok) {
        throw new Error("Token validation failed");
      }

      const data = await response.json();

      if (data.data.returnData) {
        setLegacyUserInfo(data.data.returnData);
        return data.data.returnData;
      }
      return null;
    } catch (error) {
      console.error("Error validating token:", error);
      throw error;
    }
  }, []);

  /**
   * Initiates the SSO login process using a popup window
   * Updates the auth state with the user's account info on success
   */
  const loginSSO = useCallback(async () => {
    if (!isInitialized) {
      throw new Error("MSAL not initialized");
    }

    try {
      const response = await instance.loginPopup(loginRequest);
      setSsoUser(response.account);

      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: response.account,
        });

        const userInfo = await validateTokenAndGetUserInfo(
          tokenResponse.accessToken
        );
        if (userInfo) {
          setIsSSOAuthenticated(true);
          localStorage.setItem(
            "ssoAuthState",
            JSON.stringify({
              isAuthenticated: true,
              account: response.account,
              userInfo: userInfo,
            })
          );
        }
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          // If silent token acquisition fails, try interactive
          const tokenResponse = await instance.acquireTokenPopup(loginRequest);
          const userInfo = await validateTokenAndGetUserInfo(
            tokenResponse.accessToken
          );
          if (userInfo) {
            setIsSSOAuthenticated(true);
            localStorage.setItem(
              "ssoAuthState",
              JSON.stringify({
                isAuthenticated: true,
                account: response.account,
                userInfo: userInfo,
              })
            );
          }
        } else {
          throw error;
        }
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      handleAuthError();
      throw error;
    }
  }, [instance, validateTokenAndGetUserInfo, isInitialized]);

  /**
   * Handles SSO logout by clearing the auth state and redirecting
   * to the specified post-logout URL without confirmation
   */
  const logoutSSO = useCallback(async () => {
    try {
      handleAuthError(); // Clear state before redirect
      await instance.logout();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }, [instance]);

  // Context value that will be provided to consumers
  const value = {
    ssoUser,
    isSSOAuthenticated,
    legacyUserInfo,
    loginSSO,
    logoutSSO,
    isInitialized,
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
