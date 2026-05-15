'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const FEATURES = [
  '6 in-depth video modules',
  'Downloadable frameworks & templates',
  'AI-assisted exercises',
  'Lifetime access + updates',
]

// ali-v3: the right-side visual is no longer the 3D interactive book —
// it's the same dark "tier card" design that used to live as VOL. 04 in
// the Tier Cards grid, but pulled out into this section as a static
// hero card.
const COURSE_CARD_FEATURES = [
  '6 in-depth video modules',
  'Downloadable frameworks',
  'AI-assisted exercises',
  'Lifetime access + updates',
  'Free Strategy Execution Diagnostic',
]

export default function AliCourseTeaser() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && email.includes('@')) setSubmitted(true)
  }

  return (
    <section id="course" className="ali-section ali-course">
      <div className="ali-container">
        <div className="ali-course-inner">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ali-course-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              Coming soon
            </div>
            <h2 className="ali-h2">
              From <em>Strategy</em> to Execution — the course
            </h2>
            <p className="ali-lede" style={{ margin: '0 0 12px' }}>
              A self-paced programme for leaders and strategy teams who want a
              proven, practical system for closing the execution gap, with AI
              built in from day one.
            </p>

            <ul className="ali-course-features">
              {FEATURES.map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            {submitted ? (
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: 'var(--ali-gold-soft)',
                  border: '1px solid var(--ali-gold-line)',
                  color: 'var(--ali-ink-2)',
                  fontSize: 14,
                  fontWeight: 500,
                  maxWidth: 400,
                }}
              >
                You're on the list. We'll email you the moment it opens.
              </div>
            ) : (
              <form className="ali-course-form" onSubmit={handleSubmit}>
                <div className="ali-course-form-row">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="ali-course-input"
                    aria-label="Email address"
                  />
                  <button type="submit" className="ali-btn ali-btn--primary">
                    Notify Me
                  </button>
                </div>
                <small style={{ fontSize: 11, color: 'var(--ali-quiet)', letterSpacing: '0.04em' }}>
                  Plus a free Strategy Execution Diagnostic when you join.
                </small>
              </form>
            )}
          </motion.div>

          <motion.div
            className="ali-course-visual"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div className="ali-course-card">
              <div className="ali-course-card-eyebrow">VOL. 04</div>
              <h3 className="ali-course-card-title">From Strategy to Execution</h3>
              <p className="ali-course-card-tagline">
                A self-paced course with AI built in.
              </p>
              <ul className="ali-course-card-features">
                {COURSE_CARD_FEATURES.map(f => (
                  <li key={f}>
                    <Check size={15} strokeWidth={2.5} className="ali-course-card-check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="ali-course-card-tag">COMING SOON · 2026</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
