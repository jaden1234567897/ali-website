'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ArrowUp, CalendarClock, Download, MessageCircle, Network } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

function MagneticLink({
  href,
  children,
  className = '',
  onClick,
}: {
  href?: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const move = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      gsap.to(el, {
        x: x * 0.22,
        y: y * 0.22,
        rotationX: -y * 0.08,
        rotationY: x * 0.08,
        scale: 1.04,
        duration: 0.35,
        ease: 'power2.out',
      })
    }

    const leave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.35)',
      })
    }

    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <a ref={ref} href={href ?? '#'} onClick={onClick} className={`footer-pill ${className}`}>
      {children}
    </a>
  )
}

function MarqueeTrack() {
  return (
    <div className="footer-marquee-track">
      {Array.from({ length: 2 }).map((_, loop) => (
        <div className="footer-marquee-copy" key={loop}>
          <span>Diagnose the gap</span>
          <b />
          <span>Design the cadence</span>
          <b />
          <span>Build execution governance</span>
          <b />
          <span>Scale with AI</span>
          <b />
        </div>
      ))}
    </div>
  )
}

export default function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const giantRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantRef.current,
        { y: '14vh', scale: 0.82, opacity: 0 },
        {
          y: '0vh',
          scale: 1,
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 80%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )

      gsap.fromTo(
        contentRef.current,
        { y: 64, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 48%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )
    }, wrapper)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="cinematic-footer-wrapper"
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
    >
      <footer className="cinematic-footer">
        <div className="footer-aurora" aria-hidden="true" />
        <div className="footer-grid" aria-hidden="true" />
        <div ref={giantRef} className="footer-giant" aria-hidden="true">
          EXECUTE
        </div>

        <div className="footer-marquee">
          <MarqueeTrack />
        </div>

        <div ref={contentRef} className="footer-center">
          <p className="section-label">How we can work together</p>
          <h2>Ready to close the gap?</h2>
          <p>
            Start with a focused consultation, move into the course and templates, then build the governance
            rhythm that keeps strategy alive after the workshop ends.
          </p>

          <div className="footer-actions">
            <MagneticLink href="#book">
              <CalendarClock size={18} aria-hidden="true" />
              Book advisory
            </MagneticLink>
            <MagneticLink href="#course">
              <Download size={18} aria-hidden="true" />
              Course access
            </MagneticLink>
            <MagneticLink href="https://www.linkedin.com/in/alialali1" className="footer-pill-muted">
              <Network size={18} aria-hidden="true" />
              LinkedIn
            </MagneticLink>
            <MagneticLink href="#contact" className="footer-pill-muted">
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp
            </MagneticLink>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Ali Al-Ali / Strategy to execution</span>
          <MagneticLink
            className="footer-top-button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp size={18} aria-hidden="true" />
          </MagneticLink>
        </div>
      </footer>
    </div>
  )
}
