import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

// Temporary landing page for Milestone 1 — confirms the client can reach the API.
function FoundationCheck() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    api
      .get('/health')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('down'))
  }, [])

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sweety</CardTitle>
          <CardDescription>Blood Glucose Tracker</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          API status: <span className="font-medium text-foreground">{status}</span>
        </CardContent>
      </Card>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<FoundationCheck />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}
