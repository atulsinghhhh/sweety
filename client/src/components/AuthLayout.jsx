import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'
import { SLOT_META } from '@/components/slotMeta'
import ThemeToggle from '@/components/ThemeToggle'
import { SLOTS } from '@/lib/readings'

const POINTS = ['Four reading slots a day', 'Daily, month-to-date and monthly reports', 'Private to your account']

export default function AuthLayout({ title, description, children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_1.1fr]">
      <section className="relative isolate hidden flex-col justify-between gap-12 overflow-hidden bg-paper px-12 py-12 lg:flex xl:px-16">
        <span
          aria-hidden="true"
          className="absolute -right-32 -bottom-32 -z-10 size-[28rem] rounded-full bg-[linear-gradient(116deg,var(--seal),var(--seal-tan))] opacity-20"
        />
        <Link to="/" aria-label="Sweety home" className="self-start hover:no-underline">
          <Logo />
        </Link>
        <div className="max-w-md">
          <p className="eyebrow text-seal-ink">Blood glucose journal</p>
          <p className="mt-4 font-display text-display">
            Know your <em>numbers</em>.
          </p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-seal" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <ul aria-hidden="true" className="flex gap-2">
          {SLOTS.map((slot) => {
            const Icon = SLOT_META[slot.value].icon
            return (
              <li key={slot.value} className="inline-flex size-11 items-center justify-center rounded-full border border-taupe bg-background text-seal-ink">
                <Icon strokeWidth={1.5} className="size-[18px]" />
              </li>
            )
          })}
        </ul>
      </section>

      <section className="relative flex flex-col px-5 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Sweety home" className="hover:no-underline lg:invisible">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="animate-rise w-full max-w-sm">
            <h1 className="font-display text-heading-lg leading-tight">{title}</h1>
            {description && <p className="mt-3 text-muted-foreground">{description}</p>}
            <div className="mt-10">{children}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
