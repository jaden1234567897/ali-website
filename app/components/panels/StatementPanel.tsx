'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const STATS = [
  { value: '15+',  label: 'Years' },
  { value: '200+', label: 'Leaders' },
  { value: '40+',  label: 'Orgs' },
  { value: '3',    label: 'Continents' },
]

export default function StatementPanel() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const line1Op  = useTransform(scrollYProgress, [0.05, 0.18], [0, 1])
  const line1Y   = useTransform(scrollYProgress, [0.05, 0.18], [50, 0])
  const line2Op  = useTransform(scrollYProgress, [0.18, 0.32], [0, 1])
  const line2Y   = useTransform(scrollYProgress, [0.18, 0.32], [50, 0])
  const line3Op  = useTransform(scrollYProgress, [0.32, 0.46], [0, 1])
  const line3Y   = useTransform(scrollYProgress, [0.32, 0.46], [50, 0])
  const statsOp  = useTransform(scrollYProgress, [0.52, 0.64], [0, 1])
  const exitOp   = useTransform(scrollYProgress, [0.82, 0.96], [1, 0])

  return (
    <section ref={ref} style={{ position: 'relative', height: '500vh' }}>
      <motion.div style={{ opacity: exitOp, position: 'sticky', top: 0, height: '100dvh', overflow: 'hidden', background: '#000914', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 var(--section-x)' }}>

        {/* Subtle caustics glow */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,211,238,0.04) 0%, transparent 65%)' }} />

        {/* HUD corner label */}
        <div style={{ position: 'absolute', top: 32, left: 'var(--section-x)', pointerEvents: 'none' }}>
          <span className="hud-label">The Mission</span>
        </div>

        {/* Headline — three lines reveal */}
        <div style={{ textAlign: 'center', maxWidth: 960, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden', marginBottom: 'clamp(4px,0.8vw,12px)' }}>
            <motion.div style={{ opacity: line1Op, y: line1Y }}>
              <span style={{ fontSize: 'clamp(36px,6.5vw,88px)', fontWeight: 300, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.03em', lineHeight: 1.1, display: 'block' }}>
                Bridging the
              </span>
            </motion.div>
          </div>

          <div style={{ overflow: 'hidden', marginBottom: 'clamp(4px,0.8vw,12px)' }}>
            <motion.div style={{ opacity: line2Op, y: line2Y }}>
              <span style={{
                fontSize: 'clamp(36px,6.5vw,88px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, display: 'block',
                backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #67e8f9 60%, #fff 100%)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Strategy to Execution
              </span>
            </motion.div>
          </div>

          <div style={{ overflow: 'hidden' }}>
            <motion.div style={{ opacity: line3Op, y: line3Y }}>
              <span style={{ fontSize: 'clamp(36px,6.5vw,88px)', fontWeight: 300, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.03em', lineHeight: 1.1, display: 'block' }}>
                Gap
              </span>
            </motion.div>
          </div>
        </div>

        {/* Thin divider */}
        <motion.div style={{ opacity: statsOp }} aria-hidden>
          <div style={{ width: 1, height: 64, background: 'linear-gradient(to bottom, transparent, rgba(34,211,238,0.4))', margin: 'clamp(32px,4vw,56px) auto' }} />
        </motion.div>

        {/* Stats */}
        <motion.div style={{ opacity: statsOp, display: 'flex', gap: 'clamp(32px,6vw,88px)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(34,211,238,0.55)', letterSpacing: '0.35em', textTransform: 'uppercase', marginTop: 8, fontWeight: 300 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

      </motion.div>
    </section>
  )
}
