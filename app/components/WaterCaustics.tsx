'use client'
import { useEffect, useRef } from 'react'

export default function WaterCaustics() {
  const turbRef = useRef<SVGFETurbulenceElement>(null)

  useEffect(() => {
    const el = turbRef.current
    if (!el) return
    let t = 0
    let raf: number
    const tick = () => {
      t += 0.0025
      const bx = (0.018 + Math.sin(t * 0.7)  * 0.007).toFixed(5)
      const by = (0.013 + Math.cos(t * 0.5)  * 0.005).toFixed(5)
      el.setAttribute('baseFrequency', `${bx} ${by}`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', overflow: 'hidden',
        zIndex: 2, mixBlendMode: 'screen',
      }}
    >
      {/* Animated SVG turbulence filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="caustic-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.018 0.013"
              numOctaves="4"
              seed="7"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.08
                      0 0 0 0 0.72
                      0 0 0 0 0.88
                      0 0 0 0.15 0"
            />
          </filter>
        </defs>
      </svg>

      {/* SVG-filtered caustic texture */}
      <div
        style={{
          position: 'absolute', inset: 0,
          filter: 'url(#caustic-filter)',
          animation: 'water-shimmer 7s ease-in-out infinite',
        }}
      />

      {/* Drifting light patch A — large, slow */}
      <div
        style={{
          position: 'absolute', inset: '-60%',
          background: `
            radial-gradient(ellipse 85% 65% at 25% 35%, rgba(34,211,238,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 70% 85% at 75% 65%, rgba(34,211,238,0.05) 0%, transparent 55%),
            radial-gradient(ellipse 55% 55% at 50% 20%, rgba(103,232,249,0.04) 0%, transparent 50%)
          `,
          animation: 'caustic-a 14s ease-in-out infinite',
        }}
      />

      {/* Drifting light patch B — smaller, faster */}
      <div
        style={{
          position: 'absolute', inset: '-60%',
          background: `
            radial-gradient(ellipse 75% 55% at 65% 25%, rgba(34,211,238,0.05) 0%, transparent 55%),
            radial-gradient(ellipse 55% 75% at 35% 75%, rgba(34,211,238,0.06) 0%, transparent 55%)
          `,
          animation: 'caustic-b 19s ease-in-out infinite',
          opacity: 0.9,
        }}
      />

      {/* Fine shimmer layer */}
      <div
        style={{
          position: 'absolute', inset: '-40%',
          background: `
            radial-gradient(ellipse 40% 30% at 60% 40%, rgba(34,211,238,0.04) 0%, transparent 50%),
            radial-gradient(ellipse 35% 40% at 40% 60%, rgba(34,211,238,0.03) 0%, transparent 45%)
          `,
          animation: 'caustic-c 9s ease-in-out infinite',
        }}
      />
    </div>
  )
}
