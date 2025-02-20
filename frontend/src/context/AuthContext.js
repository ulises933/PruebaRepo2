import { createContext, useContext, useState, useEffect } from 'react'

/**
 * AuthContext handles user authentication at a global level,
 * storing user info in local storage to persist sessions across page reloads.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // On first load, try to read the user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Logs user in and stores the user data in local storage
  function login(userData) {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Logs out the user and clears local storage
  function logout() {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
