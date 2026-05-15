'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const FEATURES = [
  '6 in-depth video modules',
  'Downloadable frameworks & templates',
  'AI-assisted exercises',
  'Lifetime access + updates',
]

// ali-v3: the right-side visual is a FlipCard3D-style flippable dark card.
// Hover (or tap on touch devices) flips it: front shows the course summary,
// back reveals the six module names — "what's inside" content that pays
// off the flip interaction.
const COURSE_CARD_FEATURES = [
  '6 in-depth video modules',
  'Downloadable frameworks',
  'AI-assisted exercises',
  'Lifetime access + updates',
  'Free Strategy Execution Diagnostic',
]

const COURSE_MODULES = [
  { n: '01', title: 'Strategy that survives reality' },
  { n: '02', title: 'Governance & decision rights' },
  { n: '03', title: 'Planning, budgeting, performance' },
  { n: '04', title: 'Operating models under pressure' },
  { n: '05', title: 'AI prompts & playbooks' },
  { n: '06', title: 'Reviews, cascades, accountability' },
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
          >
            <CourseFlipCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// FlipCard3D — perspective + preserve-3d, hover flips rotateY 0→180 with
// cubic-bezier(0.4, 0, 0.2, 1) over 600 ms (per the Framer FlipCard3D
// component spec). Touch devices flip on tap. backface-visibility: hidden
// keeps each face from showing its mirrored neighbour mid-flip.
function CourseFlipCard() {
  const [flipped, setFlipped] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const handleEnter = () => {
    if (!isTouch) setFlipped(true)
  }
  const handleLeave = () => {
    if (!isTouch) setFlipped(false)
  }
  const handleTap = () => {
    if (isTouch) setFlipped(f => !f)
  }

  return (
    <div
      className="ali-flip-stage"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label="Course preview — hover or tap to flip"
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setFlipped(f => !f)
        }
      }}
    >
      <div className="ali-flip-card" data-flipped={flipped}>
        {/* Front face — course summary */}
        <div className="ali-flip-face ali-course-card">
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
          <div className="ali-flip-hint" aria-hidden>
            {isTouch ? 'Tap to see what’s inside' : 'Hover to see what’s inside'}
          </div>
        </div>

        {/* Back face — module list */}
        <div className="ali-flip-face ali-flip-face--back ali-course-card">
          <div className="ali-course-card-eyebrow">INSIDE THE COURSE</div>
          <h3 className="ali-course-card-title">6 modules</h3>
          <ul className="ali-course-card-modules">
            {COURSE_MODULES.map(m => (
              <li key={m.n}>
                <span className="ali-course-card-module-num">{m.n}</span>
                <span className="ali-course-card-module-title">{m.title}</span>
              </li>
            ))}
          </ul>
          <div className="ali-course-card-tag">COMING SOON · 2026</div>
        </div>
      </div>
    </div>
  )
}
