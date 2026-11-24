import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

// Tracks the OS "reduce motion" setting, for animations driven from JS (charts)
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const onChange = (event) => setReduced(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}
