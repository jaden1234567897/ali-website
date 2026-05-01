'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MODULES = [
  {
    num: '01', title: 'The Execution Gap Diagnostic', dur: '45 min',
    desc: 'Understand exactly where strategy breaks down in your organisation. Map the chain from intent to outcome and pinpoint every gap.',
  },
  {
    num: '02', title: 'Strategy Translation Framework', dur: '60 min',
    desc: 'Convert high-level ambitions into team-level priorities with clear ownership assigned at every layer.',
  },
  {
    num: '03', title: 'OKR Design & Cascade', dur: '90 min',
    desc: 'Design OKRs that create real accountability — not just metrics that look good on a quarterly dashboard.',
  },
  {
    num: '04', title: 'AI Tools for Strategy Teams', dur: '75 min',
    desc: 'Embed AI into your strategy workflow to compress decision timelines and surface insights before your competitors do.',
  },
  {
    num: '05', title: 'Accountability Architecture', dur: '60 min',
    desc: 'Build the ownership map that ensures follow-through at every level — no more "everyone agreed but nothing moved".',
  },
  {
    num: '06', title: 'Sustaining Execution Momentum', dur: '45 min',
    desc: 'Create the governance rhythm that keeps your strategy alive month after month, long after the workshop ends.',
  },
]

const FEATURES = [
  '6 in-depth video modules',
  'Downloadable frameworks & templates',
  'AI-assisted exercises',
  'Private community access',
  'Lifetime access + future updates',
]

function BookPage({
  module, direction, idx,
}: {
  module: typeof MODULES[0]
  direction: number
  idx: number
}) {
  return (
    <motion.div
      key={idx}
      custom={direction}
      initial={{ rotateY: direction > 0 ? 80 : -80, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: direction > 0 ? -80 : 80, opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(160deg, oklch(0.13 0.024 234), oklch(0.07 0.016 240))',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: 30,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '8px 6px 40px rgba(0,0,0,0.55)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Top */}
      <div>
        <div style={{ width: 28, height: 2, background: 'var(--brass)', marginBottom: 22 }} />
        <p style={{
          fontSize: 9,
          color: 'var(--brass)',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          Module {module.num}
        </p>
        <h3 style={{
          color: 'var(--ink-strong)',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          lineHeight: 1.25,
          marginBottom: 18,
        }}>
          {module.title}
        </h3>
        <p style={{
          color: 'var(--muted)',
          fontSize: 13.5,
          lineHeight: 1.7,
        }}>
          {module.desc}
        </p>
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--quiet)', letterSpacing: '0.08em' }}>{module.dur}</span>
        <span style={{
          fontSize: 10,
          color: 'var(--quiet)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {module.num} / 0{MODULES.length}
        </span>
      </div>
    </motion.div>
  )
}

export default function CoursePreview() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (idx: number) => {
    setDirection(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
  }

  return (
    <section
      id="course"
      data-coins="front"
      className="ocean-section section"
    >
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(48px, 7vw, 96px)',
          alignItems: 'start',
        }}>

          {/* Book — sticky */}
          <div style={{
            position: 'sticky',
            top: 'calc(var(--header-h) + 32px)',
          }}>
            {/* 3D book wrapper */}
            <div style={{ perspective: 1400, width: 'fit-content', margin: '0 auto' }}>
              <div style={{
                position: 'relative',
                width: 290,
                height: 390,
                transformStyle: 'preserve-3d',
              }}>
                {/* Spine */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  width: 18,
                  height: 382,
                  background: 'oklch(0.10 0.02 235)',
                  border: '1px solid oklch(0.78 0.105 82 / 0.22)',
                  borderRight: 'none',
                  borderRadius: '4px 0 0 4px',
                  zIndex: 2,
                }} />

                {/* Page stack (depth effect) */}
                {[3, 2, 1].map(offset => (
                  <div
                    key={offset}
                    style={{
                      position: 'absolute',
                      left: 18 + offset * 1.5,
                      top: offset * 1.5,
                      width: 272 - offset,
                      height: 390 - offset * 2,
                      background: `oklch(${0.085 + offset * 0.007} 0.016 236)`,
                      border: '1px solid var(--line)',
                      borderRadius: '0 8px 8px 0',
                      zIndex: offset,
                    }}
                  />
                ))}

                {/* Active page */}
                <div style={{
                  position: 'absolute',
                  left: 18,
                  top: 0,
                  width: 272,
                  height: 390,
                  borderRadius: '0 10px 10px 0',
                  overflow: 'hidden',
                  zIndex: 10,
                }}>
                  <AnimatePresence mode="wait" custom={direction}>
                    <BookPage
                      key={activeIdx}
                      module={MODULES[activeIdx]}
                      direction={direction}
                      idx={activeIdx}
                    />
                  </AnimatePresence>
                </div>

                {/* Book shadow */}
                <div style={{
                  position: 'absolute',
                  bottom: -18,
                  left: 10,
                  right: 0,
                  height: 36,
                  background: 'radial-gradient(ellipse at 40% center, rgba(0,0,0,0.45) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />
              </div>
            </div>

            {/* Dot nav */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 7,
              marginTop: 26,
            }}>
              {MODULES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Module ${i + 1}`}
                  style={{
                    width: i === activeIdx ? 22 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === activeIdx ? 'var(--brass)' : 'var(--quiet)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Module list + copy */}
          <div>
            <p className="label label-accent" style={{ marginBottom: 16 }}>The Course</p>
            <h2 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: 'var(--ink-strong)',
              marginBottom: 20,
            }}>
              From Strategy<br />to Execution
            </h2>
            <p style={{
              color: 'var(--muted)',
              fontSize: 16,
              lineHeight: 1.78,
              marginBottom: 32,
            }}>
              A self-paced digital programme for leaders and strategy teams who
              want a proven, practical system for closing the execution gap —
              with AI built in from day one.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 36 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ color: 'var(--accent)', fontSize: 11 }}>✓</span>
                  <span style={{ fontSize: 13.5, color: 'oklch(0.92 0.018 226 / 0.65)' }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Module list */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {MODULES.map((m, i) => (
                <div
                  key={m.num}
                  onMouseEnter={() => goTo(i)}
                  onClick={() => goTo(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '17px 0',
                    borderBottom: '1px solid var(--line)',
                    cursor: 'pointer',
                    gap: 14,
                    opacity: i === activeIdx ? 1 : 0.5,
                    transition: 'opacity 0.22s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <span style={{
                      fontSize: 9,
                      color: 'var(--accent)',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      minWidth: 22,
                    }}>
                      {m.num}
                    </span>
                    <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 400 }}>
                      {m.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {m.dur}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
              <a
                href="#enroll"
                style={{
                  background: 'var(--accent)',
                  color: 'oklch(0.08 0.014 238)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '13px 28px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                Enrol Now
              </a>
              <a
                href="#course-details"
                style={{
                  color: 'var(--muted)',
                  fontWeight: 400,
                  fontSize: 13.5,
                  padding: '12px 24px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  border: '1px solid var(--border)',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = 'var(--ink)'
                  el.style.borderColor = 'oklch(0.78 0.04 220 / 0.35)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = 'var(--muted)'
                  el.style.borderColor = 'var(--border)'
                }}
              >
                See curriculum ↓
              </a>
            </div>

            <p style={{ fontSize: 11, color: 'var(--quiet)', marginTop: 18, letterSpacing: '0.1em' }}>
              + bonus materials unlocked on enrolment
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
