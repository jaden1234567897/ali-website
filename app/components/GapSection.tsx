'use client'
import { motion } from 'framer-motion'

const fade = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }
const vp   = { once: true, margin: '-80px' }

const PILLARS = [
  {
    num: '01',
    title: 'Strategy is not enough',
    body: 'Brilliant plans fail every day. The gap between a compelling vision and measurable results is where most organisations bleed value.',
  },
  {
    num: '02',
    title: 'Execution without direction drifts',
    body: 'Teams move fast but in the wrong direction. Without a clear bridge from strategy to daily action, effort becomes noise.',
  },
  {
    num: '03',
    title: 'The bridge is a discipline',
    body: 'Closing the gap is not a one-time project — it is a systematic capability built through frameworks, habits, and leadership.',
  },
]

export default function GapSection() {
  return (
    <section id="services" className="ocean-section-alt section">
      <div className="container">

        {/* Header */}
        <div style={{ maxWidth: 720, marginBottom: 'clamp(64px,8vw,100px)' }}>
          <motion.p className="label" initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.5 }}>
            The core problem
          </motion.p>
          <motion.h2
            initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.65, delay: 0.08 }}
            style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, color: '#fff' }}
          >
            Bridging the Strategy<br />to Execution Gap
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.65, delay: 0.18 }}
            style={{ fontSize: 'var(--text-base)', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.8, marginTop: 22 }}
          >
            Research consistently shows that 60–90% of strategies fail at execution.
            The problem is rarely the strategy itself — it is the absence of a
            structured, human-led approach to translate ambition into action.
          </motion.p>
        </div>

        {/* Pillars — open layout with large numbers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.num}
              initial="hidden" whileInView="show" viewport={vp} variants={fade}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(60px,8vw,100px) 1fr',
                gap: 'clamp(24px,4vw,56px)',
                alignItems: 'start',
                padding: 'clamp(36px,5vw,56px) 0',
                borderBottom: i < PILLARS.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{
                fontSize: 'clamp(48px,6vw,72px)', fontWeight: 700,
                color: 'rgba(255,255,255,0.06)', lineHeight: 1, letterSpacing: '-0.02em',
                paddingTop: 4,
              }}>
                {p.num}
              </div>
              <div>
                <h3 style={{
                  fontSize: 'var(--text-xl)', fontWeight: 600, color: '#fff',
                  letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16,
                }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.8, maxWidth: 560 }}>
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pull quote */}
        <motion.blockquote
          initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            marginTop: 'clamp(64px,8vw,100px)',
            padding: 'clamp(40px,5vw,64px)',
            borderLeft: '2px solid rgba(34,211,238,0.4)',
            background: 'rgba(34,211,238,0.03)',
          }}
        >
          <p style={{
            fontSize: 'var(--text-xl)', fontWeight: 300, color: 'rgba(255,255,255,0.88)',
            lineHeight: 1.55, letterSpacing: '-0.01em', fontStyle: 'italic', maxWidth: 800,
          }}>
            "The value of a strategy is only as real as its execution.
            Everything between the plan and the result is where Ali operates."
          </p>
          <footer style={{ marginTop: 24, fontSize: 'var(--text-xs)', color: 'var(--muted)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            — Client Testimonial
          </footer>
        </motion.blockquote>

      </div>
    </section>
  )
}
