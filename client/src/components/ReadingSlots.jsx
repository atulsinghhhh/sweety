import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SLOTS } from '@/lib/readings'

export function ReadingSlotsSkeleton() {
  return (
    <ul className="border-t border-ink">
      {SLOTS.map((slot) => (
        <li key={slot.value} className="flex items-center justify-between border-b border-steel py-15">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16" />
        </li>
      ))}
    </ul>
  )
}

// One row per slot, in day order. Without handlers it renders read-only.
export default function ReadingSlots({ readings, onAdd, onEdit, onDelete }) {
  const bySlot = Object.fromEntries(readings.map((reading) => [reading.slot, reading]))
  const editable = Boolean(onAdd || onEdit || onDelete)

  return (
    <ul className="border-t border-ink">
      {SLOTS.map((slot) => {
        const reading = bySlot[slot.value]
        return (
          <li
            key={slot.value}
            className="grid grid-cols-[1fr_auto] items-center gap-x-15 border-b border-steel py-15 sm:grid-cols-[1fr_auto_auto]"
          >
            <span className="text-body">{slot.label}</span>

            {reading ? (
              <span className="text-heading-sm font-light tabular-nums">
                {reading.value}
                <span className="ml-1.5 text-caption font-light text-muted-foreground">mg/dL</span>
              </span>
            ) : (
              <span className="text-caption text-muted-foreground">no reading</span>
            )}

            {editable && (
              <div className="col-span-2 flex justify-end gap-1 sm:col-span-1 sm:w-48">
                {reading ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(reading)} aria-label={`Edit ${slot.label} reading`}>
                      <Pencil strokeWidth={1.25} /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(reading)}
                      aria-label={`Delete ${slot.label} reading`}
                    >
                      <Trash2 strokeWidth={1.25} /> Delete
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onAdd(slot.value)} aria-label={`Add ${slot.label} reading`}>
                    <Plus strokeWidth={1.25} /> Add
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
