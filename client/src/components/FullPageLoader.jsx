export default function FullPageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center" role="status" aria-live="polite">
      <span className="text-caption text-muted-foreground">loading…</span>
    </div>
  )
}
