import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { loginApi } from '../services/authService'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const data = await loginApi(username, password)
      login(data)
      navigate('/home')
    } catch {
      alert('Credenciales inválidas')
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ p: 4, width: 320 }}>
        <Typography variant="h5" mb={2} align="center" sx={{ fontWeight: 'bold' }}>
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column">
          <TextField
            variant="outlined"
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            type="submit"
            sx={{ backgroundColor: '#F15A2B', fontWeight: 'bold' }}
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default Login
