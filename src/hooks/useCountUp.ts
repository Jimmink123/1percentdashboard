import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './useMediaPreferences'

/** Animates a displayed integer from its previous value up (or down) to `target`. */
export function useCountUp(target: number, duration = 700): number {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(target)
  const prevTarget = useRef(target)

  useEffect(() => {
    if (prefersReducedMotion || prevTarget.current === target) {
      setValue(target)
      prevTarget.current = target
      return
    }

    const from = prevTarget.current
    const to = target
    const start = performance.now()
    let raf: number

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setValue(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        prevTarget.current = to
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, prefersReducedMotion])

  return value
}
