// Kept apart from TrendChart so pages can show it without loading Recharts
export default function TrendLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-brand" /> Daily average
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="h-2.5 w-4 rounded-sm bg-brand/20" /> Lowest–highest
      </span>
    </div>
  )
}
