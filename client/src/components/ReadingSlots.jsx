import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SLOTS } from '@/lib/readings'
import { cn } from '@/lib/utils'
import { SLOT_META } from './slotMeta'

const GRID = 'grid gap-3 sm:grid-cols-2 sm:gap-4'

export function ReadingSlotsSkeleton({ columns = 'xl:grid-cols-4' }) {
  return (
    <ul className={cn(GRID, columns)}>
      {SLOTS.map((slot) => (
        <li key={slot.value} className="flex min-h-52 flex-col justify-between rounded-3xl border border-border bg-card shadow-soft p-5">
          <Skeleton className="size-10 rounded-full bg-paper-deep" />
          <Skeleton className="h-10 w-24 bg-paper-deep" />
        </li>
      ))}
    </ul>
  )
}

/**
 * One card per slot, in day order. Without handlers it renders read-only.
 * `activeSlot` highlights the slot currently open in the add/edit dialog.
 */
export default function ReadingSlots({ readings, onAdd, onEdit, onDelete, activeSlot, columns = 'xl:grid-cols-4', className }) {
  const bySlot = Object.fromEntries(readings.map((reading) => [reading.slot, reading]))
  const editable = Boolean(onAdd || onEdit || onDelete)

  return (
    <ul className={cn(GRID, columns, className)}>
      {SLOTS.map((slot, index) => {
        const reading = bySlot[slot.value]
        const { icon: Icon, hint } = SLOT_META[slot.value]
        const active = activeSlot === slot.value
        return (
          <li
            key={slot.value}
            style={{ '--delay': `${index * 60}ms` }}
            className={cn(
              'animate-rise relative flex flex-col gap-5 rounded-3xl p-5 transition-[background-color,box-shadow] duration-300',
              reading ? 'border border-border bg-card shadow-soft' : 'border border-dashed border-rule bg-paper/40',
              active && 'bg-card shadow-glow ring-2 ring-brand',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
                  reading ? 'bg-brand-soft text-brand-ink' : 'bg-paper text-muted-foreground',
                )}
              >
                <Icon strokeWidth={1.5} className="size-5" />
              </span>
              {active ? (
                <span className="rounded-full bg-brand px-2.5 py-1 text-[12px] font-semibold text-on-brand">Editing</span>
              ) : reading ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand-ink">
                  <Check strokeWidth={2.25} className="size-3" aria-hidden="true" /> Recorded
                </span>
              ) : (
                <span className="rounded-full bg-paper px-2.5 py-1 text-[12px] font-semibold text-muted-foreground">
                  Not recorded
                </span>
              )}
            </div>

            <div>
              <p className="font-semibold">{slot.label}</p>
              <p className="text-[13px] text-muted-foreground">{hint}</p>
            </div>

            <p className="flex items-baseline gap-1.5">
              {reading ? (
                <>
                  <span className="font-display text-heading-lg leading-none tabular-nums">{reading.value}</span>
                  <span className="text-[13px] text-muted-foreground">mg/dL</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true" className="font-display text-heading-lg leading-none text-rule">
                    —
                  </span>
                  <span className="sr-only">No reading</span>
                </>
              )}
            </p>

            {editable && (
              <div className="mt-auto flex flex-wrap gap-2">
                {reading ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => onEdit(reading)} aria-label={`Edit ${slot.label} reading`}>
                      <Pencil strokeWidth={1.75} /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(reading)}
                      aria-label={`Delete ${slot.label} reading`}
                    >
                      <Trash2 strokeWidth={1.75} /> Delete
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => onAdd(slot.value)} aria-label={`Add ${slot.label} reading`}>
                    <Plus strokeWidth={1.75} /> Add reading
                  </Button>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
