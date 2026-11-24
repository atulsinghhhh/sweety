import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import AppLayout from '@/components/AppLayout'
import FullPageLoader from '@/components/FullPageLoader'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/RouteGuards'
import { AuthProvider } from '@/context/AuthProvider'
import { ThemeProvider } from '@/context/ThemeProvider'
import NotFoundPage from '@/pages/NotFoundPage'

// Every page is its own chunk, so a visitor only downloads the screens they open.
// The landing page also keeps the Motion animation library out of the app pages.
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ReadingsPage = lazy(() => import('@/pages/ReadingsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<FullPageLoader />}>
            <Routes>
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/readings" element={<ReadingsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>
              </Route>
              {/* Public marketing page — visible to everyone, signed in or not */}
              <Route
                path="/"
                element={
                  <Suspense fallback={<div className="min-h-svh bg-surface" />}>
                    <LandingPage />
                  </Suspense>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
