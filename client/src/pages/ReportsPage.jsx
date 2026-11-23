import DateSelector from '@/components/DateSelector'
import ErrorState from '@/components/ErrorState'
import PageHeader from '@/components/PageHeader'
import ReadingSlots, { ReadingSlotsSkeleton } from '@/components/ReadingSlots'
import StatGrid, { StatGridSkeleton } from '@/components/StatGrid'
import { useAsync } from '@/hooks/useAsync'
import { useDateParam } from '@/hooks/useDateParam'
import api from '@/lib/api'
import { formatDate, formatMonth, formatShortDate } from '@/lib/dates'

const fetchReport = (type, date) => api.get(`/reports/${type}`, { params: { date } }).then((r) => r.data.report)

function ReportSection({ id, title, subtitle, children }) {
  return (
    <section aria-labelledby={id} className="mt-66 first:mt-0">
      <div className="mb-15 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="text-heading-sm">
          {title}
        </h2>
        {subtitle && <span className="text-caption text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </section>
  )
}

export default function ReportsPage() {
  const [date, setDate] = useDateParam()

  const { data, error, reload } = useAsync(
    () =>
      Promise.all([fetchReport('daily', date), fetchReport('month-to-date', date), fetchReport('monthly', date)]).then(
        ([daily, monthToDate, monthly]) => ({ daily, monthToDate, monthly }),
      ),
    [date],
  )

  return (
    <>
      <PageHeader
        title="Reports"
        description="Highest, lowest and average readings, calculated for the selected date."
        actions={<DateSelector value={date} onChange={setDate} />}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <ReportSection id="daily-report" title="Daily" subtitle={formatDate(date)}>
            {!data ? (
              <>
                <StatGridSkeleton />
                <div className="mt-33">
                  <ReadingSlotsSkeleton />
                </div>
              </>
            ) : (
              <>
                <StatGrid
                  stats={data.daily.stats}
                  emptyTitle="No readings on this day."
                  emptyDescription="Pick another date or add readings to see a daily report."
                />
                {data.daily.stats.count > 0 && (
                  <div className="mt-33">
                    <h3 className="mb-15 text-caption text-muted-foreground">individual readings</h3>
                    <ReadingSlots readings={data.daily.readings} />
                  </div>
                )}
              </>
            )}
          </ReportSection>

          <ReportSection
            id="mtd-report"
            title="Month to date"
            subtitle={data && `${formatShortDate(data.monthToDate.range.from)} – ${formatShortDate(data.monthToDate.range.to)}`}
          >
            {!data ? (
              <StatGridSkeleton />
            ) : (
              <StatGrid
                stats={data.monthToDate.stats}
                emptyTitle="No readings so far this month."
                emptyDescription="Readings from the 1st of the month up to the selected date appear here."
              />
            )}
          </ReportSection>

          <ReportSection
            id="monthly-report"
            title="Previous month"
            subtitle={data && formatMonth(data.monthly.month)}
          >
            {!data ? (
              <StatGridSkeleton />
            ) : (
              <StatGrid
                stats={data.monthly.stats}
                emptyTitle={`No readings in ${formatMonth(data.monthly.month)}.`}
                emptyDescription="The monthly report covers the entire calendar month before the selected date."
              />
            )}
          </ReportSection>
        </>
      )}
    </>
  )
}
