import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DateSelector from '@/components/DateSelector'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import PageHeader from '@/components/PageHeader'
import ReadingFormDialog from '@/components/ReadingFormDialog'
import StatGrid, { StatGridSkeleton } from '@/components/StatGrid'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { useDateParam } from '@/hooks/useDateParam'
import api from '@/lib/api'
import { formatDate, formatShortDate } from '@/lib/dates'

export default function DashboardPage() {
  const { user } = useAuth()
  const [date, setDate] = useDateParam()
  const [adding, setAdding] = useState(false)

  const daily = useAsync(() => api.get('/reports/daily', { params: { date } }).then((r) => r.data.report), [date])
  const recent = useAsync(() => api.get('/readings', { params: { limit: 5 } }).then((r) => r.data.readings), [])

  const refresh = () => {
    daily.reload()
    recent.reload()
  }

  const firstName = user?.name.split(' ')[0]

  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName}.`}
        description={formatDate(date, { weekday: 'long', month: 'long' })}
        actions={
          <>
            <DateSelector value={date} onChange={setDate} />
            <Button onClick={() => setAdding(true)}>
              <Plus strokeWidth={1.25} /> Add reading
            </Button>
          </>
        }
      />

      <section aria-labelledby="day-summary">
        <h2 id="day-summary" className="mb-15 text-subheading">
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
              <Button variant="outline" onClick={() => setAdding(true)}>
                <Plus strokeWidth={1.25} /> Add reading
              </Button>
            }
          />
        )}
      </section>

      <section aria-labelledby="recent-readings" className="mt-66">
        <div className="mb-15 flex items-baseline justify-between">
          <h2 id="recent-readings" className="text-subheading">
            Recent readings
          </h2>
          <Link to={`/readings?date=${date}`} className="text-body">
            Manage readings
          </Link>
        </div>

        {recent.error ? (
          <ErrorState message={recent.error} onRetry={recent.reload} />
        ) : !recent.data ? (
          <div className="border-t border-ink">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="my-15 h-5 w-full" />
            ))}
          </div>
        ) : recent.data.length === 0 ? (
          <EmptyState title="Nothing recorded yet." description="Your latest readings will appear here." />
        ) : (
          <ul className="border-t border-ink">
            {recent.data.map((reading) => (
              <li
                key={reading.id}
                className="grid grid-cols-[1fr_auto] items-baseline gap-x-15 border-b border-steel py-15 sm:grid-cols-[10rem_1fr_auto]"
              >
                <span className="text-caption text-muted-foreground">{formatShortDate(reading.readingDate)}</span>
                <span className="order-first col-span-2 text-body sm:order-none sm:col-span-1">{reading.slotLabel}</span>
                <span className="text-subheading font-light tabular-nums">
                  {reading.value}
                  <span className="ml-1.5 text-caption font-light text-muted-foreground">mg/dL</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReadingFormDialog open={adding} onOpenChange={setAdding} defaults={{ readingDate: date }} onSaved={refresh} onConflict={refresh} />
    </>
  )
}
