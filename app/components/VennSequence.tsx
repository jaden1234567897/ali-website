'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const TOTAL_FRAMES = 193

function frameSrc(i: number) {
  return `/frames-venn/${String(i + 1).padStart(5, '0')}.webp`
}

export const vennFrameCache: (ImageBitmap | null)[] = Array.from({ length: TOTAL_FRAMES }, () => null)

async function loadBitmap(src: string): Promise<ImageBitmap> {
  const res  = await fetch(src)
  const blob = await res.blob()
  return createImageBitmap(blob)
}

export default function VennSequence() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const bitmaps      = useRef<(ImageBitmap | null)[]>(vennFrameCache)
  const targetFrame  = useRef(0)
  const drawnFrame   = useRef(-1)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const drawRef = useRef((index: number) => {
    const canvas = canvasRef.current
    const bm     = bitmaps.current[index]
    if (!canvas || !bm) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    // cover — fills entire viewport, crops edges of square frame
    const scale = Math.max(width / bm.width, height / bm.height)
    const sw = bm.width  * scale
    const sh = bm.height * scale
    const sx = (width  - sw) / 2
    const sy = (height - sh) / 2

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(bm, sx, sy, sw, sh)
    drawnFrame.current = index
  })

  // ─── RAF loop ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      const t = targetFrame.current
      if (t !== drawnFrame.current && bitmaps.current[t]) drawRef.current(t)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { alive = false }
  }, [])

  // ─── load frames ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (vennFrameCache[0]) {
      drawRef.current(0)
    } else {
      loadBitmap(frameSrc(0)).then(bm => { vennFrameCache[0] = bm; drawRef.current(0) })
    }
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      if (vennFrameCache[i]) continue
      const idx = i
      loadBitmap(frameSrc(idx)).then(bm => { vennFrameCache[idx] = bm })
    }
  }, [])

  // ─── DPR-aware resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      drawRef.current(drawnFrame.current >= 0 ? drawnFrame.current : 0)
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // ─── scroll → frame ──────────────────────────────────────────────────────────
  useEffect(() => {
    return scrollYProgress.on('change', p => {
      targetFrame.current = Math.min(Math.floor(p * TOTAL_FRAMES), TOTAL_FRAMES - 1)
    })
  }, [scrollYProgress])

  // ─── text keyframes ──────────────────────────────────────────────────────────
  //  0.20 → 0.27  "Strategy"   fades in
  //  0.37 → 0.44  "Execution"  fades in
  //  0.55 → 0.62  "Governance" fades in
  //  0.80 → 0.88  tagline      fades in

  const strategyOpacity   = useTransform(scrollYProgress, [0.20, 0.27], [0, 1])
  const strategyY         = useTransform(scrollYProgress, [0.20, 0.27], [20, 0])
  const executionOpacity  = useTransform(scrollYProgress, [0.37, 0.44], [0, 1])
  const executionY        = useTransform(scrollYProgress, [0.37, 0.44], [20, 0])
  const governanceOpacity = useTransform(scrollYProgress, [0.55, 0.62], [0, 1])
  const governanceY       = useTransform(scrollYProgress, [0.55, 0.62], [20, 0])
  const taglineOpacity    = useTransform(scrollYProgress, [0.80, 0.88], [0, 1])
  const taglineY          = useTransform(scrollYProgress, [0.80, 0.88], [16, 0])

  return (
    <section ref={containerRef} style={{ position: 'relative', height: '350vh' }}>
      <div style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        background: '#000',
      }}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        />

        {/* Strategy — top center */}
        <motion.div style={{
          opacity: strategyOpacity,
          y: strategyY,
          position: 'absolute',
          top: '11vh',
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <p style={{ color: 'rgba(103,232,249,0.55)', fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', fontWeight: 300, marginBottom: 10 }}>
            The visible part
          </p>
          <h3 style={{ color: '#fff', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Strategy
          </h3>
        </motion.div>

        {/* Execution — bottom right */}
        <motion.div style={{
          opacity: executionOpacity,
          y: executionY,
          position: 'absolute',
          bottom: '13vh',
          right: '7vw',
          textAlign: 'right',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <h3 style={{ color: '#fff', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Execution
          </h3>
          <p style={{ color: 'rgba(103,232,249,0.55)', fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', fontWeight: 300, marginTop: 10 }}>
            The hidden reality
          </p>
        </motion.div>

        {/* Governance — bottom left */}
        <motion.div style={{
          opacity: governanceOpacity,
          y: governanceY,
          position: 'absolute',
          bottom: '13vh',
          left: '7vw',
          textAlign: 'left',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <h3 style={{ color: '#fff', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Governance
          </h3>
          <p style={{ color: 'rgba(103,232,249,0.55)', fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', fontWeight: 300, marginTop: 10 }}>
            The operating system
          </p>
        </motion.div>

        {/* Center tagline — orbs fully merged */}
        <motion.div style={{
          opacity: taglineOpacity,
          y: taglineY,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'clamp(14px, 1.5vw, 18px)',
            fontWeight: 300,
            letterSpacing: '0.03em',
            lineHeight: 1.65,
            maxWidth: 320,
          }}>
            Where all three meet —<br />
            <span style={{ color: 'rgb(103,232,249)', fontWeight: 600 }}>results happen.</span>
          </p>
        </motion.div>

      </div>
    </section>
  )
}
