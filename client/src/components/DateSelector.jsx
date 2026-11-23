import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isValidDateString, shiftDate, todayLocal } from '@/lib/dates'

export default function DateSelector({ value, onChange, id = 'selected-date' }) {
  const today = todayLocal()

  const handleInput = (event) => {
    const next = event.target.value
    if (isValidDateString(next) && next <= today) onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-caption text-muted-foreground">
        selected date
      </Label>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous day"
          onClick={() => onChange(shiftDate(value, -1))}
          className="border-r-0"
        >
          <ChevronLeft strokeWidth={1.25} />
        </Button>
        <Input id={id} type="date" value={value} max={today} onChange={handleInput} className="w-44" />
        <Button
          variant="outline"
          size="icon"
          aria-label="Next day"
          disabled={value >= today}
          onClick={() => onChange(shiftDate(value, 1))}
          className="border-l-0"
        >
          <ChevronRight strokeWidth={1.25} />
        </Button>
        {value !== today && (
          <Button variant="link" size="sm" onClick={() => onChange(today)} className="text-link">
            today
          </Button>
        )}
      </div>
    </div>
  )
}
