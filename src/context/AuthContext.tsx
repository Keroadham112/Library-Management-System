import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { getCurrentUser, login as loginRequest } from '../services/authService'
import { clearAuthSession, getAuthToken, getAuthUser, setAuthSession } from '../services/authSession'
import type { AuthUser, LoginRequest } from '../types/auth'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isReady: boolean
  login: (payload: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const storedToken = getAuthToken()
    const storedUser = getAuthUser()

    async function bootstrapSession() {
      if (!storedToken || !storedUser) {
        clearAuthSession()
        setToken(null)
        setUser(null)
        setIsReady(true)
        return
      }

      try {
        await getCurrentUser()
        setToken(storedToken)
        setUser(storedUser)
      } catch {
        clearAuthSession()
        setToken(null)
        setUser(null)
      } finally {
        setIsReady(true)
      }
    }

    void bootstrapSession()
  }, [])

  async function login(payload: LoginRequest) {
    const response = await loginRequest(payload)
    setAuthSession(response.token, response.user)
    setToken(response.token)
    setUser(response.user)
  }

  function logout() {
    clearAuthSession()
    setToken(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isReady,
      login,
      logout,
    }),
    [isReady, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return context
}