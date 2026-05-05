'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, Menu, X } from 'lucide-react'

const LINKS = [
  { href: '#bridge', label: 'The Gap' },
  { href: '#products', label: 'Products' },
  { href: '#ai', label: 'AI' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'Process' },
]

export default function AliNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="ali-nav" data-scrolled={scrolled}>
        <a href="#top" className="ali-nav-brand" aria-label="Ali Al-Ali home">
          <strong>Ali Al-Ali</strong>
          <span>Strategy · Execution</span>
        </a>

        <nav className="ali-nav-links" aria-label="Primary">
          {LINKS.map(l => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <a href="#book" className="ali-nav-cta">
          <CalendarClock size={14} />
          Book a Call
        </a>

        <button
          type="button"
          className="ali-nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div className="ali-mobile-menu" data-open={open} aria-hidden={!open}>
        {LINKS.map(l => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a
          href="#book"
          onClick={() => setOpen(false)}
          className="ali-btn ali-btn--primary"
          style={{ marginTop: 12 }}
        >
          <CalendarClock size={16} />
          Book a Call
        </a>
      </div>
    </>
  )
}
