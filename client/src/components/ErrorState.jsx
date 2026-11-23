import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-15 border-y border-steel py-33">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 fill-warning text-ink" strokeWidth={1.25} />
        <p className="text-body">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
