import { Link } from 'react-router-dom'
import { LazyMotion, MotionConfig, domAnimation, m } from 'motion/react'
import { ArrowRight, BarChart3, CalendarDays, ClipboardList, Clock4, LayoutDashboard, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import DashboardPreview from '@/components/landing/DashboardPreview'
import { DURATION, EASE, fadeUp, inView, stagger, withDelay } from '@/components/landing/motion'
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

// Micro-interactions are plain CSS transitions (no JS per hover): a slight
// press on tap and an arrow nudge on hover. motion-safe skips them for users
// who prefer reduced motion.
const PRESS = 'motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-[0.98]'
const ARROW = 'motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/cta:translate-x-0.5'

function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${className}`}>{children}</div>
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <m.div variants={stagger(0, 0.06)} {...inView} className="max-w-2xl">
      <m.p variants={fadeUp} className="text-caption text-leaf">
        {eyebrow}
      </m.p>
      <m.h2 variants={fadeUp} className="mt-2 text-[30px] leading-[1.15] sm:text-heading-lg">
        {title}
      </m.h2>
      {text && (
        <m.p variants={fadeUp} className="mt-15 text-subheading text-muted-foreground">
          {text}
        </m.p>
      )}
    </m.div>
  )
}

function CtaButton({ to, children, variant, className = '' }) {
  return (
    <Button asChild size="lg" variant={variant} className={`group/cta h-11 px-5 ${PRESS} ${className}`}>
      <Link to={to} className={`${variant === 'outline' ? 'text-foreground' : 'text-primary-foreground'} hover:no-underline`}>
        {children}
      </Link>
    </Button>
  )
}

function LandingNav() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-steel bg-surface/95 backdrop-blur-sm">
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
                // Hairline underline that grows from the left on hover/focus
                className="relative px-3 py-2 text-body text-muted-foreground transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:text-foreground hover:no-underline hover:after:scale-x-100 focus-visible:after:scale-x-100"
              >
                {link.label}
              </a>
            ))}
          </div>
          <ThemeToggle />
          {user ? (
            <Button asChild className={PRESS}>
              <Link to="/dashboard" className="text-primary-foreground hover:no-underline">
                Open dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className={PRESS}>
                <Link to="/login" className="text-foreground hover:no-underline">
                  Log in
                </Link>
              </Button>
              <Button asChild className={PRESS}>
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

// Two soft shapes drifting a few pixels on a slow loop behind the preview.
// Desktop only (not rendered visually on small screens), transform-only, and
// static when reduced motion is preferred (MotionConfig reducedMotion="user").
function FloatingDecor() {
  const drift = (distance, duration, delay = 0) => ({
    animate: { y: [0, -distance, 0] },
    transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
  })
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
      <m.span {...drift(10, 9)} className="absolute -top-8 -right-6 size-28 border border-mint-line bg-mint/60" />
      <m.span {...drift(8, 11, 1.5)} className="absolute -bottom-10 -left-10 size-20 border border-mint-line" />
    </div>
  )
}

function Hero() {
  return (
    <section className="overflow-x-clip border-b border-steel">
      <Container className="grid items-center gap-33 py-33 sm:py-66 lg:grid-cols-[1fr_1.05fr] lg:gap-66">
        {/* Plays once on load; finishes within ~0.8s so content is never held back */}
        <m.div variants={stagger(0.05)} initial="hidden" animate="visible">
          <m.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 border border-mint-line bg-mint px-2.5 py-1 text-caption text-leaf"
          >
            Personal blood glucose tracker
          </m.p>
          <h1 className="mt-22 text-[38px] leading-[1.08] sm:text-[52px]">
            <m.span variants={fadeUp} className="inline-block">
              Understand your glucose.
            </m.span>{' '}
            <m.span variants={fadeUp} className="inline-block">
              Track your progress.
            </m.span>
          </h1>
          <m.p variants={fadeUp} className="mt-22 max-w-xl text-subheading text-muted-foreground">
            Record your blood glucose readings, review your daily history and understand your measurements with a simple
            personal tracking dashboard.
          </m.p>
          <m.div variants={fadeUp} className="mt-33 flex flex-wrap gap-15">
            <CtaButton to="/register">
              Get started <ArrowRight strokeWidth={1.25} className={ARROW} />
            </CtaButton>
            <CtaButton to="/login" variant="outline">
              Sign in
            </CtaButton>
          </m.div>
          <m.p variants={fadeUp} className="mt-15 text-caption text-muted-foreground">
            You enter readings yourself, from your own glucose meter.
          </m.p>
        </m.div>

        <m.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DURATION + 0.2, ease: EASE, delay: 0.2 }}
          // isolate keeps the -z-10 backdrop and shapes behind the preview but in
          // front of the page, even after Motion clears its transform
          className="relative isolate"
        >
          <FloatingDecor />
          <div aria-hidden="true" className="absolute -inset-3 -z-10 bg-mint sm:-inset-5" />
          <DashboardPreview />
        </m.div>
      </Container>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="scroll-mt-16 py-66">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to keep a clear record."
          text="Sweety focuses on one job: making it easy to log your readings and look back at them."
        />
        <ul className="mt-33 grid gap-px border border-steel bg-steel sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            // The cell stays opaque while its content fades in, so the grid lines never flash.
            // Each card triggers on its own (a parent trigger would leave the tall
            // stacked mobile list blank), cascading across each desktop row.
            <li key={feature.title} className="group bg-surface transition-colors duration-300 hover:bg-canvas">
              <m.div
                variants={withDelay(fadeUp, (index % 3) * 0.07)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                className="p-22 sm:p-33"
              >
                <span className="inline-flex size-10 items-center justify-center bg-mint text-leaf transition-colors duration-300 group-hover:bg-leaf group-hover:text-surface">
                  <feature.icon strokeWidth={1.25} className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-22 text-subheading">{feature.title}</h3>
                <p className="mt-2 text-body text-muted-foreground">{feature.text}</p>
              </m.div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-y border-steel bg-canvas py-66">
      <Container>
        <SectionHeading eyebrow="How it works" title="Three steps to a clearer picture." />
        {/* Steps reveal in order; each top rule draws from left to right */}
        <m.ol
          variants={stagger(0.1, 0.18)}
          {...inView}
          // Low threshold: on mobile the steps stack, and the first should show as soon as the list appears
          viewport={{ once: true, amount: 0.05 }}
          className="mt-33 grid gap-22 md:grid-cols-3"
        >
          {STEPS.map((step, index) => (
            <m.li key={step.title} variants={fadeUp} className="relative pt-22">
              <m.span
                aria-hidden="true"
                variants={{
                  hidden: { scaleX: 0 },
                  visible: { scaleX: 1, transition: { duration: DURATION + 0.2, ease: EASE } },
                }}
                className="absolute inset-x-0 top-0 h-px origin-left bg-ink"
              />
              <span className="text-heading-lg font-thin text-leaf tabular-nums">0{index + 1}</span>
              <h3 className="mt-15 text-subheading">{step.title}</h3>
              <p className="mt-2 text-body text-muted-foreground">{step.text}</p>
            </m.li>
          ))}
        </m.ol>
      </Container>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="py-66">
      <Container>
        <m.div
          variants={fadeUp}
          {...inView}
          className="flex flex-col items-start gap-22 border border-mint-line bg-mint p-33 sm:p-66 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 className="text-[30px] leading-[1.15] sm:text-heading-lg">Make tracking your readings simpler.</h2>
            <p className="mt-15 text-subheading text-muted-foreground">Create an account and add your first reading in a minute.</p>
          </div>
          <CtaButton to="/register" className="shrink-0">
            Get started <ArrowRight strokeWidth={1.25} className={ARROW} />
          </CtaButton>
        </m.div>
      </Container>
    </section>
  )
}

function Footer() {
  return (
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
              <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</a>
            </li>
            <li>
              <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">Log in</Link>
            </li>
            <li>
              <a href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">How it works</a>
            </li>
            <li>
              <Link to="/register" className="text-muted-foreground transition-colors hover:text-foreground">Create account</Link>
            </li>
          </ul>
        </nav>
        <div className="border-t border-steel pt-22 md:col-span-2">
          <p className="max-w-3xl text-caption text-muted-foreground">
            <strong className="font-light text-foreground">Medical disclaimer:</strong> Sweety is a personal record-keeping
            tool. It does not diagnose, treat or prevent any condition, and it does not provide medical advice. Always
            follow the guidance of your doctor or healthcare provider, and seek medical help immediately if you feel unwell.
          </p>
          <p className="mt-15 text-caption text-muted-foreground">© {CURRENT_YEAR} Sweety</p>
        </div>
      </Container>
    </footer>
  )
}

export default function LandingPage() {
  return (
    // LazyMotion + m.* load only the DOM animation features this page uses.
    // reducedMotion="user": with prefers-reduced-motion, movement is dropped
    // and content simply fades in (or appears) in place.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: DURATION, ease: EASE }}>
        <div className="min-h-svh bg-surface">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <LandingNav />
          <main id="main">
            <Hero />
            <Features />
            <HowItWorks />
            <FinalCta />
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
