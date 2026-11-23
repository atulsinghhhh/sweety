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

  return (
    <>
      <PageHeader
        title="Readings"
        description="Record, correct or remove readings for any past day."
        actions={
          <>
            <DateSelector value={date} onChange={setDate} />
            <Button onClick={() => setFormState({ mode: 'add' })} disabled={dayFull} title={dayFull ? 'All four slots are filled' : undefined}>
              <Plus strokeWidth={1.25} /> Add reading
            </Button>
          </>
        }
      />

      <section aria-labelledby="day-readings">
        <div className="mb-15 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="day-readings" className="text-subheading">
            {formatDate(date, { weekday: 'long', month: 'long' })}
          </h2>
          {readings && (
            <span className="text-caption text-muted-foreground">
              {readings.length} of {MAX_READINGS_PER_DAY} readings
            </span>
          )}
        </div>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !readings ? (
          <ReadingSlotsSkeleton />
        ) : (
          <>
            <ReadingSlots
              readings={readings}
              onAdd={(slot) => setFormState({ mode: 'add', slot })}
              onEdit={(reading) => setFormState({ mode: 'edit', reading })}
              onDelete={setDeleting}
            />
            {readings.length === 0 && (
              <p className="mt-15 text-body text-muted-foreground">
                No readings for this day yet. Use “Add” next to a time slot to record one.
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
