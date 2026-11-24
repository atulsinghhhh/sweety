import { m } from 'motion/react'
import { STATS } from '@/components/statGridLayout'
import { SLOT_META } from '@/components/slotMeta'
import { SLOTS } from '@/lib/readings'
import { cn } from '@/lib/utils'
import CountUp from './CountUp'
import { EASE, fadeUp, stagger } from './motion'

// Static, clearly labelled illustration in the real dashboard's styles.
// Values are invented samples, never a real user's data.
const SAMPLE_READINGS = { MORNING: 98, AFTER_BREAKFAST: 142, AFTER_LUNCH: 156, AFTER_DINNER: 131 }
const SAMPLE_VALUES = Object.values(SAMPLE_READINGS)

// Derived from the samples the same way the API computes them
const SAMPLE_STATS = {
  count: SAMPLE_VALUES.length,
  highest: Math.max(...SAMPLE_VALUES),
  lowest: Math.min(...SAMPLE_VALUES),
  average: Math.round((SAMPLE_VALUES.reduce((sum, v) => sum + v, 0) / SAMPLE_VALUES.length) * 10) / 10,
}

// Sample daily averages for the mini trend line
const SAMPLE_TREND = [126, 131, 119, 138, 129, 124, 132]

function MiniTrend() {
  const w = 280
  const h = 88
  const min = Math.min(...SAMPLE_TREND) - 8
  const max = Math.max(...SAMPLE_TREND) + 8
  const points = SAMPLE_TREND.map((v, i) => [(i / (SAMPLE_TREND.length - 1)) * w, h - ((v - min) / (max - min)) * h])
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`-6 -6 ${w + 12} ${h + 12}`} className="h-24 w-full" preserveAspectRatio="none">
      <m.path
        d={`${line} L${w},${h + 6} L0,${h + 6} Z`}
        className="fill-brand/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      />
      <m.path
        d={line}
        fill="none"
        className="stroke-brand"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.6 }}
      />
    </svg>
  )
}

export default function DashboardPreview() {
  return (
    <figure className="relative">
      <div
        role="img"
        aria-label="Illustrative preview of the Sweety dashboard, showing a day's summary statistics, a seven-day trend line and four reading slots with sample values."
        className="overflow-hidden rounded-3xl border border-border bg-card shadow-float"
      >
        <div aria-hidden="true">
          <div className="flex items-center justify-between border-b border-border bg-paper px-5 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-rule" />
              <span className="size-2.5 rounded-full bg-rule" />
              <span className="size-2.5 rounded-full bg-rule" />
            </div>
            <span className="text-[12px] text-muted-foreground">sweety · dashboard</span>
            <span className="w-10" />
          </div>

          <div className="p-4 sm:p-6">
            <p className="eyebrow text-brand-ink">Today</p>
            <p className="mt-1 font-display text-[28px] leading-tight">
              Good morning, <em>there</em>.
            </p>

            <m.dl variants={stagger(0.45, 0.1)} initial="hidden" animate="visible" className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {STATS.map((stat, index) => (
                <m.div
                  key={stat.key}
                  variants={fadeUp}
                  className={cn('rounded-2xl p-3.5', stat.featured ? 'bg-foreground text-background' : 'bg-paper')}
                >
                  <dt className={cn('text-[10px] font-semibold tracking-[0.06em] uppercase', stat.featured ? 'opacity-75' : 'text-muted-foreground')}>
                    {stat.label}
                  </dt>
                  <dd className="mt-2 font-display text-[26px] leading-none">
                    <CountUp value={SAMPLE_STATS[stat.key]} decimals={stat.key === 'average' ? 1 : 0} delay={0.5 + index * 0.1} />
                  </dd>
                </m.div>
              ))}
            </m.dl>

            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[1.3fr_1fr]">
              <div className="rounded-2xl border border-border p-3.5">
                <p className="text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">Last 7 days</p>
                <MiniTrend />
              </div>
              <m.ul variants={stagger(0.9, 0.08)} initial="hidden" animate="visible" className="space-y-1.5 rounded-2xl border border-border p-3.5">
                {SLOTS.map((slot) => {
                  const Icon = SLOT_META[slot.value].icon
                  return (
                    <m.li key={slot.value} variants={fadeUp} className="flex items-center gap-2.5">
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-brand text-on-brand">
                        <Icon strokeWidth={1.75} className="size-3" />
                      </span>
                      <span className="flex-1 truncate text-[12px]">{SLOT_META[slot.value].short}</span>
                      <span className="font-display text-[17px] tabular-nums">{SAMPLE_READINGS[slot.value]}</span>
                    </m.li>
                  )
                })}
              </m.ul>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[12px] text-muted-foreground">Illustrative preview · sample values</figcaption>
    </figure>
  )
}
