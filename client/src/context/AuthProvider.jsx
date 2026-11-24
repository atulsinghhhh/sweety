import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import api, { setUnauthorizedHandler, tokenStore } from '@/lib/api'
import { AuthContext } from '@/context/AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // With a stored token we must confirm it with the API before rendering routes
  const [initializing, setInitializing] = useState(() => Boolean(tokenStore.get()))

  useEffect(() => {
    if (!tokenStore.get()) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setInitializing(false))
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear()
      setUser((current) => {
        if (current) toast('Your session has expired. Please log in again.')
        return null
      })
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const startSession = useCallback(({ user: nextUser, token }) => {
    tokenStore.set(token)
    setUser(nextUser)
  }, [])

  const login = useCallback(
    async (credentials) => startSession((await api.post('/auth/login', credentials)).data),
    [startSession],
  )

  const register = useCallback(
    async (details) => startSession((await api.post('/auth/register', details)).data),
    [startSession],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
