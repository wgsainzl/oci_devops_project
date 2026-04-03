/**
 * provides authentication state to app
 * handles two-step Oracle sign-in flow:
     1. Email, password  →  receives 2FA challenge token from backend
     2. 2FA code          →  receives session cookie and user object
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { authAPI } from '../API'
import { mockAuthAPI } from '../mocks'
import type { SignInResponse, User, UserRole } from '../types'

// Use mock API if VITE_USE_MOCKS=true
const API = import.meta.env.VITE_USE_MOCKS ? mockAuthAPI : authAPI

// context shape
interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  /*
  * returns challengeToken or user and token  
  */
  signIn: (email: string, password: string) => Promise<SignInResponse>
  /*
  * complete 2FA, sets user in state 
  */
  verify2FA: (challengeToken: string, code: string) => Promise<User>
  signOut: () => Promise<void>
  // RBAC helpers
  isAdmin: boolean
  isManager: boolean   // true for both ADMIN / MANAGER roles
  isDeveloper: boolean
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResponse> => {
      setLoading(true)
      setError(null)
      try {
        const res = await API.signIn(email, password)
        const data = res.data
        if ('user' in data && data.user) {
          const userData = data.user as User
          if (data.token) localStorage.setItem('auth_token', data.token as string)
          setUser(userData)
        }
        return data
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Incorrect email or password'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // 2FA verification
  const verify2FA = useCallback(
    async (challengeToken: string, code: string): Promise<User> => {
      setLoading(true)
      setError(null)
      try {
        const res = await API.verify2FA(challengeToken, code)
        const { user: userData, token } = res.data
        if (token) localStorage.setItem('auth_token', token)
        setUser(userData)
        return userData
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Invalid authentication code'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await API.signOut()
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
    }
  }, [])

  const hasRole = useCallback(
    (role: UserRole): boolean => user?.role === role,
    [user],
  )

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signIn,
    verify2FA,
    signOut,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'ADMIN' || user?.role === 'MANAGER',
    isDeveloper: user?.role === 'DEVELOPER',
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/*
* hook to throw if used outside AuthProvider 
*/
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}