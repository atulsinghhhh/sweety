import { m } from 'motion/react'
import ReadingSlots from '@/components/ReadingSlots'
import { CELL, GRID, STATS } from '@/components/StatGrid'
import { cn } from '@/lib/utils'
import CountUp from './CountUp'
import { fadeUp, stagger } from './motion'

// Static, clearly labelled illustration built from the real dashboard
// components and styles. Values are invented samples, never a real user's data.
const SAMPLE_READINGS = [
  { id: 'sample-morning', slot: 'MORNING', value: 98 },
  { id: 'sample-breakfast', slot: 'AFTER_BREAKFAST', value: 142 },
  { id: 'sample-lunch', slot: 'AFTER_LUNCH', value: 156 },
  { id: 'sample-dinner', slot: 'AFTER_DINNER', value: 131 },
]

// Derived from SAMPLE_READINGS the same way the API computes them
const SAMPLE_STATS = {
  count: SAMPLE_READINGS.length,
  highest: Math.max(...SAMPLE_READINGS.map((r) => r.value)),
  lowest: Math.min(...SAMPLE_READINGS.map((r) => r.value)),
  average: Math.round((SAMPLE_READINGS.reduce((sum, r) => sum + r.value, 0) / SAMPLE_READINGS.length) * 10) / 10,
}

export default function DashboardPreview() {
  return (
    <figure className="relative">
      <div
        role="img"
        aria-label="Illustrative preview of the Sweety dashboard, showing a day's summary statistics and four reading slots with sample values."
        className="border border-steel bg-surface"
      >
        <div aria-hidden="true">
          <div className="flex items-center justify-between border-b border-steel bg-canvas px-15 py-2.5">
            <div className="flex gap-1.5">
              <span className="size-2 bg-steel" />
              <span className="size-2 bg-steel" />
              <span className="size-2 bg-steel" />
            </div>
            <span className="text-caption text-muted-foreground">sweety · dashboard</span>
            <span className="w-8" />
          </div>

          <div className="p-15 sm:p-22">
            <p className="text-caption text-muted-foreground">day summary</p>
            {/* Preview is narrower than the real page: keep the stat grid at 2 columns */}
            <m.dl
              variants={stagger(0.45, 0.1)}
              initial="hidden"
              animate="visible"
              className={cn(GRID, 'mt-2 grid-cols-2 lg:grid-cols-2')}
            >
              {STATS.map((stat, index) => (
                <m.div key={stat.key} variants={fadeUp} className={cn(CELL, 'bg-surface')}>
                  <dt className="text-caption text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-1 text-[26px] leading-[1.11] font-thin sm:text-[32px]">
                    <CountUp value={SAMPLE_STATS[stat.key]} decimals={stat.key === 'average' ? 1 : 0} delay={0.5 + index * 0.1} />
                    {stat.unit && <span className="ml-1.5 text-caption font-light text-muted-foreground">{stat.unit}</span>}
                  </dd>
                </m.div>
              ))}
            </m.dl>
            <p className="mt-22 text-caption text-muted-foreground">readings</p>
            <div className="mt-2 [&_li]:py-2.5">
              <ReadingSlots readings={SAMPLE_READINGS} />
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-caption text-muted-foreground">Illustrative preview · sample values</figcaption>
    </figure>
  )
}
