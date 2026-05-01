'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const TOTAL_FRAMES  = 193
const HEADER_HEIGHT = 68 // must match Header.tsx

function frameSrc(i: number) {
  return `/frames/${String(i + 1).padStart(5, '0')}.webp`
}

const frameCache: (ImageBitmap | null)[] = Array.from({ length: 193 }, () => null)

async function loadBitmap(src: string): Promise<ImageBitmap> {
  const res  = await fetch(src)
  const blob = await res.blob()
  return createImageBitmap(blob)
}

export default function HeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)

  // Point directly at the shared cache — frames preloaded by page.tsx
  // are immediately available without a second fetch.
  const bitmaps = useRef<(ImageBitmap | null)[]>(frameCache)
  const targetFrame = useRef(0)   // frame the user has scrolled to
  const drawnFrame  = useRef(-1)  // last frame actually painted

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // ─── draw ────────────────────────────────────────────────────────────────
  // Stored in a ref so effects can call it without stale-closure issues.
  const drawRef = useRef((index: number) => {
    const canvas = canvasRef.current
    const bm     = bitmaps.current[index]
    if (!canvas || !bm) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    const scale = Math.max(width / bm.width, height / bm.height)
    const sw = bm.width  * scale
    const sh = bm.height * scale
    const sx = (width  - sw) / 2
    const sy = (height - sh) / 2

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(bm, sx, sy, sw, sh)   // ImageBitmap → zero decode cost
    drawnFrame.current = index
  })

  // ─── RAF rendering loop ───────────────────────────────────────────────────
  // Decouples scroll events from paint: we update targetFrame on every scroll
  // tick, but only actually draw once per display-refresh cycle.
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      const t = targetFrame.current
      if (t !== drawnFrame.current && bitmaps.current[t]) {
        drawRef.current(t)
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { alive = false }
  }, [])

  // ─── fill any missing frames + draw frame 0 when ready ──────────────────
  // page.tsx starts the preload at mount; by the time the user clicks
  // "Let's Begin" most/all frames are already in frameCache. This effect
  // just fills any gaps and ensures frame 0 is painted immediately.
  useEffect(() => {
    // Draw frame 0 if already in cache, otherwise fetch it first
    if (frameCache[0]) {
      drawRef.current(0)
    } else {
      loadBitmap(frameSrc(0)).then(bm => {
        frameCache[0] = bm
        drawRef.current(0)
      })
    }

    // Fill any frames not yet resolved by the background preload
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      if (frameCache[i]) continue
      const idx = i
      loadBitmap(frameSrc(idx)).then(bm => { frameCache[idx] = bm })
    }
  }, [])

  // ─── pixel-perfect canvas on resize (DPR-aware) ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      const f = drawnFrame.current >= 0 ? drawnFrame.current : 0
      drawRef.current(f)
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // ─── scroll → target frame ────────────────────────────────────────────────
  useEffect(() => {
    return scrollYProgress.on('change', p => {
      targetFrame.current = Math.min(Math.floor(p * TOTAL_FRAMES), TOTAL_FRAMES - 1)
    })
  }, [scrollYProgress])

  // ─── strictly non-overlapping keyframes ──────────────────────────────────
  //
  //  Phase 0 — 0.00–0.07  scroll indicator only
  //  Phase 1 — 0.09–0.36  STRATEGY   (in 0.09→0.16 | hold | out 0.29→0.36)
  //  Phase 2 — 0.40–0.58  THE GAP    (in 0.40→0.47 | hold | out 0.51→0.58)
  //  Phase 3 — 0.62–0.78  EXECUTION  (in 0.62→0.69 | hold | out 0.71→0.78)
  //  Phase 4 — 0.82–1.00  HEADLINE + CTA (in 0.82→0.90)
  //
  const scrollIndicator  = useTransform(scrollYProgress, [0.00, 0.07], [1, 0])

  const strategyOpacity  = useTransform(scrollYProgress, [0.09, 0.16, 0.29, 0.36], [0, 1, 1, 0])
  const strategyY        = useTransform(scrollYProgress, [0.09, 0.16], [28, 0])

  const gapOpacity       = useTransform(scrollYProgress, [0.40, 0.47, 0.51, 0.58], [0, 1, 1, 0])

  const executionOpacity = useTransform(scrollYProgress, [0.62, 0.69, 0.71, 0.78], [0, 1, 1, 0])
  const executionY       = useTransform(scrollYProgress, [0.62, 0.69], [28, 0])

  const endOpacity       = useTransform(scrollYProgress, [0.82, 0.90], [0, 1])

  return (
    <section ref={containerRef} style={{ position: 'relative', height: '540vh' }}>

      {/* ── sticky viewport ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100dvh',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        {/* canvas */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        />

        {/* vignette — keeps text legible on any frame */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.52) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── scroll indicator ── */}
        <motion.div
          style={{
            opacity: scrollIndicator,
            position: 'absolute',
            bottom: 36,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 9, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{
              width: 1,
              height: 40,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.32), transparent)',
            }}
          />
        </motion.div>

        {/* ── Phase 1: STRATEGY ── */}
        <motion.div
          style={{
            opacity: strategyOpacity,
            y: strategyY,
            position: 'absolute',
            top: `calc(20vh + ${HEADER_HEIGHT}px)`,
            left: 0,
            right: 0,
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 10,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            fontWeight: 300,
            marginBottom: 14,
          }}>
            The visible part
          </p>
          <h2 style={{
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontSize: 'clamp(52px, 9.5vw, 118px)',
          }}>
            Strategy
          </h2>
        </motion.div>

        {/* ── Phase 2: THE GAP ── */}
        <motion.div
          style={{
            opacity: gapOpacity,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{ width: 1, height: 60, background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)' }} />
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 11,
            letterSpacing: '0.6em',
            textTransform: 'uppercase',
            fontWeight: 300,
            margin: '18px 0',
          }}>
            The&ensp;Gap
          </p>
          <div style={{ width: 1, height: 60, background: 'linear-gradient(to top, rgba(103,232,249,0.55), transparent)' }} />
        </motion.div>

        {/* ── Phase 3: EXECUTION ── */}
        <motion.div
          style={{
            opacity: executionOpacity,
            y: executionY,
            position: 'absolute',
            bottom: '20vh',
            left: 0,
            right: 0,
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <h2 style={{
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontSize: 'clamp(52px, 9.5vw, 118px)',
          }}>
            Execution
          </h2>
          <p style={{
            color: 'rgba(103,232,249,0.65)',
            fontSize: 10,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            fontWeight: 300,
            marginTop: 14,
          }}>
            The hidden reality
          </p>
        </motion.div>

        {/* ── Phase 4: HEADLINE + CTA ── */}
        <motion.div
          style={{
            opacity: endOpacity,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <p style={{
            color: 'rgba(255,255,255,0.38)',
            fontSize: 10,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            fontWeight: 300,
            marginBottom: 20,
          }}>
            Ali Al-Ali
          </p>

          <h1
            style={{
              color: '#fff',
              fontWeight: 300,
              textAlign: 'center',
              lineHeight: 1.22,
              letterSpacing: '-0.02em',
              maxWidth: 780,
              fontSize: 'clamp(26px, 4.2vw, 56px)',
            }}
          >
            Bridging the{' '}
            <span style={{ fontWeight: 700 }}>
              Strategy&nbsp;to&nbsp;Execution
            </span>{' '}
            Gap
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.45)',
            textAlign: 'center',
            fontWeight: 300,
            lineHeight: 1.65,
            maxWidth: 440,
            marginTop: 20,
            fontSize: 'clamp(13px, 1.4vw, 15px)',
          }}>
            Executive advisory, coaching, and digital programs for leaders
            who want real results — not just plans.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginTop: 36,
            pointerEvents: 'auto',
          }}>
            <a
              href="#book"
              style={{
                display: 'inline-block',
                background: '#ffffff',
                color: '#000',
                fontWeight: 600,
                fontSize: 13,
                padding: '13px 30px',
                borderRadius: 9999,
                textDecoration: 'none',
                border: 'none',
                outline: 'none',
                transition: 'opacity 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Work With Ali
            </a>
            <a
              href="#about"
              style={{
                display: 'inline-block',
                color: '#fff',
                fontWeight: 400,
                fontSize: 13,
                padding: '12px 28px',
                borderRadius: 9999,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.22)',
                outline: 'none',
                transition: 'border-color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Explore More ↓
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
