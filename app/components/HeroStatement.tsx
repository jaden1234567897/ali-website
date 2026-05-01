'use client'
import { motion } from 'framer-motion'

const fade = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }
const vp   = { once: true, margin: '-100px' }

const STATS = [
  { value: '15+',  label: 'Years Experience' },
  { value: '200+', label: 'Leaders Coached' },
  { value: '40+',  label: 'Organisations' },
  { value: '3',    label: 'Continents' },
]

export default function HeroStatement() {
  return (
    <section className="ocean-section" style={{ padding: 'clamp(100px,14vw,180px) 0 clamp(80px,10vw,140px)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

        <motion.p
          className="label label-accent"
          initial="hidden" whileInView="show" viewport={vp}
          variants={fade} transition={{ duration: 0.6 }}
        >
          Ali Al-Ali
        </motion.p>

        <motion.h1
          initial="hidden" whileInView="show" viewport={vp}
          variants={fade} transition={{ duration: 0.75, delay: 0.1 }}
          style={{
            fontSize: 'var(--text-4xl)', fontWeight: 700,
            letterSpacing: '-0.03em', lineHeight: 1.08,
            maxWidth: 860, color: '#fff',
          }}
        >
          Bridging the{' '}
          <span style={{
            color: 'transparent',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #67e8f9 100%)',
          }}>
            Strategy&nbsp;to&nbsp;Execution
          </span>{' '}
          Gap
        </motion.h1>

        <motion.p
          initial="hidden" whileInView="show" viewport={vp}
          variants={fade} transition={{ duration: 0.7, delay: 0.22 }}
          style={{
            fontSize: 'var(--text-base)', color: 'var(--muted)',
            fontWeight: 300, maxWidth: 540, lineHeight: 1.8, marginTop: 28,
          }}
        >
          Most organisations excel at crafting strategy. Very few close the gap
          between the boardroom and the front line. Ali Al-Ali helps leaders
          bridge that gap — with frameworks, coaching, and AI-powered tools.
        </motion.p>

        <motion.div
          initial="hidden" whileInView="show" viewport={vp}
          variants={fade} transition={{ duration: 0.6, delay: 0.34 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 44 }}
        >
          <a href="#book" style={{
            background: '#fff', color: '#000', fontWeight: 600, fontSize: 13.5,
            padding: '14px 34px', borderRadius: 999, textDecoration: 'none',
            whiteSpace: 'nowrap', transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.87')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Work With Ali
          </a>
          <a href="#services" style={{
            color: 'rgba(255,255,255,0.7)', fontWeight: 400, fontSize: 13.5,
            padding: '13px 32px', borderRadius: 999, textDecoration: 'none',
            border: '1px solid var(--border)', whiteSpace: 'nowrap',
            transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >
            Explore Services ↓
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial="hidden" whileInView="show" viewport={vp}
          variants={fade} transition={{ duration: 0.7, delay: 0.48 }}
          style={{
            display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,5vw,64px)',
            justifyContent: 'center', alignItems: 'center',
            marginTop: 72, paddingTop: 44,
            borderTop: '1px solid var(--border)', width: '100%',
          }}
        >
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'var(--text-2xl)', fontWeight: 700,
                color: '#fff', letterSpacing: '-0.025em', lineHeight: 1,
                backgroundClip: 'text', WebkitBackgroundClip: 'text',
                backgroundImage: 'linear-gradient(135deg, #fff 50%, rgba(34,211,238,0.85) 100%)',
                WebkitTextFillColor: 'transparent',
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: 'var(--text-xs)', color: 'var(--muted)',
                marginTop: 7, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 300,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
