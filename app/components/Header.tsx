'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'About',       href: '#about' },
  { label: 'Services',    href: '#services' },
  { label: 'Course',      href: '#course' },
  { label: 'AI Strategy', href: '#ai' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background:    scrolled ? 'rgba(5,5,5,0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom:  scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition:    'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between" style={{ height: 68 }}>

        {/* Wordmark */}
        <a href="/" className="flex flex-col leading-none select-none">
          <span className="text-white font-semibold tracking-tight" style={{ fontSize: 15 }}>
            Ali Al-Ali
          </span>
          <span
            className="text-white/40 font-light uppercase"
            style={{ fontSize: 9, letterSpacing: '0.22em', marginTop: 3 }}
          >
            Strategy · Execution
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white/55 font-light hover:text-white transition-colors duration-200"
              style={{ fontSize: 13.5 }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href="#contact"
            className="text-white/50 font-light hover:text-white transition-colors duration-200"
            style={{ fontSize: 13.5 }}
          >
            Contact
          </a>
          <a
            href="#book"
            className="text-black font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all duration-200"
            style={{
              background: '#ffffff',
              fontSize: 13,
              padding: '9px 22px',
              outline: 'none',
              border: 'none',
              display: 'inline-block',
            }}
          >
            Book a Call
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8"
          aria-label="Toggle menu"
          style={{ outline: 'none', border: 'none', background: 'none' }}
        >
          <motion.span
            animate={open ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.22 }}
            className="block w-5 origin-center"
            style={{ height: 1, background: 'white' }}
          />
          <motion.span
            animate={open ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="block w-5"
            style={{ height: 1, background: 'white' }}
          />
          <motion.span
            animate={open ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.22 }}
            className="block w-5 origin-center"
            style={{ height: 1, background: 'white' }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              background: 'rgba(5,5,5,0.96)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="px-6 py-8 flex flex-col gap-5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-white/65 font-light hover:text-white transition-colors"
                  style={{ fontSize: 16 }}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-2 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <a href="#contact" className="text-white/50 font-light" style={{ fontSize: 15 }}>Contact</a>
                <a
                  href="#book"
                  onClick={() => setOpen(false)}
                  className="text-black font-semibold rounded-full text-center"
                  style={{
                    background: '#ffffff',
                    fontSize: 14,
                    padding: '12px 24px',
                    outline: 'none',
                    border: 'none',
                    display: 'block',
                  }}
                >
                  Book a Call
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
