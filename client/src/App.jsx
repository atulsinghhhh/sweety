import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import api from '@/lib/api'

// Temporary landing page for Milestone 1 — confirms the client can reach the API
// and previews the design system. Replaced by real pages in Milestone 3.
function FoundationCheck() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    api
      .get('/health')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('unreachable'))
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-steel">
        <div className="mx-auto flex h-66 max-w-[1200px] items-center justify-between px-6">
          <span className="text-heading-sm font-light lowercase">sweety</span>
          <span className="text-caption text-muted-foreground">blood glucose tracker</span>
        </div>
      </header>

      <section className="bg-carbon text-canvas">
        <div className="mx-auto max-w-[1200px] px-6 py-66">
          <h1 className="text-heading-lg font-light">Know your numbers.</h1>
          <p className="mt-15 max-w-md text-caption text-graphite">
            Record up to four readings a day and review daily, month-to-date and monthly reports.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-66">
        <dl className="grid grid-cols-1 border-t border-ink sm:grid-cols-3">
          <div className="border-b border-steel py-22 sm:border-r sm:pr-22">
            <dt className="text-caption text-muted-foreground">api status</dt>
            <dd className="mt-1 text-heading-lg font-thin">{status}</dd>
          </div>
          <div className="border-b border-steel py-22 sm:border-r sm:px-22">
            <dt className="text-caption text-muted-foreground">reading slots</dt>
            <dd className="mt-1 text-heading-lg font-thin">4</dd>
          </div>
          <div className="border-b border-steel py-22 sm:pl-22">
            <dt className="text-caption text-muted-foreground">range</dt>
            <dd className="mt-1 text-heading-lg font-thin">
              40–600 <span className="text-caption font-light">mg/dL</span>
            </dd>
          </div>
        </dl>
      </main>

      <footer className="bg-carbon text-canvas">
        <div className="mx-auto max-w-[1200px] px-6 py-33 text-caption">sweety — milestone 1 foundation</div>
      </footer>
    </div>
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
