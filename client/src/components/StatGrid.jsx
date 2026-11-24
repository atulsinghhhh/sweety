import { Skeleton } from '@/components/ui/skeleton'
import { GRID, STATS } from '@/components/statGridLayout'
import { formatValue } from '@/lib/stats'
import { cn } from '@/lib/utils'
import EmptyState from './EmptyState'

export function StatCard({ stat, value, index = 0, className }) {
  const Icon = stat.icon
  return (
    <div
      style={{ '--delay': `${index * 60}ms` }}
      className={cn(
        'animate-rise flex min-h-36 flex-col justify-between gap-6 rounded-3xl p-5 sm:p-6',
        stat.featured ? 'bg-foreground text-background' : 'bg-paper text-foreground',
        className,
      )}
    >
      <dt className="flex items-center justify-between gap-2">
        <span className={cn('eyebrow', stat.featured ? 'opacity-75' : 'text-muted-foreground')}>{stat.label}</span>
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-full',
            stat.featured ? 'bg-seal text-on-seal' : 'bg-background text-seal-ink',
          )}
        >
          <Icon strokeWidth={1.75} className="size-4" />
        </span>
      </dt>
      <dd className="flex items-baseline gap-1.5">
        <span className="font-display text-[40px] leading-none tabular-nums sm:text-heading-lg">{value}</span>
        {stat.unit && <span className={cn('text-[13px]', stat.featured ? 'opacity-75' : 'text-muted-foreground')}>{stat.unit}</span>}
      </dd>
    </div>
  )
}

export function StatGridSkeleton() {
  return (
    <div className={GRID}>
      {STATS.map((stat) => (
        <div key={stat.key} className="flex min-h-36 flex-col justify-between rounded-3xl bg-paper p-5 sm:p-6">
          <Skeleton className="h-3 w-20 bg-paper-deep" />
          <Skeleton className="h-10 w-24 bg-paper-deep" />
        </div>
      ))}
    </div>
  )
}

export default function StatGrid({ stats, emptyTitle, emptyDescription, emptyAction }) {
  if (!stats || stats.count === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  }

  return (
    <dl className={GRID}>
      {STATS.map((stat, index) => (
        <StatCard key={stat.key} stat={stat} index={index} value={formatValue(stats[stat.key])} />
      ))}
    </dl>
  )
}
