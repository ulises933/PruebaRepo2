import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

import Login from './pages/Login'
import CommissionsSummary from './pages/CommissionsSummary'
import PaymentsControl from './pages/PaymentsControl'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public: login */}
            <Route path="/" element={<Login />} />

            {/* Protected Routes: require user to be logged in */}
            <Route element={<PrivateRoute />}>
              <Route path="/commissions-summary" element={<CommissionsSummary />} />
              <Route path="/payments-control" element={<PaymentsControl />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
