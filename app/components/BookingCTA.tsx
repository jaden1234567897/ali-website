'use client'
import { motion } from 'framer-motion'

const fade = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }
const vp   = { once: true, margin: '-80px' }

export default function BookingCTA() {
  return (
    <section id="book" className="ocean-section-alt section">
      <div className="container">

        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 4 }}>

          {/* Background glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 70% 80% at 50% 50%, rgba(34,211,238,0.05) 0%, transparent 65%),
              radial-gradient(ellipse 40% 40% at 20% 20%, rgba(34,211,238,0.04) 0%, transparent 55%),
              radial-gradient(ellipse 40% 40% at 80% 80%, rgba(34,211,238,0.04) 0%, transparent 55%)
            `,
          }} />

          {/* Corner brackets */}
          <div style={{ position: 'absolute', top: 24, left: 24, width: 24, height: 24, borderTop: '1px solid rgba(34,211,238,0.25)', borderLeft: '1px solid rgba(34,211,238,0.25)' }} />
          <div style={{ position: 'absolute', top: 24, right: 24, width: 24, height: 24, borderTop: '1px solid rgba(34,211,238,0.25)', borderRight: '1px solid rgba(34,211,238,0.25)' }} />
          <div style={{ position: 'absolute', bottom: 24, left: 24, width: 24, height: 24, borderBottom: '1px solid rgba(34,211,238,0.25)', borderLeft: '1px solid rgba(34,211,238,0.25)' }} />
          <div style={{ position: 'absolute', bottom: 24, right: 24, width: 24, height: 24, borderBottom: '1px solid rgba(34,211,238,0.25)', borderRight: '1px solid rgba(34,211,238,0.25)' }} />

          <div style={{
            padding: 'clamp(64px,9vw,112px) clamp(28px,6vw,96px)',
            textAlign: 'center', position: 'relative',
            border: '1px solid var(--border)',
          }}>

            <motion.p className="label label-accent" initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.5 }}>
              Ready to close the gap?
            </motion.p>

            <motion.h2
              initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.65, delay: 0.08 }}
              style={{
                fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.03em',
                lineHeight: 1.08, color: '#fff', maxWidth: 640, margin: '0 auto 22px',
              }}
            >
              Start the conversation
            </motion.h2>

            <motion.p
              initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.65, delay: 0.18 }}
              style={{
                fontSize: 'var(--text-base)', color: 'var(--muted)', fontWeight: 300,
                maxWidth: 460, margin: '0 auto 48px', lineHeight: 1.8,
              }}
            >
              Book a free 45-minute discovery call. No pitch, no pressure —
              just an honest conversation about where you are and where you want to be.
            </motion.p>

            <motion.div
              initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.5, delay: 0.3 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 28 }}
            >
              <a href="https://cal.com" target="_blank" rel="noopener noreferrer" style={{
                background: '#fff', color: '#000', fontWeight: 700, fontSize: 14,
                padding: '15px 38px', borderRadius: 999, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.87')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                📅 Book a Free Call
              </a>
              <a href="https://wa.me/message" target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(37,211,102,0.1)', color: '#25D366',
                border: '1px solid rgba(37,211,102,0.2)', fontWeight: 600, fontSize: 14,
                padding: '14px 30px', borderRadius: 999, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.1)')}
              >
                WhatsApp Ali
              </a>
            </motion.div>

            <motion.p
              initial="hidden" whileInView="show" viewport={vp} variants={fade} transition={{ duration: 0.5, delay: 0.42 }}
              style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}
            >
              Free · 45 minutes · No commitment
            </motion.p>

          </div>
        </div>
      </div>
    </section>
  )
}
