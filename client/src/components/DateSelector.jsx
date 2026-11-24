import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      <Label htmlFor={id} className="pl-1 text-muted-foreground">
        Selected date
      </Label>
      <div className="flex items-center gap-2">
        <div className="flex h-11 items-center rounded-full border border-input bg-background p-1 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
          <Button variant="ghost" size="icon-sm" aria-label="Previous day" onClick={() => onChange(shiftDate(value, -1))}>
            <ChevronLeft strokeWidth={1.75} />
          </Button>
          <input
            id={id}
            type="date"
            value={value}
            max={today}
            onChange={handleInput}
            className="h-full w-[8.75rem] bg-transparent px-1 text-center text-[15px] tabular-nums outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next day"
            disabled={value >= today}
            onClick={() => onChange(shiftDate(value, 1))}
          >
            <ChevronRight strokeWidth={1.75} />
          </Button>
        </div>
        {value !== today && (
          <Button variant="secondary" size="sm" onClick={() => onChange(today)}>
            Today
          </Button>
        )}
      </div>
    </div>
  )
}
