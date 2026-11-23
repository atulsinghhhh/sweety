import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, CalendarDays, ClipboardList, Clock4, LayoutDashboard, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import DashboardPreview from '@/components/landing/DashboardPreview'
import Reveal from '@/components/landing/Reveal'
import { useAuth } from '@/hooks/useAuth'

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Simple blood glucose recording',
    text: 'Enter a reading in seconds: pick the date and time slot, type the value from your meter in mg/dL, and save.',
  },
  {
    icon: Clock4,
    title: 'Four daily reading slots',
    text: 'Morning (fasting), after breakfast, after lunch and after dinner — one reading per slot, so each day stays organised.',
  },
  {
    icon: CalendarDays,
    title: 'Daily reading history',
    text: 'Move between days to see exactly what you recorded, and correct or remove a reading whenever you need to.',
  },
  {
    icon: BarChart3,
    title: 'Daily and monthly reports',
    text: 'See the highest, lowest and average reading for a day, for the month so far, and for the whole previous month.',
  },
  {
    icon: LayoutDashboard,
    title: 'Personal dashboard',
    text: "Your day's summary and most recent readings in one place, with a quick way to add the next one.",
  },
  {
    icon: LockKeyhole,
    title: 'Secure individual accounts',
    text: 'Each account is private. Passwords are stored as secure hashes, and your readings are only ever visible to you.',
  },
]

const STEPS = [
  {
    title: 'Create an account',
    text: 'Register with your name, email and a password. It takes under a minute.',
  },
  {
    title: 'Record readings from your measurements',
    text: 'After you check your glucose with your own meter, add the value to the matching time slot.',
  },
  {
    title: 'Review your history and reports',
    text: 'Look back at any day, and see daily, month-to-date and monthly summaries of what you recorded.',
  },
]

const CURRENT_YEAR = new Date().getFullYear()

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
]

function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${className}`}>{children}</div>
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="max-w-2xl">
      <p className="text-caption text-leaf">{eyebrow}</p>
      <h2 className="mt-2 text-[30px] leading-[1.15] sm:text-heading-lg">{title}</h2>
      {text && <p className="mt-15 text-subheading text-muted-foreground">{text}</p>}
    </div>
  )
}

function LandingNav() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-steel bg-white/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-15">
        <Link to="/" aria-label="Sweety home" className="hover:no-underline">
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-body text-muted-foreground hover:text-foreground hover:no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>
          {user ? (
            <Button asChild>
              <Link to="/dashboard" className="hover:no-underline">
                Open dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login" className="text-foreground hover:no-underline">
                  Log in
                </Link>
              </Button>
              <Button asChild>
                <Link to="/register" className="text-primary-foreground hover:no-underline">
                  Get started
                </Link>
              </Button>
            </>
          )}
        </nav>
      </Container>
    </header>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <LandingNav />

      <main id="main">
        {/* Hero — clipped so the decorative backdrop never causes sideways scroll */}
        <section className="overflow-x-clip border-b border-steel">
          <Container className="grid items-center gap-33 py-33 sm:py-66 lg:grid-cols-[1fr_1.05fr] lg:gap-66">
            <Reveal>
              <p className="inline-flex items-center gap-2 border border-mint-line bg-mint px-2.5 py-1 text-caption text-leaf">
                Personal blood glucose tracker
              </p>
              <h1 className="mt-22 text-[38px] leading-[1.08] sm:text-[52px]">
                Understand your glucose. Track your progress.
              </h1>
              <p className="mt-22 max-w-xl text-subheading text-muted-foreground">
                Record your blood glucose readings, review your daily history and understand your measurements with a
                simple personal tracking dashboard.
              </p>
              <div className="mt-33 flex flex-wrap gap-15">
                <Button asChild size="lg" className="h-11 px-5">
                  <Link to="/register" className="text-primary-foreground hover:no-underline">
                    Get started <ArrowRight strokeWidth={1.25} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 px-5">
                  <Link to="/login" className="text-foreground hover:no-underline">
                    Sign in
                  </Link>
                </Button>
              </div>
              <p className="mt-15 text-caption text-muted-foreground">You enter readings yourself, from your own glucose meter.</p>
            </Reveal>

            <Reveal delay={150} className="relative">
              <div aria-hidden="true" className="absolute -inset-3 -z-10 bg-mint sm:-inset-5" />
              <DashboardPreview />
            </Reveal>
          </Container>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 py-66">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Features"
                title="Everything you need to keep a clear record."
                text="Sweety focuses on one job: making it easy to log your readings and look back at them."
              />
            </Reveal>
            <ul className="mt-33 grid gap-px border border-steel bg-steel sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                // The cell stays opaque while its content fades in, so the grid lines never flash grey
                <li key={feature.title} className="bg-white p-22 sm:p-33">
                  <Reveal delay={(index % 3) * 75}>
                    <span className="inline-flex size-10 items-center justify-center bg-mint text-leaf">
                      <feature.icon strokeWidth={1.25} className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-22 text-subheading">{feature.title}</h3>
                    <p className="mt-2 text-body text-muted-foreground">{feature.text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 border-y border-steel bg-canvas py-66">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="How it works" title="Three steps to a clearer picture." />
            </Reveal>
            <ol className="mt-33 grid gap-22 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <Reveal as="li" key={step.title} delay={index * 100} className="border-t border-ink pt-22">
                  <span className="text-heading-lg font-thin text-leaf tabular-nums">0{index + 1}</span>
                  <h3 className="mt-15 text-subheading">{step.title}</h3>
                  <p className="mt-2 text-body text-muted-foreground">{step.text}</p>
                </Reveal>
              ))}
            </ol>
          </Container>
        </section>

        {/* Final CTA */}
        <section className="py-66">
          <Container>
            <Reveal className="flex flex-col items-start gap-22 border border-mint-line bg-mint p-33 sm:p-66 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[30px] leading-[1.15] sm:text-heading-lg">Make tracking your readings simpler.</h2>
                <p className="mt-15 text-subheading text-muted-foreground">Create an account and add your first reading in a minute.</p>
              </div>
              <Button asChild size="lg" className="h-11 shrink-0 px-5">
                <Link to="/register" className="text-primary-foreground hover:no-underline">
                  Get started <ArrowRight strokeWidth={1.25} />
                </Link>
              </Button>
            </Reveal>
          </Container>
        </section>
      </main>

      <footer className="border-t border-steel">
        <Container className="grid gap-33 py-33 sm:py-66 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Logo />
            <p className="mt-15 max-w-md text-body text-muted-foreground">
              A simple personal tracker for recording blood glucose readings and reviewing your history.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-22 gap-y-2 text-body">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
              </li>
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground">Log in</Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground">How it works</a>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground">Create account</Link>
              </li>
            </ul>
          </nav>
          <div className="border-t border-steel pt-22 md:col-span-2">
            <p className="max-w-3xl text-caption text-muted-foreground">
              <strong className="font-light text-foreground">Medical disclaimer:</strong> Sweety is a personal record-keeping
              tool. It does not diagnose, treat or prevent any condition, and it does not provide medical advice. Always
              follow the guidance of your doctor or healthcare provider, and seek medical help immediately if you feel
              unwell.
            </p>
            <p className="mt-15 text-caption text-muted-foreground">© {CURRENT_YEAR} Sweety</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}
