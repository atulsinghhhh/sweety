import { useEffect, useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

const format = (value, decimals) =>
  value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

// Same curve as EASE in ./motion ([0.22, 1, 0.36, 1]), approximated as ease-out-quint
const easeOutQuint = (t) => 1 - (1 - t) ** 5

/**
 * Counts from 0 to `value` once it scrolls into view. The final value is
 * rendered invisibly to reserve its width, so counting never shifts layout.
 * A small requestAnimationFrame tween writes the text directly — no React
 * re-renders, and none of Motion's heavier animate() engine in the bundle.
 */
export default function CountUp({ value, decimals = 0, duration = 1.2, delay = 0 }) {
  const ref = useRef(null)
  const textRef = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isInView || reduceMotion || !textRef.current) return
    const node = textRef.current
    let frame
    let start
    const tick = (now) => {
      start ??= now + delay * 1000
      const t = Math.min(1, Math.max(0, (now - start) / (duration * 1000)))
      node.textContent = format(value * easeOutQuint(t), decimals)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    node.textContent = format(0, decimals)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isInView, reduceMotion, value, decimals, duration, delay])

  return (
    <span ref={ref} className="relative inline-block tabular-nums">
      <span className="invisible">{format(value, decimals)}</span>
      {/* Starts at the final value: correct with reduced motion, without JS, or before it scrolls into view */}
      <span ref={textRef} className="absolute inset-0">
        {format(value, decimals)}
      </span>
    </span>
  )
}
