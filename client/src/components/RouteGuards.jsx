import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import FullPageLoader from './FullPageLoader'

export function ProtectedRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullPageLoader />
  if (user) {
    // After logging in, return to the page that sent the user to /login
    const from = location.state?.from
    return <Navigate to={from ? `${from.pathname}${from.search}` : '/dashboard'} replace />
  }
  return <Outlet />
}
