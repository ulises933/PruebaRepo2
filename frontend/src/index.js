import React from "react";
import ReactDOM from "react-dom/client";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import App from "./App";
import "./index.css";
import { msalConfig } from "./config/authConfig";

/**
 * Entry point of the React application.
 * It renders the main <App /> component into the #root element.
 */

// Initialize MSAL outside of the component tree
const msalInstance = new PublicClientApplication({
  ...msalConfig,
  // Ensure the instance is initialized before use
  system: {
    ...msalConfig.system,
    allowNativeBroker: false,
    loggerOptions: {
      ...msalConfig.system?.loggerOptions,
      piiLoggingEnabled: false,
    },
  },
});

// Handle the response from auth redirects/popups
msalInstance.initialize().then(() => {
  // Optional - This will update account state if a user signs in from another tab or window
  msalInstance.enableAccountStorageEvents();

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      const account = event.payload.account;
      msalInstance.setActiveAccount(account);
    }
  });
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MsalProvider instance={msalInstance}>
    <App msalInstance={msalInstance} />
  </MsalProvider>
);
