import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'dashboard' },
  { to: '/readings', label: 'readings' },
  { to: '/reports', label: 'reports' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { search } = useLocation()
  // Carry the selected ?date= across pages
  const date = new URLSearchParams(search).get('date')
  const withDate = (path) => (date ? `${path}?date=${date}` : path)

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-steel">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-33 gap-y-2 px-4 py-4 sm:h-66 sm:px-6 sm:py-0">
          <Link to={withDate('/dashboard')} className="text-heading-sm text-foreground lowercase hover:no-underline">
            sweety
          </Link>

          <div className="flex items-center gap-4 sm:order-last">
            <span className="hidden text-caption text-muted-foreground md:inline">{user?.email}</span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>

          <nav aria-label="Main" className="order-last flex w-full gap-22 sm:order-none sm:ml-auto sm:w-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={withDate(item.to)}
                className={({ isActive }) =>
                  cn(
                    'border-b py-1 text-body text-foreground hover:no-underline',
                    isActive ? 'border-ink' : 'border-transparent text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-33 sm:px-6 sm:py-66">
        <div className="animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>

      <footer className="bg-carbon text-on-carbon">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-2 px-4 py-33 text-caption sm:px-6">
          <span>sweety — blood glucose tracker</span>
          <span className="text-graphite">readings are for personal tracking, not medical advice</span>
        </div>
      </footer>
    </div>
  )
}
