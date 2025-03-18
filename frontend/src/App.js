import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Login from "./pages/Login";
import { AuthProviderSSO } from "./context/AuthContextSSO";
import CommissionsSummary from "./pages/CommissionsSummary";
import PaymentsControl from "./pages/PaymentsControl";
import CommissionsConfig from "./pages/CommissionsConfig";
import PrivateRoute from "./components/PrivateRoute";
import MonthlyCutSummary from "./pages/MonthlyCutSummary"; // NEW
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  spacing: 8, // Base spacing unit in pixels
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "6px 8px",
        },
        sizeSmall: {
          padding: "4px 6px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

function App({ msalInstance }) {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MsalProvider instance={msalInstance}>
          <LanguageProvider>
            <AuthProviderSSO>
              <AuthProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public: login */}
                    <Route path="/" element={<Login />} />

                    {/* Protected routes */}
                    <Route element={<PrivateRoute />}>
                      <Route
                        path="/commissions-config"
                        element={<CommissionsConfig />}
                      />
                      <Route
                        path="/commissions-summary"
                        element={<CommissionsSummary />}
                      />
                      <Route
                        path="/payments-control"
                        element={<PaymentsControl />}
                      />

                      {/* New route for monthly cut summary: /monthly-cut/2025/1 */}
                      <Route
                        path="/monthly-cut/:year/:month"
                        element={<MonthlyCutSummary />}
                      />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </AuthProvider>
            </AuthProviderSSO>
          </LanguageProvider>
        </MsalProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
