import { RotateCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-5 rounded-3xl border border-destructive/30 bg-destructive/5 p-6 sm:flex-row sm:items-center sm:p-8"
    >
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert strokeWidth={1.5} className="size-5" aria-hidden="true" />
      </span>
      <p className="flex-1">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw strokeWidth={1.75} /> Try again
        </Button>
      )}
    </div>
  )
}
