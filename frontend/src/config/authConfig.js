import { LogLevel } from "@azure/msal-browser";

/**
 * Configuration object for Microsoft Authentication Library (MSAL)
 * Contains settings for authentication, caching, and system behavior
 */
export const msalConfig = {
  auth: {
    // Azure AD application (client) ID
    clientId: "1ce9a704-2e55-404c-8536-9f8df880d726",
    // Azure AD tenant authority URL
    authority:
      "https://login.microsoftonline.com/a4067d12-2fc0-4367-a213-9e4031cbc173",
    // URL to redirect after login
    redirectUri: "http://localhost:3000",
    // Whether to navigate to the original request URL after login
    navigateToLoginRequestUrl: true,
    // URL to redirect after logout
    postLogoutRedirectUri: "http://localhost:3000",
  },
  cache: {
    // Store tokens in session storage
    cacheLocation: "sessionStorage",
    // Don't use cookies for state management
    storeAuthStateInCookie: false,
  },
  system: {
    // Disable native broker (used for native apps)
    allowNativeBroker: false,
    loggerOptions: {
      // Custom logging callback to handle different log levels
      loggerCallback: (level, message, containsPii) => {
        // Skip logging if message contains personally identifiable information
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      // Set default logging level
      logLevel: LogLevel.Info,
      // Disable logging of PII data
      piiLoggingEnabled: false,
    },
  },
};

/**
 * Default login request configuration
 * Specifies the scopes (permissions) required for the application
 */
export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

/**
 * Microsoft Graph API configuration
 * Contains endpoints for accessing Microsoft Graph services
 */
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
