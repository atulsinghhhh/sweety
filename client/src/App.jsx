import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import AppLayout from '@/components/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/RouteGuards'
import { AuthProvider } from '@/context/AuthContext'
import DashboardPage from '@/pages/DashboardPage'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ReadingsPage from '@/pages/ReadingsPage'
import RegisterPage from '@/pages/RegisterPage'
import ReportsPage from '@/pages/ReportsPage'

export default function App() {
  return (
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
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}
