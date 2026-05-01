'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface Props {
  onDone: () => void
}

const DETAILS = [
  { label: 'Status',   initial: 'Initializing', resolved: 'Ready' },
  { label: 'Domain',   initial: 'Loading',      resolved: 'Strategy & Execution' },
  { label: 'Region',   initial: 'Locating',     resolved: 'GCC & MENA' },
]

const COPYRIGHT = ['Ali Al-Ali', 'Strategy Execution', '© 2025']

// SVG circumference for r=84.5
const R = 84.5
const CIRC = 2 * Math.PI * R

export default function SiteLoader({ onDone }: Props) {
  const rootRef    = useRef<HTMLDivElement>(null)
  const phase1Ref  = useRef<HTMLDivElement>(null)
  const phase2Ref  = useRef<HTMLDivElement>(null)

  // Phase 1 refs
  const detailRefs  = useRef<(HTMLSpanElement | null)[]>([])
  const valueRefs   = useRef<(HTMLSpanElement | null)[]>([])
  const dotsRefs    = useRef<(HTMLSpanElement[][] )>([[], [], []])
  const copyRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const progressRef = useRef<SVGCircleElement>(null)
  const outerGroupRef = useRef<HTMLDivElement>(null)
  const labelRefs   = useRef<(HTMLSpanElement | null)[]>([])
  const loadingTxtRef   = useRef<HTMLDivElement>(null)
  const connectedTxtRef = useRef<HTMLDivElement>(null)

  // Phase 2 refs
  const logoRef     = useRef<HTMLDivElement>(null)
  const line1Ref    = useRef<HTMLSpanElement>(null)
  const line2Ref    = useRef<HTMLSpanElement>(null)
  const subRef      = useRef<HTMLSpanElement>(null)
  const btnRef      = useRef<HTMLButtonElement>(null)
  // 8 border segments: top-l, top-r, right-t, right-b, bottom-r, bottom-l, left-b, left-t
  const segRefs     = useRef<(HTMLSpanElement | null)[]>([])

  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const tl = gsap.timeline()

    // ─── PHASE 1 ──────────────────────────────────────────────────────────────

    // Outer progress group fades in
    tl.to(outerGroupRef.current, { opacity: 1, duration: 0.4 }, 0.15)

    // Detail lines appear + dots animate + resolve
    DETAILS.forEach((d, i) => {
      const base = 0.4 + i * 0.9
      const el   = detailRefs.current[i]
      const valEl = valueRefs.current[i]
      const dots  = dotsRefs.current[i]

      // Line appears
      tl.to(el, { autoAlpha: 1, duration: 0.01 }, base)

      // Dots blink in one by one
      dots.forEach((dot, j) => {
        tl.to(dot, { autoAlpha: 1, duration: 0.12 }, base + 0.15 + j * 0.18)
      })

      // Dots blink out + value resolves
      tl.to(dots, { autoAlpha: 0, duration: 0.15 }, base + 0.72)
      tl.add(() => { if (valEl) valEl.textContent = d.resolved }, base + 0.78)
    })

    // Progress ring fills 0→100% over 3.2s
    tl.fromTo(
      progressRef.current,
      { strokeDashoffset: CIRC },
      { strokeDashoffset: 0, duration: 3.2, ease: 'power1.inOut' },
      0.3,
    )

    // Labels appear at quarter-marks
    const labelTimes = [0.3 + 0.8, 0.3 + 1.6, 0.3 + 2.4, 0.3 + 3.2]
    labelRefs.current.forEach((el, i) => {
      tl.to(el, { autoAlpha: 1, duration: 0.25 }, labelTimes[i])
    })

    // Copyright lines stagger in
    copyRefs.current.forEach((el, i) => {
      tl.to(el, { autoAlpha: 1, y: 0, duration: 0.3 }, 2.0 + i * 0.18)
    })

    // Swap loading → connected text
    tl.to(loadingTxtRef.current,   { autoAlpha: 0, duration: 0.25 }, 3.4)
    tl.to(connectedTxtRef.current, { autoAlpha: 1, duration: 0.25 }, 3.5)

    // ─── TRANSITION ───────────────────────────────────────────────────────────

    // Phase 1 fades out, phase 2 fades in
    tl.to(phase1Ref.current, { autoAlpha: 0, duration: 0.55 }, 4.0)
    tl.to(phase2Ref.current, { autoAlpha: 1, duration: 0.45 }, 4.2)

    // ─── PHASE 2 ──────────────────────────────────────────────────────────────

    // Logo
    tl.to(logoRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 4.4)

    // Title lines slide up from clip
    tl.to(line1Ref.current, { y: 0, duration: 0.75, ease: 'power3.out' }, 4.6)
    tl.to(line2Ref.current, { y: 0, duration: 0.75, ease: 'power3.out' }, 4.72)

    // Subtitle
    tl.to(subRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 5.0)

    // Button border segments draw in (8 segments, clockwise)
    segRefs.current.forEach((el, i) => {
      const isHorizontal = i % 2 === 0
      tl.to(el, {
        [isHorizontal ? 'scaleX' : 'scaleY']: 1,
        duration: 0.28,
        ease: 'power2.out',
      }, 5.15 + i * 0.04)
    })

    // Button text + overall opacity
    tl.to(btnRef.current, { autoAlpha: 1, duration: 0.3 }, 5.3)

    return () => { tl.kill() }
  }, [])

  const handleEnter = () => {
    gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: 0.55,
      ease: 'power2.inOut',
      onComplete: () => {
        setVisible(false)
        onDone()
      },
    })
  }

  if (!visible) return null

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        fontFamily: "'Rajdhani', 'SF Mono', monospace",
      }}
    >
      {/* ── PHASE 1: Connecting ─────────────────────────────────────────── */}
      <div
        ref={phase1Ref}
        style={{ position: 'absolute', inset: 0, background: '#04111f' }}
      >
        {/* TOP-LEFT: Detail lines */}
        <div style={{
          position: 'absolute', top: 36, left: 36,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {DETAILS.map((d, i) => (
            <span
              key={i}
              ref={el => { detailRefs.current[i] = el }}
              style={{
                opacity: 0, visibility: 'hidden',
                display: 'flex', alignItems: 'center', gap: 0,
                fontSize: 11, letterSpacing: '0.06em',
                color: '#94E6FB', fontWeight: 500,
              }}
            >
              <span style={{ opacity: 0.45, marginRight: 4 }}>{'> '}</span>
              <span style={{ opacity: 0.65, marginRight: 4 }}>{d.label}:&nbsp;</span>
              <span
                ref={el => { valueRefs.current[i] = el }}
                style={{ color: '#E5FAFF', fontWeight: 600, minWidth: 120 }}
              >
                {d.initial}
              </span>
              <span style={{ display: 'inline-flex', gap: 0, marginLeft: 1 }}>
                {[0, 1, 2].map(j => (
                  <span
                    key={j}
                    ref={el => { dotsRefs.current[i][j] = el! }}
                    style={{ opacity: 0, visibility: 'hidden' }}
                  >.</span>
                ))}
              </span>
            </span>
          ))}
        </div>

        {/* BOTTOM-LEFT: SVG corner square */}
        <div style={{ position: 'absolute', bottom: 36, left: 36 }}>
          <CornerSquare />
        </div>

        {/* BOTTOM-RIGHT: Copyright + SVG square */}
        <div style={{
          position: 'absolute', bottom: 36, right: 36,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginBottom: 8 }}>
            {COPYRIGHT.map((line, i) => (
              <span
                key={i}
                ref={el => { copyRefs.current[i] = el }}
                style={{
                  opacity: 0, visibility: 'hidden',
                  transform: 'translateY(4px)',
                  display: 'block', fontSize: 9,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(148,230,251,0.45)',
                }}
              >
                {line}
              </span>
            ))}
          </div>
          <CornerSquare />
        </div>

        {/* CENTER: Progress ring */}
        <div
          ref={outerGroupRef}
          style={{
            position: 'absolute', inset: 0, opacity: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ position: 'relative', width: 220, height: 220 }}>

            {/* Labels at 3, 6, 9, 12 o'clock */}
            {[
              { label: '25',  style: { top: '50%',  right: -32, transform: 'translateY(-50%)' } },
              { label: '50',  style: { bottom: -24, left: '50%', transform: 'translateX(-50%)' } },
              { label: '75',  style: { top: '50%',  left: -32,  transform: 'translateY(-50%)' } },
              { label: '100', style: { top: -24,    left: '50%', transform: 'translateX(-50%)' } },
            ].map(({ label, style }, i) => (
              <span
                key={label}
                ref={el => { labelRefs.current[i] = el }}
                style={{
                  position: 'absolute', opacity: 0, visibility: 'hidden',
                  fontSize: 9, letterSpacing: '0.12em',
                  color: 'rgba(148,230,251,0.55)', fontWeight: 500,
                  ...style,
                }}
              >
                {label}
              </span>
            ))}

            {/* Centre text */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div ref={loadingTxtRef}>
                {['Loading', 'Experience'].map(t => (
                  <div key={t} style={{
                    fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
                    color: 'rgba(148,230,251,0.45)', lineHeight: 1.7, textAlign: 'center',
                  }}>{t}</div>
                ))}
              </div>
              <div ref={connectedTxtRef} style={{ opacity: 0, visibility: 'hidden', position: 'absolute' }}>
                {['Connection', 'Established'].map(t => (
                  <div key={t} style={{
                    fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
                    color: '#94E6FB', lineHeight: 1.7, textAlign: 'center',
                  }}>{t}</div>
                ))}
              </div>
            </div>

            {/* SVG ring */}
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none" style={{ transform: 'rotate(-90deg)' }}>
              {/* Outer decorative ticks */}
              <line x1="110" y1="2"   x2="110" y2="14"  stroke="rgba(148,230,251,0.18)" strokeWidth="1" />
              <line x1="110" y1="206" x2="110" y2="218" stroke="rgba(148,230,251,0.18)" strokeWidth="1" />
              <line x1="2"   y1="110" x2="14"  y2="110" stroke="rgba(148,230,251,0.18)" strokeWidth="1" />
              <line x1="206" y1="110" x2="218" y2="110" stroke="rgba(148,230,251,0.18)" strokeWidth="1" />

              {/* Corner dots */}
              <circle cx="110" cy="25.5" r="2.5" fill="#94E6FB" />
              <circle cx="110" cy="194.5" r="2.5" fill="#94E6FB" />

              {/* Track */}
              <circle
                cx="110" cy="110" r={R}
                stroke="rgba(229,250,255,0.12)"
                strokeWidth="6" fill="none"
                strokeDasharray="3 6"
              />

              {/* Fill */}
              <circle
                ref={progressRef}
                cx="110" cy="110" r={R}
                stroke="#94E6FB"
                strokeWidth="6" fill="none"
                strokeDasharray={`${CIRC}`}
                strokeDashoffset={CIRC}
              />

              {/* Guide ring */}
              <circle cx="110" cy="110" r="100"
                stroke="rgba(148,230,251,0.05)" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── PHASE 2: Enter ──────────────────────────────────────────────── */}
      <div
        ref={phase2Ref}
        style={{
          position: 'absolute', inset: 0,
          background: '#04111f',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          opacity: 0, visibility: 'hidden',
          padding: '0 24px',
        }}
      >
        {/* Logo / label */}
        <div
          ref={logoRef}
          style={{
            opacity: 0, visibility: 'hidden', transform: 'translateY(10px)',
            marginBottom: 28,
            fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase',
            color: 'rgba(148,230,251,0.55)', fontWeight: 500,
          }}
        >
          Ali Al-Ali
        </div>

        {/* Title — 2 lines with overflow clip */}
        <h1 style={{
          textAlign: 'center', lineHeight: 0.92,
          letterSpacing: '-0.025em', margin: '0 0 20px',
          textTransform: 'uppercase',
        }}>
          {/* Line 1 — outline */}
          <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.08em' }}>
            <span
              ref={line1Ref}
              style={{
                display: 'block',
                transform: 'translateY(110%)',
                fontSize: 'clamp(36px, 6.5vw, 82px)',
                color: 'transparent',
                WebkitTextStroke: '1px #94E6FB',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Bridging the
            </span>
          </span>
          {/* Line 2 — solid */}
          <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
            <span
              ref={line2Ref}
              style={{
                display: 'block',
                transform: 'translateY(110%)',
                fontSize: 'clamp(52px, 9.5vw, 124px)',
                color: '#E5FAFF',
                fontWeight: 700,
                letterSpacing: '-0.025em',
              }}
            >
              Gap
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <span
          ref={subRef}
          style={{
            opacity: 0, visibility: 'hidden', transform: 'translateY(8px)',
            display: 'block', marginBottom: 52,
            fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'rgba(148,230,251,0.55)', fontWeight: 500,
          }}
        >
          Strategy · Execution · Results
        </span>

        {/* Button */}
        <button
          ref={btnRef}
          onClick={handleEnter}
          style={{
            opacity: 0, visibility: 'hidden',
            position: 'relative',
            padding: '18px 48px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#E5FAFF',
            fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase',
            fontWeight: 600, fontFamily: "'Rajdhani', monospace",
          }}
          onMouseEnter={e => {
            gsap.to(e.currentTarget, { background: 'rgba(148,230,251,0.08)', duration: 0.2 })
          }}
          onMouseLeave={e => {
            gsap.to(e.currentTarget, { background: 'transparent', duration: 0.2 })
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>Let&apos;s Begin</span>

          {/* Border segments: top-l, top-r, right-t, right-b, bottom-r, bottom-l, left-b, left-t */}
          {/* Top-left horizontal */}
          <span ref={el => { segRefs.current[0] = el }} style={{
            position: 'absolute', top: 0, left: 0,
            width: '50%', height: '1px', background: '#94E6FB',
            transformOrigin: 'left', transform: 'scaleX(0)',
          }} />
          {/* Top-right horizontal */}
          <span ref={el => { segRefs.current[1] = el }} style={{
            position: 'absolute', top: 0, right: 0,
            width: '50%', height: '1px', background: '#94E6FB',
            transformOrigin: 'right', transform: 'scaleX(0)',
          }} />
          {/* Right-top vertical */}
          <span ref={el => { segRefs.current[2] = el }} style={{
            position: 'absolute', top: 0, right: 0,
            width: '1px', height: '50%', background: '#94E6FB',
            transformOrigin: 'top', transform: 'scaleY(0)',
          }} />
          {/* Right-bottom vertical */}
          <span ref={el => { segRefs.current[3] = el }} style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '1px', height: '50%', background: '#94E6FB',
            transformOrigin: 'bottom', transform: 'scaleY(0)',
          }} />
          {/* Bottom-right horizontal */}
          <span ref={el => { segRefs.current[4] = el }} style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '50%', height: '1px', background: '#94E6FB',
            transformOrigin: 'right', transform: 'scaleX(0)',
          }} />
          {/* Bottom-left horizontal */}
          <span ref={el => { segRefs.current[5] = el }} style={{
            position: 'absolute', bottom: 0, left: 0,
            width: '50%', height: '1px', background: '#94E6FB',
            transformOrigin: 'left', transform: 'scaleX(0)',
          }} />
          {/* Left-bottom vertical */}
          <span ref={el => { segRefs.current[6] = el }} style={{
            position: 'absolute', bottom: 0, left: 0,
            width: '1px', height: '50%', background: '#94E6FB',
            transformOrigin: 'bottom', transform: 'scaleY(0)',
          }} />
          {/* Left-top vertical */}
          <span ref={el => { segRefs.current[7] = el }} style={{
            position: 'absolute', top: 0, left: 0,
            width: '1px', height: '50%', background: '#94E6FB',
            transformOrigin: 'top', transform: 'scaleY(0)',
          }} />
        </button>
      </div>
    </div>
  )
}

function CornerSquare() {
  return (
    <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
      <path
        fillRule="evenodd" clipRule="evenodd"
        d="M0 0H30V30H0V0ZM1 1V29H29V1H1Z"
        fill="#94E6FB"
      />
      <path d="M29.38 29.35L0.38 0.35" stroke="#94E6FB" />
    </svg>
  )
}
