import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api, { getErrorField, getErrorMessage } from '@/lib/api'
import { isValidDateString, todayLocal } from '@/lib/dates'
import { SLOTS, validateReadingForm } from '@/lib/readings'
import FormField from './FormField'
import { SLOT_META } from './slotMeta'

function SlotIcon({ slot }) {
  const Icon = SLOT_META[slot].icon
  return <Icon strokeWidth={1.5} className="text-brand-ink" aria-hidden="true" />
}

function initialForm(reading, defaults) {
  if (reading) return { readingDate: reading.readingDate, slot: reading.slot, value: String(reading.value) }
  return { readingDate: defaults?.readingDate || todayLocal(), slot: defaults?.slot || '', value: '' }
}

/**
 * Add (no `reading`) or edit a reading. Loads the chosen date's readings so
 * taken slots and the daily limit are flagged before submitting; the API
 * re-checks everything.
 */
export default function ReadingFormDialog({ open, onOpenChange, reading, defaults, onSaved, onConflict }) {
  const isEdit = Boolean(reading)
  const [form, setForm] = useState(() => initialForm(reading, defaults))
  const [errors, setErrors] = useState({})
  const [otherSlots, setOtherSlots] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialForm(reading, defaults))
      setErrors({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reading?.id, defaults?.readingDate, defaults?.slot])

  useEffect(() => {
    if (!open || !isValidDateString(form.readingDate)) {
      setOtherSlots([])
      return
    }
    let active = true
    api
      .get('/readings', { params: { date: form.readingDate } })
      .then((res) => {
        if (!active) return
        setOtherSlots(res.data.readings.filter((r) => r.id !== reading?.id).map((r) => r.slot))
      })
      .catch(() => active && setOtherSlots([]))
    return () => {
      active = false
    }
  }, [open, form.readingDate, reading?.id])

  const update = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateReadingForm(form, otherSlots)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    setSubmitting(true)
    const payload = { readingDate: form.readingDate, slot: form.slot, value: Number(form.value.trim()) }
    try {
      const res = isEdit ? await api.put(`/readings/${reading.id}`, payload) : await api.post('/readings', payload)
      toast.success(isEdit ? 'Reading updated.' : 'Reading added.')
      onOpenChange(false)
      onSaved?.(res.data.reading)
    } catch (err) {
      const field = getErrorField(err)
      // 409 means the day changed elsewhere (another tab/device): refresh what's shown
      if (err.response?.status === 409) onConflict?.()
      if (field) setErrors({ [field]: getErrorMessage(err) })
      else toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const dayFull = otherSlots.length >= SLOTS.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="eyebrow text-brand-ink">{isEdit ? 'Edit' : 'New entry'}</p>
          <DialogTitle>{isEdit ? 'Edit reading' : 'Add reading'}</DialogTitle>
          <DialogDescription>Up to four readings a day — one per time slot.</DialogDescription>
        </DialogHeader>

        <form id="reading-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField id="reading-date" label="Date" error={errors.readingDate}>
            {(aria) => (
              <Input
                {...aria}
                type="date"
                max={todayLocal()}
                value={form.readingDate}
                onChange={(e) => update('readingDate')(e.target.value)}
              />
            )}
          </FormField>

          <FormField
            id="reading-slot"
            label="Time slot"
            error={errors.slot}
            hint={dayFull && !errors.readingDate ? 'All four slots are filled for this date.' : undefined}
          >
            {(aria) => (
              <Select value={form.slot || undefined} onValueChange={update('slot')}>
                <SelectTrigger {...aria} className="w-full">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {SLOTS.map((slot) => {
                    const taken = otherSlots.includes(slot.value)
                    return (
                      <SelectItem key={slot.value} value={slot.value} disabled={taken}>
                        <SlotIcon slot={slot.value} />
                        {slot.label}
                        {taken && <span className="text-muted-foreground"> — recorded</span>}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField id="reading-value" label="Glucose (mg/dL)" error={errors.value} hint="Whole number from 40 to 600.">
            {(aria) => (
              <Input
                {...aria}
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 110"
                className="h-14 font-display text-[26px] tabular-nums md:text-[26px]"
                value={form.value}
                onChange={(e) => update('value')(e.target.value)}
              />
            )}
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="reading-form" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add reading'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
