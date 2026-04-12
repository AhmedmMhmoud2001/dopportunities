import { createContext, useCallback, useContext, useMemo } from 'react'
import { apiRequest } from '../lib/api'
import { useLocalStorage } from '../hooks/use_local_storage'

const AuthContext = createContext(null)

const TOKEN_KEY = 'tem-dashboard:token'
const USER_KEY = 'tem-dashboard:user'

export function AuthProvider({ children }) {
  const [token, setToken] = useLocalStorage(TOKEN_KEY, null)
  const [user, setUser] = useLocalStorage(USER_KEY, null)

  const signIn = useCallback(
    async ({ email, password }) => {
      const data = await apiRequest('/v1/auth/signin', {
        method: 'POST',
        body: { email, password },
      })
      setToken(data.token)
      setUser(data.user)
      return data
    },
    [setToken, setUser],
  )

  const signOut = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [setToken, setUser])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthed: Boolean(token),
      signIn,
      signOut,
    }),
    [token, user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  // During Vite Fast Refresh/HMR, React can briefly render with a mismatched module graph.
  // Returning a safe fallback prevents a full app crash.
  if (!ctx) {
    return {
      token: null,
      user: null,
      isAuthed: false,
      signIn: async () => {
        throw new Error('AuthProvider not mounted yet')
      },
      signOut: () => {},
    }
  }
  return ctx
}

