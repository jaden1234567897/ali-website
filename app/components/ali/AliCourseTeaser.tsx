'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const FEATURES = [
  '6 in-depth video modules',
  'Downloadable frameworks & templates',
  'AI-assisted exercises',
  'Lifetime access + updates',
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
            initial={{ opacity: 0, scale: 0.92, rotateY: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <CoursePreviewBook />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CoursePreviewBook() {
  return (
    <div
      className="ali-book"
      data-open={false}
      style={{
        ['--book-color-1' as string]: '#1a2a44',
        ['--book-color-2' as string]: '#0a1628',
        width: 'min(82%, 320px)',
        cursor: 'default',
      }}
    >
      <div className="ali-book-stage" style={{ transform: 'rotateY(-12deg)' }}>
        <div className="ali-book-cover">
          <div>
            <div className="ali-book-mark">A Course By Ali</div>
          </div>
          <div className="ali-book-title">
            From Strategy{'\n'}to Execution
          </div>
          <div className="ali-book-foot">
            <span>6 Modules</span>
            <span>2026</span>
          </div>
        </div>
      </div>
      <div className="ali-book-shadow" aria-hidden="true" />
    </div>
  )
}
