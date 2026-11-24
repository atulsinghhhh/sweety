import { useMemo } from 'react'
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { formatDate, formatShortDate } from '@/lib/dates'
import { dailySeries, formatValue } from '@/lib/stats'
import ChartTooltip from './ChartTooltip'

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 }

function TrendTooltip({ active, payload }) {
  const point = active && payload?.[0]?.payload
  if (!point) return null
  return (
    <ChartTooltip
      title={formatDate(point.date)}
      rows={
        point.count
          ? [
              ['Average', `${formatValue(point.average)} mg/dL`],
              ['Lowest', `${point.lowest} mg/dL`],
              ['Highest', `${point.highest} mg/dL`],
              ['Readings', point.count],
            ]
          : [['Readings', 'None recorded']]
      }
    />
  )
}

// Evenly spaced y-axis ticks on round numbers (50s, or 100s for wide ranges)
function roundTicks(values) {
  const span = Math.max(...values) - Math.min(...values)
  const step = span > 250 ? 100 : 50
  const low = Math.max(0, Math.floor((Math.min(...values) - 10) / step) * step)
  const high = Math.ceil((Math.max(...values) + 10) / step) * step
  return Array.from({ length: (high - low) / step + 1 }, (_, i) => low + i * step)
}

/**
 * Daily average (line) with the day's lowest–highest spread (band) for every
 * day from `from` to `to`. Days without readings stay empty — never invented.
 */
export default function TrendChart({ readings, from, to, height = 280 }) {
  const reduced = useReducedMotion()
  const data = useMemo(() => dailySeries(readings, from, to), [readings, from, to])
  const ticks = useMemo(() => roundTicks(readings.map((r) => r.value)), [readings])
  const longRange = data.length > 16

  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trend-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatShortDate(d)}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: 'var(--rule)' }}
            interval={longRange ? 'preserveStartEnd' : 1}
            minTickGap={16}
            tickMargin={10}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[ticks[0], ticks.at(-1)]}
            ticks={ticks}
          />
          <Tooltip
            content={<TrendTooltip />}
            cursor={{ stroke: 'var(--rule)', strokeWidth: 1 }}
            isAnimationActive={false}
          />
          <Area
            dataKey="range"
            stroke="none"
            fill="url(#trend-band)"
            connectNulls={false}
            isAnimationActive={!reduced}
            animationDuration={900}
            activeDot={false}
          />
          <Line
            dataKey="average"
            stroke="var(--brand)"
            strokeWidth={2}
            dot={{ r: longRange ? 0 : 3.5, fill: 'var(--brand)', stroke: 'var(--card)', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: 'var(--brand)', stroke: 'var(--card)', strokeWidth: 2 }}
            connectNulls
            isAnimationActive={!reduced}
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
