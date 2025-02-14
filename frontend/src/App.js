import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import ControlPagos from './pages/ControlPagos'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Rutas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/control-pagos" element={<ControlPagos />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
