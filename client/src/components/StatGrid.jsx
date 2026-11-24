import { Skeleton } from '@/components/ui/skeleton'
import { CELL, GRID, STATS } from '@/components/statGridLayout'
import EmptyState from './EmptyState'

export function StatGridSkeleton() {
  return (
    <div className={GRID}>
      {STATS.map((stat) => (
        <div key={stat.key} className={CELL}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-10 w-24" />
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
      {STATS.map((stat) => (
        <div key={stat.key} className={CELL}>
          <dt className="text-caption text-muted-foreground">{stat.label}</dt>
          <dd className="mt-1 text-heading-lg font-thin tabular-nums">
            {stats[stat.key].toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            {stat.unit && <span className="ml-1.5 text-caption font-light text-muted-foreground">{stat.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
