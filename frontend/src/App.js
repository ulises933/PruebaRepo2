import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Login from './pages/Login'
import CommissionsSummary from './pages/CommissionsSummary'
import PaymentsControl from './pages/PaymentsControl'
import PrivateRoute from './components/PrivateRoute'
import MonthlyCutSummary from './pages/MonthlyCutSummary' // NEW

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public: login */}
            <Route path="/" element={<Login />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/commissions-summary" element={<CommissionsSummary />} />
              <Route path="/payments-control" element={<PaymentsControl />} />

              {/* New route for monthly cut summary: /monthly-cut/2025/1 */}
              <Route path="/monthly-cut/:year/:month" element={<MonthlyCutSummary />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
