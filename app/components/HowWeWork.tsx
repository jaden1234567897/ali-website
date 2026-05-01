'use client'

import { motion, type Variants } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Diagnose',
    description: 'We start with a deep-dive into your strategy-execution gap. Where is the disconnect? What is actually blocking results? No assumptions — only clarity.',
    bullets: ['Executive interviews & org assessment', 'Strategy clarity audit', 'Execution bottleneck mapping'],
  },
  {
    number: '02',
    title: 'Design',
    description: 'We build frameworks and systems tailored to your organization — not off-the-shelf templates, but tools your teams will actually use.',
    bullets: ['Custom strategy frameworks', 'AI-powered planning tools', 'Governance & accountability structures'],
  },
  {
    number: '03',
    title: 'Deploy',
    description: 'We stay in the room through execution. Not just advisors — partners who are accountable for real results alongside your leadership team.',
    bullets: ['Implementation leadership', 'Team coaching & enablement', 'Progress tracking & iteration'],
  },
]

const fade: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.12 } }),
}

export default function HowWeWork() {
  return (
    <section
      id="how-we-work"
      style={{
        position: 'relative',
        background: '#000',
        padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 80px)',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '40%', right: '10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(103,232,249,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.p
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fade} custom={0}
          style={{ color: 'rgba(103,232,249,0.55)', fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', fontWeight: 300, marginBottom: 16, textAlign: 'center' }}
        >
          The Process
        </motion.p>
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fade} custom={1}
          style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12, textAlign: 'center' }}
        >
          How We Work Together
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fade} custom={2}
          style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(13px, 1.3vw, 16px)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(48px, 7vw, 80px)', maxWidth: 480, margin: '0 auto clamp(48px, 7vw, 80px)' }}
        >
          A structured, high-accountability engagement that moves from diagnosis to real outcomes.
        </motion.p>

        {/* Step connector line (desktop only) */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 28,
            left: 'calc(16.67% + 28px)',
            right: 'calc(16.67% + 28px)',
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(103,232,249,0.2), rgba(103,232,249,0.2), transparent)',
            pointerEvents: 'none',
          }} />

          {/* Step numbers row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24, textAlign: 'center' }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fade} custom={i + 3}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '1px solid rgba(103,232,249,0.25)',
                  background: 'rgba(103,232,249,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgb(103,232,249)',
                  fontSize: 13, fontWeight: 600, letterSpacing: '0.1em',
                  position: 'relative', zIndex: 1,
                }}>
                  {step.number}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Step cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(16px, 2.5vw, 32px)' }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fade} custom={i + 6}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                style={{
                  background: 'rgba(4,17,31,0.6)',
                  border: '1px solid rgba(103,232,249,0.1)',
                  borderRadius: 20,
                  padding: 'clamp(24px, 3vw, 40px)',
                  cursor: 'default',
                  transition: 'border-color 0.2s',
                }}
              >
                <h3 style={{ color: '#fff', fontSize: 'clamp(18px, 2vw, 26px)', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 16 }}>
                  {step.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(13px, 1.2vw, 15px)', fontWeight: 300, lineHeight: 1.7, marginBottom: 24 }}>
                  {step.description}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {step.bullets.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(103,232,249,0.5)', flexShrink: 0 }} />
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(12px, 1vw, 13px)', fontWeight: 300 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fade} custom={10}
          style={{ textAlign: 'center', marginTop: 'clamp(48px, 7vw, 80px)' }}
        >
          <a
            href="#book"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#fff', color: '#000',
              fontWeight: 600, fontSize: 14,
              padding: '14px 32px', borderRadius: 9999,
              textDecoration: 'none',
            }}
          >
            Start the Conversation →
          </a>
        </motion.div>

      </div>
    </section>
  )
}
