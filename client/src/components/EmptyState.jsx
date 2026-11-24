import { Sprout } from 'lucide-react'

export default function EmptyState({ title, description, action, icon: Icon = Sprout }) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-3xl border border-dashed border-rule bg-paper/50 p-6 sm:flex-row sm:items-center sm:p-8">
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
        <Icon strokeWidth={1.5} className="size-5" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="font-display text-[22px] leading-snug">{title}</p>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
