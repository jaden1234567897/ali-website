'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { label: 'About',    href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Course',   href: '#course' },
  { label: 'AI',       href: '#ai' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 'var(--header-h)',
        background: scrolled ? 'rgba(0,9,20,0.85)' : 'none',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Wordmark */}
        <a href="#" style={{ textDecoration: 'none', lineHeight: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14.5, letterSpacing: '-0.01em' }}>Ali Al-Ali</div>
          <div style={{ color: 'rgba(34,211,238,0.5)', fontWeight: 300, fontSize: 8, letterSpacing: '0.32em', textTransform: 'uppercase', marginTop: 4 }}>
            Strategy · Execution
          </div>
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="nav-desktop">
          {LINKS.map(l => (
            <a key={l.label} href={l.href} style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 300,
              textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="nav-desktop">
          <a href="#contact" style={{
            color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 300,
            textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            Contact
          </a>
          <a href="#book" style={{
            fontSize: 12, fontWeight: 500, padding: '7px 18px', borderRadius: 999,
            textDecoration: 'none', color: 'var(--accent)',
            border: '1px solid rgba(34,211,238,0.3)',
            background: 'rgba(34,211,238,0.05)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.12)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.05)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)' }}
          >
            Book a Call
          </a>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="nav-mobile"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }}
          aria-label="Menu"
        >
          <span style={{ display: 'block', width: 22, height: 1, background: '#fff', marginBottom: 6, transition: 'transform 0.22s, opacity 0.22s', transform: open ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 1, background: '#fff', marginBottom: 6, opacity: open ? 0 : 1, transition: 'opacity 0.18s' }} />
          <span style={{ display: 'block', width: 22, height: 1, background: '#fff', transition: 'transform 0.22s', transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{
              background: 'rgba(0,9,20,0.97)', backdropFilter: 'blur(24px)',
              borderTop: '1px solid var(--border)', padding: '28px var(--section-x) 36px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {LINKS.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                  style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, fontWeight: 300, textDecoration: 'none', letterSpacing: '0.02em' }}>
                  {l.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)}
                style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 300, textDecoration: 'none', marginTop: 6, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                Contact
              </a>
              <a href="#book" onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(34,211,238,0.08)', color: 'var(--accent)',
                  border: '1px solid rgba(34,211,238,0.25)',
                  fontWeight: 500, fontSize: 14, padding: '13px 24px',
                  borderRadius: 999, textDecoration: 'none', textAlign: 'center', display: 'block',
                }}>
                Book a Call
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
