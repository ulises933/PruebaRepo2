import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { loginApi } from '../services/authService'
import { useLanguage } from '../context/LanguageContext'

/**
 * Login page allows the user to enter credentials.
 * It consumes the /login endpoint from the backend and stores the user session.
 */
function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      // Business: Validate credentials with the backend.
      const data = await loginApi(username, password)
      // If successful, store the user data in the AuthContext.
      login(data)
      // Technical: Navigate to the main page after login.
      navigate('/commissions-summary')
    } catch {
      alert('Invalid credentials')
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
          {t('loginTitle')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column">
          <TextField
            variant="outlined"
            label={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            label={t('password')}
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
            {t('loginButton')}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default Login
