'use client'

import { motion, type Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const fade: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } }

export default function AboutSection() {
  return (
    <section
      id="about"
      style={{
        position: 'relative',
        background: '#000',
        padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 80px)',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '30%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(103,232,249,0.04) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section label */}
        <motion.p
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fade}
          style={{ color: 'rgba(103,232,249,0.55)', fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', fontWeight: 300, marginBottom: 16, textAlign: 'center' }}
        >
          About
        </motion.p>
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fade}
          style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 'clamp(48px, 7vw, 80px)', textAlign: 'center' }}
        >
          Meet Ali Al-Ali
        </motion.h2>

        {/* Desktop layout — photo left, card right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              flexShrink: 0,
              width: 'clamp(260px, 35vw, 440px)',
              aspectRatio: '1 / 1',
              borderRadius: 32,
              overflow: 'hidden',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Image
              src="/ali-photo.jpg"
              alt="Ali Al-Ali"
              fill
              style={{ objectFit: 'cover', objectPosition: 'top center' }}
              priority
            />
            {/* Photo vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none',
            }} />
          </motion.div>

          {/* Overlapping card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            style={{
              background: 'rgba(4,17,31,0.95)',
              border: '1px solid rgba(103,232,249,0.12)',
              borderRadius: 28,
              padding: 'clamp(32px, 4vw, 52px)',
              marginLeft: 'clamp(-60px, -5vw, -80px)',
              position: 'relative',
              zIndex: 2,
              flex: 1,
              boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <p style={{ color: 'rgba(103,232,249,0.6)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 400, marginBottom: 12 }}>
              Executive Advisor
            </p>
            <h3 style={{ color: '#fff', fontSize: 'clamp(22px, 2.8vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Ali Al-Ali
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 300, marginBottom: 28 }}>
              Strategy · Governance · Execution
            </p>

            <p style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 'clamp(14px, 1.3vw, 16px)',
              fontWeight: 300,
              lineHeight: 1.75,
              marginBottom: 20,
            }}>
              With over 15 years of experience across the GCC and beyond, Ali Al-Ali has built a reputation as the advisor leaders call when strategy stops turning into results. He has worked with C-suite executives, government entities, and high-growth organizations to close the gap between where they want to go and what actually gets done.
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 'clamp(13px, 1.2vw, 15px)',
              fontWeight: 300,
              lineHeight: 1.75,
              marginBottom: 36,
            }}>
              Ali's work spans executive advisory, leadership coaching, and AI-powered strategy frameworks — giving organizations not just a plan, but the operational precision to execute it.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 'clamp(24px, 4vw, 48px)', marginBottom: 36, paddingTop: 24, borderTop: '1px solid rgba(103,232,249,0.1)' }}>
              {[
                { value: '15+', label: 'Years Experience' },
                { value: 'GCC', label: 'Regional Focus' },
                { value: '100+', label: 'Leaders Coached' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ color: 'rgb(103,232,249)', fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 6 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="#book"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#fff', color: '#000',
                  fontWeight: 600, fontSize: 13,
                  padding: '12px 24px', borderRadius: 9999,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                Work With Ali
              </a>
              <Link
                href="https://linkedin.com"
                target="_blank"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'transparent', color: 'rgba(255,255,255,0.6)',
                  fontWeight: 400, fontSize: 13,
                  padding: '11px 20px', borderRadius: 9999,
                  border: '1px solid rgba(255,255,255,0.15)',
                  textDecoration: 'none',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Mobile layout — stacked */}
        <style>{`
          @media (max-width: 768px) {
            .about-layout { flex-direction: column !important; }
            .about-card { margin-left: 0 !important; margin-top: -40px !important; width: 100% !important; }
            .about-photo { width: 100% !important; }
          }
        `}</style>

      </div>
    </section>
  )
}
