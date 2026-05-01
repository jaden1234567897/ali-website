'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const LINES = [
  { label: 'SUBJECT',    value: 'Ali Al-Ali' },
  { label: 'DOMAIN',     value: 'Strategy · Execution' },
  { label: 'DEPTH',      value: '0.0 m  ↓' },
  { label: 'STATUS',     value: 'READY' },
]

export default function IntroLoader({ onDone }: { onDone: () => void }) {
  const rootRef    = useRef<HTMLDivElement>(null)
  const lineRefs   = useRef<(HTMLDivElement | null)[]>([])
  const barRef     = useRef<HTMLDivElement>(null)
  const titleRef   = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false)
        onDone()
      },
    })

    // Title appears
    tl.fromTo(titleRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.2)

    // Lines stagger in
    lineRefs.current.forEach((el, i) => {
      if (!el) return
      tl.fromTo(el, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, 0.55 + i * 0.18)
    })

    // Progress bar fills
    tl.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power1.inOut' }, 0.4)

    // Hold briefly then fade out
    tl.to(rootRef.current, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, '+=0.25')
  }, [onDone])

  if (!visible) return null

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}
    >
      {/* Corner brackets — top left */}
      <div style={{ position: 'absolute', top: 32, left: 36 }}>
        <div style={{ width: 18, height: 18, borderTop: '1px solid rgba(34,211,238,0.4)', borderLeft: '1px solid rgba(34,211,238,0.4)' }} />
      </div>
      {/* Corner brackets — top right */}
      <div style={{ position: 'absolute', top: 32, right: 36 }}>
        <div style={{ width: 18, height: 18, borderTop: '1px solid rgba(34,211,238,0.4)', borderRight: '1px solid rgba(34,211,238,0.4)' }} />
      </div>
      {/* Corner brackets — bottom left */}
      <div style={{ position: 'absolute', bottom: 32, left: 36 }}>
        <div style={{ width: 18, height: 18, borderBottom: '1px solid rgba(34,211,238,0.4)', borderLeft: '1px solid rgba(34,211,238,0.4)' }} />
      </div>
      {/* Corner brackets — bottom right */}
      <div style={{ position: 'absolute', bottom: 32, right: 36 }}>
        <div style={{ width: 18, height: 18, borderBottom: '1px solid rgba(34,211,238,0.4)', borderRight: '1px solid rgba(34,211,238,0.4)' }} />
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {/* Title */}
        <div
          ref={titleRef}
          style={{ opacity: 0, textAlign: 'center', marginBottom: 48 }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.55em', textTransform: 'uppercase', color: 'rgba(34,211,238,0.7)', marginBottom: 14 }}>
            Connection Established
          </div>
          <div style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1 }}>
            Ali Al-Ali
          </div>
        </div>

        {/* Terminal lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
          {LINES.map((line, i) => (
            <div
              key={line.label}
              ref={el => { lineRefs.current[i] = el }}
              style={{
                opacity: 0,
                display: 'flex', alignItems: 'center', gap: 20,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: 10,
              }}
            >
              <span style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(34,211,238,0.5)', minWidth: 68 }}>
                {line.label}
              </span>
              <span style={{ fontSize: 12, letterSpacing: '0.15em', color: line.label === 'STATUS' ? 'var(--accent)' : 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
                {line.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div
          ref={barRef}
          style={{
            height: '100%', width: '100%',
            background: 'linear-gradient(to right, rgba(34,211,238,0.4), rgba(34,211,238,0.9))',
            transformOrigin: 'left center', transform: 'scaleX(0)',
          }}
        />
      </div>
    </div>
  )
}
