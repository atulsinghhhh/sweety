import { cn } from '@/lib/utils'

// Raised content card used across the app: optional eyebrow/title header with
// something on the right (a link, a legend), then the body.
export default function Panel({ id, eyebrow, title, aside, className, delay = 0, children }) {
  return (
    <section
      aria-labelledby={title ? id : undefined}
      style={{ '--delay': `${delay}ms` }}
      className={cn('animate-rise rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7', className)}
    >
      {(title || aside) && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div>
            {eyebrow && <p className="eyebrow text-muted-foreground">{eyebrow}</p>}
            {title && (
              <h2 id={id} className="mt-1 font-display text-[26px] leading-tight">
                {title}
              </h2>
            )}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}
