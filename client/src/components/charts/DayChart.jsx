import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SLOTS } from '@/lib/readings'
import { SLOT_META } from '@/components/slotMeta'
import ChartTooltip from './ChartTooltip'

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 }

function DayTooltip({ active, payload }) {
  const point = active && payload?.[0]?.payload
  if (!point) return null
  return <ChartTooltip title={point.label} rows={[['Reading', point.value == null ? 'Not recorded' : `${point.value} mg/dL`]]} />
}

// One bar per time slot for a single day; empty slots show no bar.
export default function DayChart({ readings, height = 260 }) {
  const reduced = useReducedMotion()
  const bySlot = Object.fromEntries(readings.map((r) => [r.slot, r.value]))
  const data = SLOTS.map((slot) => ({
    slot: SLOT_META[slot.value].short,
    label: slot.label,
    value: bySlot[slot.value] ?? null,
  }))

  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="slot" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--taupe)' }} tickMargin={10} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} allowDecimals={false} domain={[0, (max) => Math.ceil((max + 30) / 50) * 50]} />
          <Tooltip content={<DayTooltip />} cursor={{ fill: 'var(--paper)' }} isAnimationActive={false} />
          <Bar
            dataKey="value"
            fill="var(--seal)"
            radius={[4, 4, 0, 0]}
            maxBarSize={56}
            isAnimationActive={!reduced}
            animationDuration={800}
          >
            <LabelList dataKey="value" position="top" offset={8} fill="var(--foreground)" fontSize={13} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
