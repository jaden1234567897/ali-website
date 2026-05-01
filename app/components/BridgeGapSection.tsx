'use client'

import { useEffect, useRef } from 'react'

const stops = [
  { key: 1, start: 0.31, peak: 0.36, hold: 0.41, end: 0.48 },
  { key: 2, start: 0.66, peak: 0.72, hold: 0.77, end: 0.84 },
  { key: 3, start: 0.88, peak: 0.94, hold: 1.02, end: 1.08 },
]

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

function mix(a: number, b: number, progress: number) {
  return a + (b - a) * progress
}

function wordVisibility(progress: number, start: number, peak: number, hold: number, end: number) {
  if (progress <= start || progress >= end) return 0
  if (progress <= peak) return smoothstep(start, peak, progress)
  if (progress <= hold) return 1
  return 1 - smoothstep(hold, end, progress)
}

function routeX(progress: number, mobile: boolean) {
  const left = mobile ? -0.012 : -0.19
  const right = mobile ? 0.012 : 0.19

  if (progress < 0.34) return mix(0, left, smoothstep(0, 0.34, progress))
  if (progress < 0.72) return mix(left, right, smoothstep(0.34, 0.72, progress))
  return mix(right, 0, smoothstep(0.72, 1, progress))
}

function routeY(progress: number, mobile: boolean) {
  const leftDrop = mobile ? 0.004 : 0.026
  const rightLift = mobile ? -0.005 : -0.026
  const centerDrop = mobile ? 0.002 : 0.01

  if (progress < 0.34) return mix(0, leftDrop, smoothstep(0, 0.34, progress))
  if (progress < 0.72) return mix(leftDrop, rightLift, smoothstep(0.34, 0.72, progress))
  return mix(rightLift, centerDrop, smoothstep(0.72, 1, progress))
}

export default function BridgeGapSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const update = () => {
      const sectionHeight = Math.max(1, section.offsetHeight)
      const progress = clamp((window.innerHeight - section.getBoundingClientRect().top) / sectionHeight)
      const mobile = window.innerWidth < 760

      section.style.setProperty('--motion-progress', progress.toFixed(4))
      section.style.setProperty('--motion-detach', smoothstep(0, 0.18, progress).toFixed(4))
      section.style.setProperty('--motion-x', `${(routeX(progress, mobile) * 100).toFixed(3)}vw`)
      section.style.setProperty('--motion-y', `${(routeY(progress, mobile) * 100).toFixed(3)}vh`)

      stops.forEach(stop => {
        section.style.setProperty(
          `--word-${stop.key}`,
          wordVisibility(progress, stop.start, stop.peak, stop.hold, stop.end).toFixed(4),
        )
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bridge-section coin-motion-section"
      id="about"
      data-coins="front"
      aria-label="Strategy governance execution coin motion"
    >
      <div className="coin-motion-sticky">
        <div className="coin-motion-overlay" aria-hidden="true">
          <div className="coin-motion-system">
            <div className="coin-motion-word word-governance">Governance</div>
            <div className="coin-motion-word word-execution">Execution</div>
            <div className="coin-motion-word word-strategy">Strategy</div>
          </div>
        </div>
      </div>
    </section>
  )
}
