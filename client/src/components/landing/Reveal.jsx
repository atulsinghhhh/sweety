import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Fades content up the first time it scrolls into view. Users who prefer
// reduced motion (motion-safe variants) see it immediately, without animation.
export default function Reveal({ as: Tag = 'div', className, delay = 0, children, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (visible || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  return (
    <Tag
      ref={ref}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(
        visible
          ? 'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:fill-mode-both'
          : 'motion-safe:opacity-0',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
