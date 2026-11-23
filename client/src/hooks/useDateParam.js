import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isValidDateString, todayLocal } from '@/lib/dates'

// Keeps the selected date in the URL (?date=YYYY-MM-DD) so it survives reloads
// and carries across pages. Invalid or future values fall back to today.
export function useDateParam() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('date')
  const today = todayLocal()
  const date = raw && isValidDateString(raw) && raw <= today ? raw : today

  const setDate = useCallback(
    (next) =>
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev)
          updated.set('date', next)
          return updated
        },
        { replace: true },
      ),
    [setParams],
  )

  return [date, setDate]
}
