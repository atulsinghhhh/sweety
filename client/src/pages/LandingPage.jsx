import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { LazyMotion, MotionConfig, domAnimation, m } from 'motion/react'
import { ArrowRight, BarChart3, CalendarDays, ClipboardList, Clock4, LayoutDashboard, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import { SLOT_META } from '@/components/slotMeta'
import ThemeToggle from '@/components/ThemeToggle'
import DashboardPreview from '@/components/landing/DashboardPreview'
import { DURATION, EASE, fadeUp, inView, stagger, withDelay } from '@/components/landing/motion'
import { useAuth } from '@/hooks/useAuth'
import { MAX_VALUE, MIN_VALUE, SLOTS } from '@/lib/readings'
import { cn } from '@/lib/utils'

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
    text: "Your day's summary, a 14-day trend and your most recent readings in one place, with a quick way to add the next one.",
  },
  {
    icon: LockKeyhole,
    title: 'Secure individual accounts',
    text: 'Each account is private. Passwords are stored as secure hashes, and your readings are only ever visible to you.',
  },
]

const HERO_FACTS = [
  { value: '4', label: 'reading slots a day' },
  { value: '3', label: 'report periods' },
  { value: `${MIN_VALUE}–${MAX_VALUE}`, label: 'mg/dL accepted' },
]

const REPORT_TERMS = ['Highest', 'Lowest', 'Average', 'Total readings', 'Daily trend', 'Day-by-day table']

// Sample bars for the illustrative report vignette
const SAMPLE_BARS = [118, 134, 109, 141, 127, 122, 136, 115, 129, 138, 124, 131]

const CURRENT_YEAR = new Date().getFullYear()

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#reports', label: 'Reports' },
]

// Micro-interactions are plain CSS transitions (no JS per hover): a slight
// press on tap and an arrow nudge on hover; the global reduced-motion rule
// in index.css flattens them.
const ARROW = 'transition-transform duration-200 group-hover/cta:translate-x-0.5'

function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-4 sm:px-8 ${className}`}>{children}</div>
}

function SectionHeading({ eyebrow, title, text, className }) {
  return (
    <m.div variants={stagger(0, 0.06)} {...inView} className={cn('max-w-2xl', className)}>
      <m.p variants={fadeUp} className="eyebrow text-seal-ink">
        {eyebrow}
      </m.p>
      <m.h2 variants={fadeUp} className="mt-3 font-display text-[40px] leading-[1.05] sm:text-display">
        {title}
      </m.h2>
      {text && (
        <m.p variants={fadeUp} className="mt-5 text-[18px] font-light text-muted-foreground">
          {text}
        </m.p>
      )}
    </m.div>
  )
}

function CtaButton({ to, href, children, variant, className = '' }) {
  return (
    <Button asChild size="lg" variant={variant} className={`group/cta ${className}`}>
      {href ? <a href={href}>{children}</a> : <Link to={to}>{children}</Link>}
    </Button>
  )
}

function LandingNav() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-taupe/60 bg-background/85 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Link to="/" aria-label="Sweety home" className="hover:no-underline">
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <div className="mr-2 hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-paper hover:no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>
          <ThemeToggle />
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </Container>
    </header>
  )
}

// Soft terracotta "seal" discs drifting a few pixels on a slow loop behind the
// preview. Desktop only, transform-only, static with reduced motion.
function FloatingDecor() {
  const drift = (distance, duration, delay = 0) => ({
    animate: { y: [0, -distance, 0] },
    transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
  })
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <m.span
        {...drift(12, 10)}
        className="absolute -top-10 -right-8 size-44 rounded-full bg-[linear-gradient(116deg,var(--seal),var(--seal-tan))] opacity-25 blur-[2px] sm:size-56"
      />
      <m.span {...drift(8, 12, 1.5)} className="absolute -bottom-10 -left-8 hidden size-28 rounded-full border border-taupe lg:block" />
    </div>
  )
}

const HEADLINE = [
  { text: 'Know your', italic: false },
  { text: 'glucose,', italic: false },
  { text: 'one reading', italic: true },
  { text: 'at a time.', italic: false },
]

function Hero() {
  return (
    <section className="relative overflow-x-clip">
      <Container className="grid items-center gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28">
        {/* Plays once on load; finishes within ~1s so content is never held back */}
        <m.div variants={stagger(0.05, 0.07)} initial="hidden" animate="visible">
          <m.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-taupe bg-paper px-3.5 py-1.5 text-[13px] font-semibold"
          >
            <span className="size-1.5 rounded-full bg-seal" aria-hidden="true" />
            Personal blood glucose journal
          </m.p>
          <h1 className="mt-7 font-display text-[52px] leading-[0.98] sm:text-[72px] xl:text-hero">
            {HEADLINE.map((word, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <m.span variants={fadeUp} className="inline-block">
                  {word.italic ? <em>{word.text}</em> : word.text}
                </m.span>
              </Fragment>
            ))}
          </h1>
          <m.p variants={fadeUp} className="mt-7 max-w-xl text-[18px] font-light text-muted-foreground sm:text-[20px]">
            Record your readings from your own meter, review each day in four calm moments, and see your daily and monthly
            numbers in perspective.
          </m.p>
          <m.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            <CtaButton to="/register">
              Start tracking <ArrowRight strokeWidth={2} className={ARROW} />
            </CtaButton>
            <CtaButton href="#how-it-works" variant="outline">
              See how it works
            </CtaButton>
          </m.div>

          <m.dl variants={fadeUp} className="mt-12 flex max-w-lg divide-x divide-taupe">
            {HERO_FACTS.map((fact) => (
              <div key={fact.label} className="flex-1 px-5 first:pl-0 last:pr-0">
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="block font-display text-[34px] leading-none tabular-nums">{fact.value}</span>
                  <span className="mt-2 block text-[13px] text-muted-foreground">{fact.label}</span>
                </dd>
              </div>
            ))}
          </m.dl>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: DURATION + 0.3, ease: EASE, delay: 0.25 }}
          // isolate keeps the decor behind the preview but in front of the page
          className="relative isolate"
        >
          <FloatingDecor />
          <DashboardPreview />
        </m.div>
      </Container>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-paper py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need, <em>nothing</em> you don't.
            </>
          }
          text="Sweety focuses on one job: making it easy to log your readings and look back at them."
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            // Each card triggers on its own (a parent trigger would leave the tall
            // stacked mobile list blank), cascading across each desktop row.
            <m.li
              key={feature.title}
              variants={withDelay(fadeUp, (index % 3) * 0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              className="group rounded-3xl bg-background p-7 transition-shadow duration-300 hover:shadow-float sm:p-8"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-seal-soft text-seal-ink transition-colors duration-300 group-hover:bg-seal group-hover:text-on-seal">
                <feature.icon strokeWidth={1.5} className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-8 font-display text-[26px] leading-tight">{feature.title}</h3>
              <p className="mt-3 text-muted-foreground">{feature.text}</p>
            </m.li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

// Micro-UI vignettes for each step — illustrations, hidden from screen readers
function RegisterVignette() {
  return (
    <div className="space-y-2">
      {['Name', 'Email', 'Password'].map((label, i) => (
        <div key={label} className="flex h-9 items-center rounded-full border border-taupe bg-background px-4 text-[12px] text-muted-foreground">
          {label}
          {i === 2 && <span className="ml-auto tracking-widest">••••••••</span>}
        </div>
      ))}
    </div>
  )
}

function RecordVignette() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SLOTS.map((slot, i) => {
        const Icon = SLOT_META[slot.value].icon
        return (
          <div
            key={slot.value}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-2 text-[12px]',
              i === 2 ? 'border-seal bg-background font-semibold text-seal-ink' : 'border-taupe text-muted-foreground',
            )}
          >
            <Icon strokeWidth={1.5} className="size-3.5" />
            {SLOT_META[slot.value].short}
          </div>
        )
      })}
    </div>
  )
}

function ReviewVignette() {
  return (
    <div className="flex h-[84px] items-end gap-1.5 border-b border-taupe">
      {SAMPLE_BARS.slice(0, 8).map((v, i) => (
        <m.span
          key={i}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.05 }}
          style={{ height: `${((v - 90) / 60) * 100}%` }}
          className={cn('flex-1 origin-bottom rounded-t-[2px]', i === 5 ? 'bg-seal' : 'bg-seal-tan/70')}
        />
      ))}
    </div>
  )
}

const STEPS = [
  {
    title: 'Create an account',
    text: 'Register with your name, email and a password. It takes under a minute.',
    vignette: RegisterVignette,
  },
  {
    title: 'Record your readings',
    text: 'After you check your glucose with your own meter, add the value to the matching time slot.',
    vignette: RecordVignette,
  },
  {
    title: 'Review your history',
    text: 'Look back at any day, and see daily, month-to-date and monthly summaries of what you recorded.',
    vignette: ReviewVignette,
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Three steps to a <em>clearer</em> picture.
            </>
          }
        />
        <m.ol
          variants={stagger(0.1, 0.14)}
          {...inView}
          // Low threshold: on mobile the steps stack, and the first should show as soon as the list appears
          viewport={{ once: true, amount: 0.05 }}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          {STEPS.map((step, index) => (
            <m.li key={step.title} variants={fadeUp} className="flex flex-col rounded-3xl bg-paper px-7 pt-9 pb-7 sm:px-8">
              <span className="eyebrow text-seal-ink tabular-nums">Step 0{index + 1}</span>
              <h3 className="mt-4 font-display text-heading leading-tight">{step.title}</h3>
              <p className="mt-3 text-muted-foreground">{step.text}</p>
              <div aria-hidden="true" className="mt-auto pt-10">
                <step.vignette />
              </div>
            </m.li>
          ))}
        </m.ol>
      </Container>
    </section>
  )
}

function ReportsShowcase() {
  return (
    <section id="reports" className="scroll-mt-20 border-t border-taupe/60 py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Reports"
            title={
              <>
                Your numbers, <em>in perspective</em>.
              </>
            }
            text="Switch between the selected day, the month so far and the whole previous month. Every report is calculated from exactly what you recorded."
          />
          <m.ul
            variants={fadeUp}
            {...inView}
            className="mt-8 flex flex-wrap gap-y-2 text-[15px]"
            aria-label="Included in every report"
          >
            {REPORT_TERMS.map((term, i) => (
              <li key={term} className="flex items-center">
                {term}
                {i < REPORT_TERMS.length - 1 && (
                  <span aria-hidden="true" className="px-4 text-seal">
                    ·
                  </span>
                )}
              </li>
            ))}
          </m.ul>
        </div>

        <m.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: DURATION + 0.2, ease: EASE }}
          className="relative"
        >
          <div
            role="img"
            aria-label="Illustrative report: three period tabs and a bar chart of sample daily averages."
            className="rounded-3xl border border-border bg-card p-5 shadow-float sm:p-7"
          >
            <div aria-hidden="true">
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Daily', '131.8'],
                  ['Month to date', '127.4'],
                  ['Previous month', '129.1'],
                ].map(([label, value], i) => (
                  <div key={label} className={cn('rounded-2xl border p-3', i === 1 ? 'border-seal bg-background' : 'border-border bg-paper')}>
                    <p className={cn('truncate text-[10px] font-semibold tracking-[0.06em] uppercase', i === 1 ? 'text-seal-ink' : 'text-muted-foreground')}>
                      {label}
                    </p>
                    <p className="mt-2 font-display text-[22px] leading-none sm:text-[26px]">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">Daily average · mg/dL</p>
              <div className="mt-3 flex h-40 items-end gap-1.5 border-b border-taupe sm:gap-2">
                {SAMPLE_BARS.map((v, i) => (
                  <m.span
                    key={i}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.04 }}
                    style={{ height: `${((v - 90) / 60) * 100}%` }}
                    className={cn('flex-1 origin-bottom rounded-t-[2px]', i === 9 ? 'bg-seal' : 'bg-seal-tan/70')}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] text-muted-foreground">Illustrative preview · sample values</p>
        </m.div>
      </Container>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <m.div
          variants={fadeUp}
          {...inView}
          className="relative isolate overflow-hidden rounded-3xl bg-foreground px-7 py-14 text-background sm:px-16 sm:py-20"
        >
          <span
            aria-hidden="true"
            className="absolute -top-24 -right-24 -z-10 size-80 rounded-full bg-[linear-gradient(116deg,var(--seal),var(--seal-tan))] opacity-30"
          />
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-[40px] leading-[1.05] sm:text-display">
                Make tracking <em>simpler</em>.
              </h2>
              <p className="mt-5 text-[18px] font-light opacity-80">Create an account and add your first reading in a minute.</p>
            </div>
            <CtaButton to="/register" className="shrink-0">
              Get started <ArrowRight strokeWidth={2} className={ARROW} />
            </CtaButton>
          </div>
        </m.div>
      </Container>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-taupe/60 bg-paper">
      <Container className="grid gap-12 py-14 sm:py-16 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-muted-foreground">
            A simple personal tracker for recording blood glucose readings and reviewing your history.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              ['#features', 'Features'],
              ['#how-it-works', 'How it works'],
              ['#reports', 'Reports'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-foreground">
                  {label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/login" className="text-foreground">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/register" className="text-foreground">
                Create account
              </Link>
            </li>
          </ul>
        </nav>
        <div className="border-t border-taupe pt-8 md:col-span-2">
          <p className="max-w-3xl text-[13px] text-muted-foreground">
            <strong className="font-semibold text-foreground">Medical disclaimer:</strong> Sweety is a personal
            record-keeping tool. It does not diagnose, treat or prevent any condition, and it does not provide medical
            advice. Always follow the guidance of your doctor or healthcare provider, and seek medical help immediately if
            you feel unwell.
          </p>
          <p className="mt-4 text-[13px] text-muted-foreground">© {CURRENT_YEAR} Sweety</p>
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
        <div className="min-h-svh bg-background">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <LandingNav />
          <main id="main">
            <Hero />
            <Features />
            <HowItWorks />
            <ReportsShowcase />
            <FinalCta />
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
