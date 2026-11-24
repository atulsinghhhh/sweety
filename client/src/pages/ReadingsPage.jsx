import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DateSelector from '@/components/DateSelector'
import DeleteReadingDialog from '@/components/DeleteReadingDialog'
import ErrorState from '@/components/ErrorState'
import PageHeader from '@/components/PageHeader'
import ReadingFormDialog from '@/components/ReadingFormDialog'
import ReadingSlots, { ReadingSlotsSkeleton } from '@/components/ReadingSlots'
import { useAsync } from '@/hooks/useAsync'
import { useDateParam } from '@/hooks/useDateParam'
import api from '@/lib/api'
import { formatDate } from '@/lib/dates'
import { MAX_READINGS_PER_DAY } from '@/lib/readings'
import { cn } from '@/lib/utils'

function DayProgress({ count }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: MAX_READINGS_PER_DAY }, (_, i) => (
          <span
            key={i}
            className={cn('h-1.5 w-7 rounded-full transition-colors duration-500', i < count ? 'bg-seal' : 'bg-paper-deep')}
          />
        ))}
      </div>
      <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">
        {count} of {MAX_READINGS_PER_DAY} readings
      </span>
    </div>
  )
}

export default function ReadingsPage() {
  const [date, setDate] = useDateParam()
  // { mode: 'add', slot } | { mode: 'edit', reading } | null
  const [formState, setFormState] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data: readings, error, reload } = useAsync(
    () => api.get('/readings', { params: { date } }).then((r) => r.data.readings),
    [date],
  )

  const dayFull = readings?.length >= MAX_READINGS_PER_DAY
  const activeSlot = formState?.mode === 'edit' ? formState.reading.slot : formState?.slot

  return (
    <>
      <PageHeader
        eyebrow="Readings"
        title={
          <>
            Your day, in four <em>moments</em>.
          </>
        }
        description="Record, correct or remove readings for any past day."
        actions={
          <>
            <DateSelector value={date} onChange={setDate} />
            <Button
              size="lg"
              onClick={() => setFormState({ mode: 'add' })}
              disabled={dayFull}
              title={dayFull ? 'All four slots are filled' : undefined}
            >
              <Plus strokeWidth={2} /> Add reading
            </Button>
          </>
        }
      />

      <section aria-labelledby="day-readings">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 id="day-readings" className="font-display text-[26px] leading-tight">
            {formatDate(date, { weekday: 'long', month: 'long' })}
          </h2>
          {readings && <DayProgress count={readings.length} />}
        </div>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !readings ? (
          <ReadingSlotsSkeleton />
        ) : (
          <>
            <ReadingSlots
              readings={readings}
              activeSlot={activeSlot}
              onAdd={(slot) => setFormState({ mode: 'add', slot })}
              onEdit={(reading) => setFormState({ mode: 'edit', reading })}
              onDelete={setDeleting}
            />
            {readings.length === 0 && (
              <p className="mt-5 text-muted-foreground">
                No readings for this day yet. Use “Add reading” on a time slot to record one.
              </p>
            )}
          </>
        )}
      </section>

      <ReadingFormDialog
        open={Boolean(formState)}
        onOpenChange={(open) => !open && setFormState(null)}
        reading={formState?.mode === 'edit' ? formState.reading : undefined}
        defaults={{ readingDate: date, slot: formState?.slot }}
        onSaved={(saved) => (saved.readingDate === date ? reload() : setDate(saved.readingDate))}
        onConflict={reload}
      />
      <DeleteReadingDialog reading={deleting} onOpenChange={(open) => !open && setDeleting(null)} onDeleted={reload} />
    </>
  )
}
