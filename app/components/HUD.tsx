'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Fixed HUD overlay — appears after the site loader completes.
 * Replicates the reference site's compass/globe element:
 * - Circular dashed ring with NESW tick lines
 * - Inner rotating arc
 * - Scroll-driven progress indicator
 */
export default function HUD({ visible }: { visible: boolean }) {
  const hudRef      = useRef<HTMLDivElement>(null)
  const arcRef      = useRef<SVGCircleElement>(null)
  const rotatorRef  = useRef<SVGGElement>(null)

  // Fade in when visible
  useEffect(() => {
    if (!visible) return
    gsap.to(hudRef.current, { autoAlpha: 1, duration: 0.8, delay: 0.4, ease: 'power2.out' })
  }, [visible])

  // Arc fills with scroll progress
  useEffect(() => {
    if (!arcRef.current) return
    const CIRC = 2 * Math.PI * 36 // r=36

    const st = ScrollTrigger.create({
      trigger: 'body',
      start:   'top top',
      end:     'bottom bottom',
      scrub:   true,
      onUpdate: self => {
        if (arcRef.current) {
          arcRef.current.style.strokeDashoffset = `${CIRC * (1 - self.progress)}`
        }
      },
    })

    return () => st.kill()
  }, [])

  // Slow rotation of inner element
  useEffect(() => {
    if (!rotatorRef.current) return
    gsap.to(rotatorRef.current, {
      rotation: 360,
      duration: 18,
      ease: 'none',
      repeat: -1,
      transformOrigin: '48px 48px',
    })
  }, [])

  const CIRC = 2 * Math.PI * 36

  return (
    <div
      ref={hudRef}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 'var(--section-x)',
        zIndex: 50,
        opacity: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        {/* NESW tick lines */}
        <line x1="48" y1="2"  x2="48" y2="10" stroke="rgba(148,230,251,0.25)" strokeWidth="1" />
        <line x1="48" y1="86" x2="48" y2="94" stroke="rgba(148,230,251,0.25)" strokeWidth="1" />
        <line x1="2"  y1="48" x2="10" y2="48" stroke="rgba(148,230,251,0.25)" strokeWidth="1" />
        <line x1="86" y1="48" x2="94" y2="48" stroke="rgba(148,230,251,0.25)" strokeWidth="1" />

        {/* Outer guide ring */}
        <circle cx="48" cy="48" r="44" stroke="rgba(148,230,251,0.07)" strokeWidth="1" fill="none" />

        {/* Dashed track */}
        <circle
          cx="48" cy="48" r="36"
          stroke="rgba(229,250,255,0.1)"
          strokeWidth="4" fill="none"
          strokeDasharray="2 5"
        />

        {/* Progress arc — filled by scroll */}
        <circle
          ref={arcRef}
          cx="48" cy="48" r="36"
          stroke="#94E6FB"
          strokeWidth="4" fill="none"
          strokeDasharray={`${CIRC}`}
          strokeDashoffset={`${CIRC}`}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }}
        />

        {/* Rotating inner element */}
        <g ref={rotatorRef}>
          <circle cx="48" cy="13" r="2" fill="#94E6FB" opacity="0.7" />
          <line
            x1="48" y1="15" x2="48" y2="26"
            stroke="rgba(148,230,251,0.3)" strokeWidth="1"
            strokeDasharray="1 3"
          />
        </g>

        {/* Centre dot */}
        <circle cx="48" cy="48" r="2.5" fill="rgba(148,230,251,0.5)" />

        {/* Cardinal labels */}
        <text x="48" y="8.5"  textAnchor="middle" fill="rgba(148,230,251,0.4)" fontSize="5.5" fontFamily="'Rajdhani', monospace" fontWeight="600" letterSpacing="0.05em">N</text>
        <text x="48" y="92"  textAnchor="middle" fill="rgba(148,230,251,0.4)" fontSize="5.5" fontFamily="'Rajdhani', monospace" fontWeight="600" letterSpacing="0.05em">S</text>
        <text x="6"  y="50"  textAnchor="middle" fill="rgba(148,230,251,0.4)" fontSize="5.5" fontFamily="'Rajdhani', monospace" fontWeight="600" letterSpacing="0.05em">W</text>
        <text x="90" y="50"  textAnchor="middle" fill="rgba(148,230,251,0.4)" fontSize="5.5" fontFamily="'Rajdhani', monospace" fontWeight="600" letterSpacing="0.05em">E</text>
      </svg>
    </div>
  )
}
