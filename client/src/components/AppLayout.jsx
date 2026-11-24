import { Suspense } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { BarChart3, LayoutDashboard, ListChecks, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/readings', label: 'Readings', icon: ListChecks },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { pathname, search } = useLocation()
  // Carry the selected ?date= across pages
  const date = new URLSearchParams(search).get('date')
  const withDate = (path) => (date ? `${path}?date=${date}` : path)

  const nav = (
    <nav aria-label="Main" className="flex rounded-full border border-border bg-paper p-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={withDate(item.to)}
          className={({ isActive }) =>
            cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:no-underline',
              isActive ? 'bg-background text-seal-ink shadow-glow' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          <item.icon strokeWidth={1.75} className="size-4" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-8">
          <Link to={withDate('/dashboard')} aria-label="Sweety dashboard" className="hover:no-underline">
            <Logo />
          </Link>

          <div className="hidden md:block">{nav}</div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <div className="ml-1 hidden items-center gap-3 lg:flex">
              <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-full bg-seal-soft text-[13px] font-semibold text-seal-ink"
              >
                {initials(user?.name)}
              </span>
              <div className="max-w-44 leading-tight">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-[12px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="ml-1">
              <LogOut strokeWidth={1.75} /> Log out
            </Button>
          </div>
        </div>
        <div className="border-t border-border px-4 py-2 md:hidden">{nav}</div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 sm:px-8 sm:py-14">
        {/* Keyed by route so each page eases in; the header stays put while its chunk loads */}
        <div key={pathname}>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-8 text-[13px] text-muted-foreground sm:px-8">
          <Logo className="text-[20px]" markClassName="size-5" />
          <span>Readings are for personal tracking, not medical advice.</span>
        </div>
      </footer>
    </div>
  )
}
