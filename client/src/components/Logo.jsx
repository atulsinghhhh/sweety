import { cn } from '@/lib/utils'

// Brand mark: a single drop with a hairline reading line — abstract, no medical symbol.
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6', className)}>
      <path d="M12 2.5c3.6 4.4 6.5 8.2 6.5 11.8a6.5 6.5 0 0 1-13 0C5.5 10.7 8.4 6.9 12 2.5Z" className="fill-leaf" />
      <path d="M8.5 15.5h7" strokeWidth="1.25" strokeLinecap="square" className="stroke-white" />
    </svg>
  )
}

export default function Logo({ className, markClassName }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-heading-sm lowercase text-foreground', className)}>
      <LogoMark className={markClassName} />
      sweety
    </span>
  )
}
