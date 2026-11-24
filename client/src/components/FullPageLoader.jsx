import { LogoMark } from './Logo'

export default function FullPageLoader() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <LogoMark className="size-8 animate-pulse" />
      <span className="text-[13px] text-muted-foreground">Loading…</span>
    </div>
  )
}
