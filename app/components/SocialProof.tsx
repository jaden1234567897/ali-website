'use client'
import { motion } from 'framer-motion'

const fade = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }
const vp   = { once: true, margin: '-80px' }

const TESTIMONIALS = [
  {
    quote: 'Ali helped us transform a perfectly crafted strategy into a living, breathing operating model. Within six months, our execution scores improved by over 40%.',
    name: 'Chief Strategy Officer',
    org: 'Regional Financial Institution',
  },
  {
    quote: 'The clarity Ali brought to our leadership team was remarkable. He has a rare ability to translate abstract strategy into concrete, daily actions that people actually follow.',
    name: 'CEO',
    org: 'Technology Scale-up, UAE',
  },
  {
    quote: 'Working with Ali on our OKR rollout was transformative. The AI-assisted tracking tools alone saved us weeks of manual reporting every quarter.',
    name: 'VP Strategy',
    org: 'Multinational FMCG Group',
  },
]

export default function SocialProof() {
  return (
    <section className="ocean-section-alt section">
      <div className="container">

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(56px,7vw,88px)' }}>
          <div>
            <motion.p className="label" initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.5 }}>
              Testimonials
            </motion.p>
            <motion.h2
              initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.65, delay: 0.08 }}
              style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', lineHeight: 1.1 }}
            >
              What leaders say
            </motion.h2>
          </div>
          <motion.div
            initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            Verified client feedback
          </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial="hidden" whileInView="show" viewport={vp} variants={fade}
              transition={{ duration: 0.65, delay: i * 0.12 }}
              style={{
                padding: 'clamp(36px,5vw,56px) 0',
                borderBottom: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(24px,4vw,56px)',
                alignItems: 'center',
              }}
            >
              {/* Quote */}
              <div style={{ gridColumn: '1 / -1' }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {Array(5).fill(null).map((_, j) => (
                    <span key={j} style={{ color: 'rgba(34,211,238,0.5)', fontSize: 11 }}>★</span>
                  ))}
                </div>
                <p style={{
                  fontSize: 'var(--text-xl)', color: 'rgba(255,255,255,0.82)',
                  fontWeight: 300, lineHeight: 1.6, fontStyle: 'italic',
                  letterSpacing: '-0.01em', maxWidth: 860,
                  borderLeft: '2px solid rgba(34,211,238,0.25)',
                  paddingLeft: 'clamp(20px,3vw,36px)',
                }}>
                  "{t.quote}"
                </p>
              </div>

              {/* Attribution */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(34,211,238,0.06)',
                  border: '1px solid rgba(34,211,238,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: 'rgba(34,211,238,0.4)', flexShrink: 0,
                }}>
                  ◎
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.005em' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.05em' }}>{t.org}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
