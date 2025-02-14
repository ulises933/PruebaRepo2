import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Layout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#002B3B' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            DEACERO - Comisiones
          </Typography>
          <Button component={Link} to="/home" sx={{ color: '#fff' }}>
            Resumen de comisiones
          </Button>
          <Button component={Link} to="/control-pagos" sx={{ color: '#fff' }}>
            Control de pagos
          </Button>
          <Button onClick={handleLogout} sx={{ color: '#fff' }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5' }}>{children}</Box>
    </Box>
  )
}

export default Layout
