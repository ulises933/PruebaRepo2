import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

import Login from "./pages/Login";
import CommissionsSummary from "./pages/CommissionsSummary";
import PaymentsControl from "./pages/PaymentsControl";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProviderSSO } from "./context/AuthContextSSO";

/**
 * App sets up routing and contexts for authentication and language.
 * PrivateRoute ensures certain pages are accessible only if logged in.
 */
function App({ msalInstance }) {
  return (
    <MsalProvider instance={msalInstance}>
      <LanguageProvider>
        <AuthProviderSSO>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Route: Login */}
                <Route path="/" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route
                    path="/commissions-summary"
                    element={<CommissionsSummary />}
                  />
                  <Route
                    path="/payments-control"
                    element={<PaymentsControl />}
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </AuthProviderSSO>
      </LanguageProvider>
    </MsalProvider>
  );
}

export default App;
