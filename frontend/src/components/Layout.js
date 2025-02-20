import { AppBar, Box, Button, Toolbar, Typography, FormControl, Select, MenuItem } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

/**
 * Layout provides a common navigation bar and wraps the page content.
 * This also includes a language switcher and logout functionality.
 */
function Layout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { language, switchLanguage, t } = useLanguage()

  function handleLogout() {
    logout()
    navigate('/')
  }

  // Handle language switch for future translations
  function handleLanguageChange(event) {
    switchLanguage(event.target.value)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#002B3B' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Business: DEACERO brand or project name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              DEACERO - {t('navCommissionsSummary')}
            </Typography>
            {/* Navigation Buttons */}
            <Button component={Link} to="/commissions-summary" sx={{ color: '#fff' }}>
              {t('navCommissionsSummary')}
            </Button>
            <Button component={Link} to="/payments-control" sx={{ color: '#fff' }}>
              {t('navPaymentsControl')}
            </Button>
          </Box>

          {/* Language Switch & Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl variant="standard" sx={{ color: '#fff' }}>
              <Select
                value={language}
                onChange={handleLanguageChange}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="en">EN</MenuItem>
                <MenuItem value="es">ES</MenuItem>
              </Select>
            </FormControl>
            <Button onClick={handleLogout} sx={{ color: '#fff' }}>
              {t('logout')}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Main Content Area */}
      <Box sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5' }}>{children}</Box>
    </Box>
  )
}

export default Layout
