// Shared tooltip card for every chart: values in text tokens, never series colour
export default function ChartTooltip({ title, rows }) {
  return (
    <div className="min-w-40 rounded-2xl border border-border bg-popover px-4 py-3 text-popover-foreground shadow-glow">
      <p className="text-[13px] font-semibold">{title}</p>
      <dl className="mt-1.5 space-y-0.5 text-[13px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
