import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCurrentUser, loginUser, registerUser } from '../api/authApi'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ascendra_token'
const USER_KEY = 'ascendra_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  const persistAuth = useCallback((authUser, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const signup = useCallback(
    async (payload) => {
      const response = await registerUser(payload)
      persistAuth(response.data.user, response.data.token)
      return response
    },
    [persistAuth]
  )

  const login = useCallback(
    async (payload) => {
      const response = await loginUser(payload)
      persistAuth(response.data.user, response.data.token)
      return response
    },
    [persistAuth]
  )

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const updateUser = useCallback((authUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      setLoading(false)
      return
    }

    fetchCurrentUser()
      .then((response) => {
        setUser(response.data.user)
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user))
      })
      .catch(() => {
        clearAuth()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [clearAuth])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      signup,
      login,
      logout,
      updateUser,
    }),
    [user, loading, signup, login, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
