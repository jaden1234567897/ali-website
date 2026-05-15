'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUp, CalendarClock, MessageCircle, Mail } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }

function MagneticAnchor({ children, className = '', ...props }: AnchorProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  useMagnetic(ref)
  return (
    <a ref={ref} className={className} {...props}>
      {children}
    </a>
  )
}

function MagneticButton({ children, className = '', ...props }: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  useMagnetic(ref as React.RefObject<HTMLElement>)
  return (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  )
}

function useMagnetic(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(el, {
        x: x * 0.32,
        y: y * 0.32,
        rotationX: -y * 0.12,
        rotationY: x * 0.12,
        scale: 1.04,
        ease: 'power2.out',
        duration: 0.4,
      })
    }
    const handleLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        ease: 'elastic.out(1, 0.35)',
        duration: 1.0,
      })
    }
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [ref])
}

export default function AliCinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !wrapperRef.current) return

    const ctx = gsap.context(() => {
      // ali-v3: giant EXECUTION banner + "Ready to close the gap?" heading
      // were removed for the new footer direction. Only the action pills
      // get the scroll-fade-up reveal now.
      gsap.fromTo(
        actionsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 50%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )
    }, wrapperRef)

    return () => ctx.revert()
  }, [])

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div ref={wrapperRef} className="ali-cinematic-wrap">
      <footer className="ali-cinematic">
        <div className="ali-cinematic-aurora" aria-hidden="true" />
        <div className="ali-cinematic-grid" aria-hidden="true" />
        {/* ali-v3: giant EXECUTION banner + scrolling marquee removed for
            new footer direction. The "Ready to close the gap?" headline
            was also dropped because that CTA already lives in the
            booking section above the footer. */}

        <div className="ali-cinematic-center">
          <div ref={actionsRef} className="ali-cinematic-actions">
            <div className="ali-cinematic-row">
              <MagneticAnchor href="#book" className="ali-pill">
                <CalendarClock size={18} />
                Book a Free Call
              </MagneticAnchor>

              <MagneticAnchor
                href="https://wa.me/message"
                target="_blank"
                rel="noopener noreferrer"
                className="ali-pill"
              >
                <MessageCircle size={18} />
                WhatsApp Ali
              </MagneticAnchor>

              <MagneticAnchor
                href="https://www.linkedin.com/in/alialali1"
                target="_blank"
                rel="noopener noreferrer"
                className="ali-pill"
              >
                <LinkedinIcon size={18} />
                LinkedIn
              </MagneticAnchor>
            </div>

            <div className="ali-cinematic-row">
              <MagneticAnchor href="#about" className="ali-pill ali-pill--muted">
                About Ali
              </MagneticAnchor>
              <MagneticAnchor href="#products" className="ali-pill ali-pill--muted">
                Products
              </MagneticAnchor>
              <MagneticAnchor href="#course" className="ali-pill ali-pill--muted">
                Course
              </MagneticAnchor>
              <MagneticAnchor href="mailto:hello@alialali.com" className="ali-pill ali-pill--muted">
                <Mail size={14} />
                hello@alialali.com
              </MagneticAnchor>
            </div>
          </div>
        </div>

        <div className="ali-cinematic-bottom">
          <div className="ali-cinematic-credit">
            © {new Date().getFullYear()} Ali Al-Ali · All rights reserved
          </div>

          <div className="ali-cinematic-badge">
            <span>Strategy &nbsp;·&nbsp;</span>
            <strong>Execution</strong>
            <span>&nbsp;·&nbsp; AI</span>
          </div>

          <MagneticButton
            type="button"
            onClick={scrollToTop}
            className="ali-cinematic-back"
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </MagneticButton>
        </div>
      </footer>
    </div>
  )
}
