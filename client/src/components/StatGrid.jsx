import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from './EmptyState'

export const STATS = [
  { key: 'count', label: 'total readings', unit: null },
  { key: 'highest', label: 'highest', unit: 'mg/dL' },
  { key: 'lowest', label: 'lowest', unit: 'mg/dL' },
  { key: 'average', label: 'average', unit: 'mg/dL' },
]

// A 1px gap over a hairline background draws the rules between cells at every breakpoint
export const GRID = 'grid grid-cols-2 gap-px border-t border-b border-t-ink border-b-steel bg-steel lg:grid-cols-4'
export const CELL = 'bg-background px-15 py-22 sm:px-22'

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
