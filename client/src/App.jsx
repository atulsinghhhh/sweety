import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import AppLayout from '@/components/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/RouteGuards'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ReadingsPage from '@/pages/ReadingsPage'
import RegisterPage from '@/pages/RegisterPage'
import ReportsPage from '@/pages/ReportsPage'

// The landing page (and the Motion animation library it uses) is a separate
// chunk, so signed-in app pages never download it.
const LandingPage = lazy(() => import('@/pages/LandingPage'))

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
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
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
