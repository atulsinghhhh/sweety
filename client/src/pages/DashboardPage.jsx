import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import TrendLegend from '@/components/charts/TrendLegend'
import DateSelector from '@/components/DateSelector'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import PageHeader from '@/components/PageHeader'
import Panel from '@/components/Panel'
import ReadingFormDialog from '@/components/ReadingFormDialog'
import { SLOT_META } from '@/components/slotMeta'
import StatGrid, { StatGridSkeleton } from '@/components/StatGrid'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { useDateParam } from '@/hooks/useDateParam'
import api from '@/lib/api'
import { formatDate, formatShortDate, shiftDate } from '@/lib/dates'
import { MAX_READINGS_PER_DAY, SLOTS } from '@/lib/readings'
import { cn } from '@/lib/utils'

// Recharts is only downloaded once a chart is on screen
const TrendChart = lazy(() => import('@/components/charts/TrendChart'))

const TREND_DAYS = 14

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function ChartSkeleton({ height = 280 }) {
  return <Skeleton style={{ height }} className="w-full rounded-2xl bg-paper" />
}

// The selected day as a vertical timeline of the four slots
function DayTimeline({ readings, onAdd }) {
  const bySlot = Object.fromEntries(readings.map((r) => [r.slot, r]))
  return (
    <ol className="relative">
      {SLOTS.map((slot, index) => {
        const reading = bySlot[slot.value]
        const { icon: Icon, hint } = SLOT_META[slot.value]
        const last = index === SLOTS.length - 1
        return (
          <li key={slot.value} className="relative flex gap-4 pb-5 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute top-10 bottom-0 left-5 w-px bg-border" />}
            <span
              aria-hidden="true"
              className={cn(
                'relative inline-flex size-10 shrink-0 items-center justify-center rounded-full',
                reading ? 'bg-brand text-on-brand' : 'border border-dashed border-rule text-muted-foreground',
              )}
            >
              <Icon strokeWidth={1.5} className="size-[18px]" />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pt-0.5">
              <div className="min-w-0">
                <p className="truncate font-semibold">{slot.label}</p>
                <p className="truncate text-[13px] text-muted-foreground">{hint}</p>
              </div>
              {reading ? (
                <p className="shrink-0 text-right">
                  <span className="font-display text-[26px] leading-none tabular-nums">{reading.value}</span>
                  <span className="ml-1 text-[12px] text-muted-foreground">mg/dL</span>
                </p>
              ) : (
                <Button variant="outline" size="xs" onClick={() => onAdd(slot.value)} aria-label={`Add ${slot.label} reading`}>
                  <Plus strokeWidth={2} /> Add
                </Button>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [date, setDate] = useDateParam()
  // { slot } while the add dialog is open; slot may be undefined
  const [adding, setAdding] = useState(null)

  const trendFrom = shiftDate(date, -(TREND_DAYS - 1))
  const daily = useAsync(() => api.get('/reports/daily', { params: { date } }).then((r) => r.data.report), [date])
  const trend = useAsync(
    () => api.get('/readings', { params: { from: trendFrom, to: date } }).then((r) => r.data.readings),
    [trendFrom, date],
  )
  const recent = useAsync(() => api.get('/readings', { params: { limit: 5 } }).then((r) => r.data.readings), [])

  const refresh = () => {
    daily.reload()
    trend.reload()
    recent.reload()
  }

  const firstName = user?.name.split(' ')[0]
  const openAdd = (slot) => setAdding({ slot })
  const recordedToday = daily.data?.readings.length ?? 0

  return (
    <>
      <PageHeader
        eyebrow={formatDate(date, { weekday: 'long', month: 'long' })}
        title={
          <>
            {greeting()}, <em>{firstName}</em>.
          </>
        }
        description="Here is your day at a glance — your summary, your trend and what you've recorded."
        actions={
          <>
            <DateSelector value={date} onChange={setDate} />
            <Button size="lg" onClick={() => openAdd()}>
              <Plus strokeWidth={2} /> Add reading
            </Button>
          </>
        }
      />

      <section aria-labelledby="day-summary">
        <h2 id="day-summary" className="sr-only">
          Day summary
        </h2>
        {daily.error ? (
          <ErrorState message={daily.error} onRetry={daily.reload} />
        ) : !daily.data ? (
          <StatGridSkeleton />
        ) : (
          <StatGrid
            stats={daily.data.stats}
            emptyTitle="No readings for this day yet."
            emptyDescription="Add your first reading to see today's highest, lowest and average."
            emptyAction={
              <Button variant="outline" onClick={() => openAdd()}>
                <Plus strokeWidth={2} /> Add reading
              </Button>
            }
          />
        )}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          id="trend"
          eyebrow={`${formatShortDate(trendFrom)} – ${formatShortDate(date)}`}
          title={`Last ${TREND_DAYS} days`}
          aside={trend.data?.length > 0 && <TrendLegend />}
          className="lg:col-span-2"
          delay={120}
        >
          {trend.error ? (
            <ErrorState message={trend.error} onRetry={trend.reload} />
          ) : !trend.data ? (
            <ChartSkeleton />
          ) : trend.data.length === 0 ? (
            <EmptyState
              title="No readings in this period."
              description={`Readings from the ${TREND_DAYS} days up to the selected date will chart here.`}
            />
          ) : (
            <Suspense fallback={<ChartSkeleton />}>
              <TrendChart readings={trend.data} from={trendFrom} to={date} />
            </Suspense>
          )}
        </Panel>

        <Panel
          id="timeline"
          eyebrow="Daily timeline"
          title={formatDate(date, { weekday: 'long', year: undefined, month: 'short' })}
          delay={180}
          aside={
            daily.data && (
              <span className="rounded-full bg-paper px-3 py-1 text-[12px] font-semibold text-muted-foreground tabular-nums">
                {recordedToday} of {MAX_READINGS_PER_DAY}
              </span>
            )
          }
        >
          {daily.error ? (
            <p className="text-muted-foreground">The timeline is unavailable right now.</p>
          ) : !daily.data ? (
            <div className="space-y-5">
              {SLOTS.map((slot) => (
                <div key={slot.value} className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-full bg-paper" />
                  <Skeleton className="h-4 flex-1 bg-paper" />
                </div>
              ))}
            </div>
          ) : (
            <DayTimeline readings={daily.data.readings} onAdd={openAdd} />
          )}
        </Panel>
      </div>

      <Panel
        id="recent-readings"
        eyebrow="History"
        title="Recent readings"
        className="mt-4"
        delay={240}
        aside={
          <Link to={`/readings?date=${date}`} className="group inline-flex items-center gap-1.5 text-sm font-semibold">
            Manage readings
            <ArrowRight strokeWidth={1.75} className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        }
      >
        {recent.error ? (
          <ErrorState message={recent.error} onRetry={recent.reload} />
        ) : !recent.data ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full bg-paper" />
            ))}
          </div>
        ) : recent.data.length === 0 ? (
          <EmptyState title="Nothing recorded yet." description="Your latest readings will appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {recent.data.map((reading) => {
              const Icon = SLOT_META[reading.slot].icon
              return (
                <li key={reading.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink"
                  >
                    <Icon strokeWidth={1.5} className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{reading.slotLabel}</p>
                    <p className="text-[13px] text-muted-foreground">{formatShortDate(reading.readingDate)}</p>
                  </div>
                  <p className="shrink-0">
                    <span className="font-display text-[26px] leading-none tabular-nums">{reading.value}</span>
                    <span className="ml-1 text-[12px] text-muted-foreground">mg/dL</span>
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <ReadingFormDialog
        open={Boolean(adding)}
        onOpenChange={(open) => !open && setAdding(null)}
        defaults={{ readingDate: date, slot: adding?.slot }}
        onSaved={refresh}
        onConflict={refresh}
      />
    </>
  )
}
