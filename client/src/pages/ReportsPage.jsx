import { lazy, Suspense, useState } from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { Skeleton } from '@/components/ui/skeleton'
import TrendLegend from '@/components/charts/TrendLegend'
import DateSelector from '@/components/DateSelector'
import ErrorState from '@/components/ErrorState'
import PageHeader from '@/components/PageHeader'
import Panel from '@/components/Panel'
import ReadingSlots from '@/components/ReadingSlots'
import { SLOT_META } from '@/components/slotMeta'
import StatGrid, { StatGridSkeleton } from '@/components/StatGrid'
import { useAsync } from '@/hooks/useAsync'
import { useDateParam } from '@/hooks/useDateParam'
import api from '@/lib/api'
import { formatDate, formatMonth, formatShortDate } from '@/lib/dates'
import { SLOTS } from '@/lib/readings'
import { formatValue, readingsByDay } from '@/lib/stats'
import { cn } from '@/lib/utils'

// Recharts is only downloaded once a chart is on screen
const TrendChart = lazy(() => import('@/components/charts/TrendChart'))
const DayChart = lazy(() => import('@/components/charts/DayChart'))

const fetchReport = (type, date) => api.get(`/reports/${type}`, { params: { date } }).then((r) => r.data.report)

function ChartSkeleton() {
  return <Skeleton className="h-[280px] w-full rounded-2xl bg-paper" />
}

// Every period the page can show, with the copy for its header and empty state
function periods(data, date) {
  return [
    {
      key: 'daily',
      label: 'Daily',
      report: data?.daily,
      range: { from: date, to: date },
      subtitle: formatDate(date),
      emptyTitle: 'No readings on this day.',
      emptyDescription: 'Pick another date or add readings to see a daily report.',
    },
    {
      key: 'mtd',
      label: 'Month to date',
      report: data?.monthToDate,
      range: data?.monthToDate.range,
      subtitle: data && `${formatShortDate(data.monthToDate.range.from)} – ${formatShortDate(data.monthToDate.range.to)}`,
      emptyTitle: 'No readings so far this month.',
      emptyDescription: 'Readings from the 1st of the month up to the selected date appear here.',
    },
    {
      key: 'monthly',
      label: 'Previous month',
      report: data?.monthly,
      range: data?.monthly.range,
      subtitle: data && formatMonth(data.monthly.month),
      emptyTitle: data && `No readings in ${formatMonth(data.monthly.month)}.`,
      emptyDescription: 'The monthly report covers the entire calendar month before the selected date.',
    },
  ]
}

function PeriodTab({ period }) {
  const stats = period.report?.stats
  return (
    <TabsPrimitive.Trigger
      value={period.key}
      className={cn(
        'group flex flex-col items-start gap-4 rounded-3xl border border-border bg-paper p-5 text-left transition-[background-color,box-shadow,border-color] duration-300 outline-none hover:bg-paper-deep focus-visible:ring-3 focus-visible:ring-ring/30 sm:p-6',
        'data-[state=active]:border-seal data-[state=active]:bg-card data-[state=active]:shadow-glow',
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="eyebrow text-muted-foreground group-data-[state=active]:text-seal-ink">{period.label}</span>
        <span aria-hidden="true" className="size-2 rounded-full bg-taupe group-data-[state=active]:bg-seal" />
      </span>
      <span>
        <span className="block font-display text-[34px] leading-none tabular-nums">
          {stats ? formatValue(stats.average) : <span className="inline-block h-8 w-20 animate-pulse rounded-xl bg-paper-deep" />}
          {stats?.count > 0 && <span className="ml-1.5 font-sans text-[13px] text-muted-foreground">avg mg/dL</span>}
        </span>
        <span className="mt-2 block text-[13px] text-muted-foreground">
          {period.subtitle ?? '…'}
          {stats && ` · ${stats.count} ${stats.count === 1 ? 'reading' : 'readings'}`}
        </span>
      </span>
    </TabsPrimitive.Trigger>
  )
}

// Readings for a month-long period, as a chart and a day-by-day table
function RangeDetail({ range, title }) {
  const { data: readings, error, reload } = useAsync(
    () => api.get('/readings', { params: range }).then((r) => r.data.readings),
    [range.from, range.to],
  )

  if (error) return <ErrorState message={error} onRetry={reload} />

  const days = readings ? readingsByDay(readings) : []

  return (
    <>
      <Panel id="period-trend" eyebrow={title} title="Daily trend" aside={<TrendLegend />} className="mt-4">
        {!readings ? (
          <ChartSkeleton />
        ) : (
          <Suspense fallback={<ChartSkeleton />}>
            <TrendChart readings={readings} from={range.from} to={range.to} />
          </Suspense>
        )}
      </Panel>

      <Panel
        id="period-days"
        eyebrow="Individual readings"
        title="Day by day"
        className="mt-4"
        aside={readings && <span className="text-[13px] text-muted-foreground">{days.length} days with readings</span>}
      >
        {!readings ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-paper" />
            ))}
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-7 sm:px-7">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-border text-[12px] text-muted-foreground">
                  <th scope="col" className="pb-3 font-semibold">
                    Date
                  </th>
                  {SLOTS.map((slot) => {
                    const Icon = SLOT_META[slot.value].icon
                    return (
                      <th key={slot.value} scope="col" className="pb-3 text-right font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon strokeWidth={1.5} className="size-3.5 text-seal-ink" aria-hidden="true" />
                          {SLOT_META[slot.value].short}
                        </span>
                      </th>
                    )
                  })}
                  <th scope="col" className="pb-3 text-right font-semibold">
                    Day average
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {days.map((day) => (
                  <tr key={day.date} className="transition-colors hover:bg-paper/60">
                    <th scope="row" className="py-3 pr-4 text-left font-semibold whitespace-nowrap">
                      {formatDate(day.date, { year: undefined })}
                    </th>
                    {SLOTS.map((slot) => (
                      <td key={slot.value} className="py-3 text-right tabular-nums">
                        {day.slots[slot.value] ?? <span className="text-muted-foreground">—</span>}
                      </td>
                    ))}
                    <td className="py-3 text-right font-display text-[19px] tabular-nums">{formatValue(day.average)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}

export default function ReportsPage() {
  const [date, setDate] = useDateParam()
  const [active, setActive] = useState('daily')

  const { data, error, reload } = useAsync(
    () =>
      Promise.all([fetchReport('daily', date), fetchReport('month-to-date', date), fetchReport('monthly', date)]).then(
        ([daily, monthToDate, monthly]) => ({ daily, monthToDate, monthly }),
      ),
    [date],
  )

  const all = periods(data, date)

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title={
          <>
            Your numbers, <em>in perspective</em>.
          </>
        }
        description="Highest, lowest and average readings, calculated for the selected date."
        actions={<DateSelector value={date} onChange={setDate} />}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <TabsPrimitive.Root value={active} onValueChange={setActive}>
          <TabsPrimitive.List aria-label="Report period" className="animate-rise grid gap-3 sm:grid-cols-3 sm:gap-4">
            {all.map((period) => (
              <PeriodTab key={period.key} period={period} />
            ))}
          </TabsPrimitive.List>

          {all.map((period) => (
            <TabsPrimitive.Content key={period.key} value={period.key} className="mt-10 outline-none">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-[30px] leading-tight">{period.label} report</h2>
                {period.subtitle && <span className="text-[13px] text-muted-foreground">{period.subtitle}</span>}
              </div>

              {!data ? (
                <>
                  <StatGridSkeleton />
                  <div className="mt-4">
                    <ChartSkeleton />
                  </div>
                </>
              ) : (
                <>
                  <StatGrid
                    stats={period.report.stats}
                    emptyTitle={period.emptyTitle}
                    emptyDescription={period.emptyDescription}
                  />
                  {period.report.stats.count > 0 &&
                    (period.key === 'daily' ? (
                      <>
                        <Panel id="daily-chart" eyebrow={formatDate(date)} title="Readings by time slot" className="mt-4">
                          <Suspense fallback={<ChartSkeleton />}>
                            <DayChart readings={period.report.readings} />
                          </Suspense>
                        </Panel>
                        <div className="mt-10">
                          <h3 className="mb-4 eyebrow text-muted-foreground">Individual readings</h3>
                          <ReadingSlots readings={period.report.readings} />
                        </div>
                      </>
                    ) : (
                      <RangeDetail range={period.range} title={period.subtitle} />
                    ))}
                </>
              )}
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      )}
    </>
  )
}
