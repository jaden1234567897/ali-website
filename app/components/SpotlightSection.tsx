'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface SpotlightItem {
  number:   string   // '01' | '02' | '03'
  tag:      string   // e.g. 'Strategy Consulting'
  title:    string
  body:     string
  links:    { label: string; href: string }[]
  images:   { src: string; alt: string }[]
}

function SpotlightCard({ item, index }: { item: SpotlightItem; index: number }) {
  const ref     = useRef<HTMLDivElement>(null)
  const inView  = useInView(ref, { once: true, margin: '-15%' })
  const isEven  = index % 2 === 0

  const containerVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.12 } },
  }

  const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

  const fadeUp = {
    hidden:  { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
  }

  const imageVariants = {
    hidden:  { opacity: 0, scale: 0.94, y: 20 },
    visible: (i: number) => ({
      opacity: 1, scale: 1, y: 0,
      transition: { duration: 0.8, delay: i * 0.1, ease: EASE },
    }),
  }

  return (
    <div
      ref={ref}
      style={{
        padding: 'clamp(80px, 10vw, 140px) var(--section-x)',
        borderTop: '1px solid rgba(148,230,251,0.08)',
        position: 'relative',
      }}
    >
      {/* Subtle ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isEven
          ? 'radial-gradient(ellipse 60% 50% at 10% 50%, rgba(148,230,251,0.03) 0%, transparent 60%)'
          : 'radial-gradient(ellipse 60% 50% at 90% 50%, rgba(148,230,251,0.03) 0%, transparent 60%)',
      }} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 'clamp(48px, 6vw, 96px)',
          alignItems: 'start',
        }}
      >
        {/* ── Text column ── */}
        <div style={{ order: isEven ? 0 : 1 }}>
          {/* Number + tag */}
          <motion.div variants={fadeUp} style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
          }}>
            <span style={{
              fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(148,230,251,0.35)',
              fontFamily: "'Rajdhani', monospace", fontWeight: 500,
            }}>
              {item.number}
            </span>
            <span style={{
              width: 32, height: 1,
              background: 'rgba(148,230,251,0.25)',
              display: 'block', flexShrink: 0,
            }} />
            <span style={{
              fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(148,230,251,0.55)',
              fontFamily: "'Rajdhani', monospace", fontWeight: 500,
            }}>
              {item.tag}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2 variants={fadeUp} style={{
            fontSize: 'clamp(28px, 3.2vw, 46px)',
            fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12,
            color: '#E5FAFF', marginBottom: 20,
          }}>
            {item.title}
          </motion.h2>

          {/* Body */}
          <motion.p variants={fadeUp} style={{
            fontSize: 'clamp(14px, 1.2vw, 16px)',
            fontWeight: 300, lineHeight: 1.75, color: 'rgba(229,250,255,0.55)',
            marginBottom: 36, maxWidth: 460,
          }}>
            {item.body}
          </motion.p>

          {/* Links */}
          <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {item.links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(148,230,251,0.75)', textDecoration: 'none',
                  fontFamily: "'Rajdhani', monospace", fontWeight: 600,
                  padding: '10px 20px',
                  border: '1px solid rgba(148,230,251,0.2)',
                  borderRadius: 2, transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(148,230,251,0.55)'
                  e.currentTarget.style.color = '#94E6FB'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(148,230,251,0.2)'
                  e.currentTarget.style.color = 'rgba(148,230,251,0.75)'
                }}
              >
                {link.label}
                <span style={{ opacity: 0.6 }}>→</span>
              </a>
            ))}
          </motion.div>
        </div>

        {/* ── Image column ── */}
        <div style={{
          order: isEven ? 1 : 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: 10,
        }}>
          {item.images.map((img, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={imageVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              style={{
                gridColumn: i === 0 ? '1 / 3' : 'auto',
                borderRadius: 4,
                overflow: 'hidden',
                aspectRatio: i === 0 ? '16/9' : '4/3',
                background: 'rgba(148,230,251,0.04)',
                border: '1px solid rgba(148,230,251,0.08)',
                position: 'relative',
              }}
            >
              {/* Placeholder shimmer until real images */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(148,230,251,0.04) 0%, rgba(4,17,31,0.8) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
                  color: 'rgba(148,230,251,0.2)',
                  fontFamily: "'Rajdhani', monospace",
                }}>
                  {img.alt}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  position: 'relative', zIndex: 1,
                }}
                onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

const SPOTLIGHTS: SpotlightItem[] = [
  {
    number: '01',
    tag:    'The Core Problem',
    title:  'Bridging the Strategy to Execution Gap',
    body:   'Most strategies fail not because they\'re flawed — but because they never get executed. '
          + 'The gap between what leaders plan and what organisations actually deliver is the defining '
          + 'challenge of modern leadership. Ali\'s work starts exactly here.',
    links: [
      { label: 'Explore the Framework', href: '#gap' },
      { label: 'Read the Research',     href: '#about' },
    ],
    images: [
      { src: '/assets/gap-framework.jpg', alt: 'Strategy Execution Framework' },
      { src: '/assets/gap-diagram.jpg',   alt: 'Gap Diagram' },
      { src: '/assets/gap-results.jpg',   alt: 'Execution Results' },
    ],
  },
  {
    number: '02',
    tag:    'AI & Innovation',
    title:  'AI in Strategy Execution',
    body:   'AI isn\'t just a tool — it\'s a force multiplier for strategy execution. From real-time '
          + 'performance dashboards to AI-powered scenario planning, Ali integrates next-generation '
          + 'frameworks that help leaders make faster, better decisions.',
    links: [
      { label: 'See the AI Frameworks', href: '#ai' },
      { label: 'Learn More',            href: '#course' },
    ],
    images: [
      { src: '/assets/ai-dashboard.jpg',   alt: 'AI Strategy Dashboard' },
      { src: '/assets/ai-framework.jpg',   alt: 'AI Framework Output' },
      { src: '/assets/ai-scenario.jpg',    alt: 'Scenario Planning' },
    ],
  },
  {
    number: '03',
    tag:    'Working Together',
    title:  'How We Work Together',
    body:   'Whether you need a keynote that moves an audience, a bespoke advisory engagement, '
          + 'or a structured digital program your team can run at scale — there\'s a way to work '
          + 'with Ali that fits where you are right now.',
    links: [
      { label: 'Book a Consultation',  href: '#book' },
      { label: 'View the Course',      href: '#course' },
    ],
    images: [
      { src: '/assets/workshop.jpg',   alt: 'Workshop Session' },
      { src: '/assets/conference.jpg', alt: 'Conference Talk' },
      { src: '/assets/consulting.jpg', alt: '1-on-1 Advisory' },
    ],
  },
]

export default function SpotlightSections() {
  return (
    <div style={{ background: '#04111f' }}>
      {SPOTLIGHTS.map((item, i) => (
        <SpotlightCard key={item.number} item={item} index={i} />
      ))}
    </div>
  )
}
