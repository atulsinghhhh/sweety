import ReadingSlots from '@/components/ReadingSlots'
import StatGrid from '@/components/StatGrid'

// Static, clearly labelled illustration built from the real dashboard
// components. Values are invented samples, never a real user's data.
const SAMPLE_READINGS = [
  { id: 'sample-morning', slot: 'MORNING', value: 98 },
  { id: 'sample-breakfast', slot: 'AFTER_BREAKFAST', value: 142 },
  { id: 'sample-lunch', slot: 'AFTER_LUNCH', value: 156 },
  { id: 'sample-dinner', slot: 'AFTER_DINNER', value: 131 },
]

// Derived from SAMPLE_READINGS the same way the API computes them
const SAMPLE_STATS = {
  count: SAMPLE_READINGS.length,
  highest: Math.max(...SAMPLE_READINGS.map((r) => r.value)),
  lowest: Math.min(...SAMPLE_READINGS.map((r) => r.value)),
  average: Math.round((SAMPLE_READINGS.reduce((sum, r) => sum + r.value, 0) / SAMPLE_READINGS.length) * 10) / 10,
}

export default function DashboardPreview() {
  return (
    <figure className="relative">
      <div
        role="img"
        aria-label="Illustrative preview of the Sweety dashboard, showing a day's summary statistics and four reading slots with sample values."
        className="border border-steel bg-white"
      >
        <div aria-hidden="true">
          <div className="flex items-center justify-between border-b border-steel bg-canvas px-15 py-2.5">
            <div className="flex gap-1.5">
              <span className="size-2 bg-steel" />
              <span className="size-2 bg-steel" />
              <span className="size-2 bg-steel" />
            </div>
            <span className="text-caption text-muted-foreground">sweety · dashboard</span>
            <span className="w-8" />
          </div>

          {/* Preview is narrower than the real page: keep the stat grid at 2 columns */}
          <div className="p-15 sm:p-22 [&_dd]:text-[26px] sm:[&_dd]:text-[32px] [&_dl]:grid-cols-2 [&_dl>div]:bg-white">
            <p className="text-caption text-muted-foreground">day summary</p>
            <div className="mt-2">
              <StatGrid stats={SAMPLE_STATS} />
            </div>
            <p className="mt-22 text-caption text-muted-foreground">readings</p>
            <div className="mt-2 [&_li]:py-2.5">
              <ReadingSlots readings={SAMPLE_READINGS} />
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-caption text-muted-foreground">Illustrative preview · sample values</figcaption>
    </figure>
  )
}
