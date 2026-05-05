'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

const MINI_LABELS = ['STRATEGY', 'EXECUTION', 'AI']

export default function AliStrategyTakeover() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.4 })

  // Phase 1 (0–0.35): the 3 small coins are arranged in butterfly orientation
  // Phase 2 (0.35–0.55): they detach from butterfly and converge to center as one
  // Phase 3 (0.55–0.85): the merged "Strategy" coin scales huge and overflows
  // Phase 4 (0.85–1): fades out

  // Mini coins: hold in butterfly, then converge to center then fade
  const mini1X = useTransform(p, [0, 0.3, 0.55], ['-32%', '-32%', '0%'])
  const mini1Y = useTransform(p, [0, 0.3, 0.55], ['-2%', '-2%', '0%'])
  const mini1Rot = useTransform(p, [0, 0.3, 0.55], [-60, -60, 0])
  const mini1Op = useTransform(p, [0.45, 0.6], [1, 0])

  const mini2X = useTransform(p, [0, 0.3, 0.55], ['0%', '0%', '0%'])
  const mini2Y = useTransform(p, [0, 0.3, 0.55], ['0%', '0%', '0%'])
  const mini2Rot = useTransform(p, [0, 0.3, 0.55], [0, 0, 0])
  const mini2Op = useTransform(p, [0.45, 0.6], [1, 0])

  const mini3X = useTransform(p, [0, 0.3, 0.55], ['32%', '32%', '0%'])
  const mini3Y = useTransform(p, [0, 0.3, 0.55], ['2%', '2%', '0%'])
  const mini3Rot = useTransform(p, [0, 0.3, 0.55], [60, 60, 0])
  const mini3Op = useTransform(p, [0.45, 0.6], [1, 0])

  // Big strategy coin: appears at convergence, scales up and fades out
  const bigScale = useTransform(p, [0.5, 0.7, 0.88, 1], [0.6, 1.6, 3.2, 4.0])
  const bigOpacity = useTransform(p, [0.5, 0.6, 0.78, 0.95], [0, 1, 1, 0])
  const bigRotate = useTransform(p, [0.5, 1], [0, 6])

  // Hint copy
  const hintOpacity = useTransform(p, [0, 0.15, 0.35, 0.5], [0, 1, 1, 0])

  return (
    <section ref={ref} className="ali-takeover" aria-label="Strategy coin takeover">
      <div className="ali-takeover-sticky">
        <div className="ali-coin-stage">
          <motion.div
            className="ali-mini-coin"
            style={{
              x: mini1X,
              y: mini1Y,
              rotate: mini1Rot,
              opacity: mini1Op,
            }}
          >
            <span className="ali-mini-coin-label">{MINI_LABELS[0]}</span>
          </motion.div>

          <motion.div
            className="ali-mini-coin"
            style={{
              x: mini2X,
              y: mini2Y,
              rotate: mini2Rot,
              opacity: mini2Op,
            }}
          >
            <span className="ali-mini-coin-label">{MINI_LABELS[1]}</span>
          </motion.div>

          <motion.div
            className="ali-mini-coin"
            style={{
              x: mini3X,
              y: mini3Y,
              rotate: mini3Rot,
              opacity: mini3Op,
            }}
          >
            <span className="ali-mini-coin-label">{MINI_LABELS[2]}</span>
          </motion.div>

          <motion.div
            className="ali-strategy-coin"
            style={{
              scale: bigScale,
              opacity: bigOpacity,
              rotate: bigRotate,
            }}
          >
            <span className="ali-strategy-coin-label">Strategy</span>
          </motion.div>
        </div>

        <motion.p
          style={{
            position: 'absolute',
            bottom: '8vh',
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: hintOpacity,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.32em',
            color: 'var(--ali-muted)',
            textTransform: 'uppercase',
          }}
        >
          Scroll · Strategy converges
        </motion.p>
      </div>
    </section>
  )
}
