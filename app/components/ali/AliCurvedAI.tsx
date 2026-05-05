'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = {
  id: string
  label: string
  title: string
  img: string
}

const SLIDES: Slide[] = [
  {
    id: 'prompts',
    label: 'AI Prompts',
    title: 'Strategy Prompt Library',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'ogsm',
    label: 'OGSM',
    title: 'AI-assisted OGSM',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'swot',
    label: 'SWOT Analysis',
    title: 'Sharper SWOT in minutes',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'council',
    label: 'Advisory Council',
    title: 'Executive Council Simulator',
    img: 'https://images.unsplash.com/photo-1664575602807-e002fc73754f?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'cascade',
    label: 'OKR Cascade',
    title: 'Cascade & Accountability Map',
    img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80&auto=format&fit=crop',
  },
]

export default function AliCurvedAI() {
  const [active, setActive] = useState(0)
  const [isTouch, setIsTouch] = useState(false)
  const total = SLIDES.length
  const trackRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number | null>(null)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const next = useCallback(() => setActive(i => (i + 1) % total), [total])
  const prev = useCallback(() => setActive(i => (i - 1 + total) % total), [total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startXRef.current === null) return
    const delta = e.changedTouches[0].clientX - startXRef.current
    if (delta > 60) prev()
    else if (delta < -60) next()
    startXRef.current = null
  }

  return (
    <section id="ai" className="ali-section ali-curved">
      <div className="ali-curved-header">
        <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
          AI in Strategy
        </p>
        <h2 className="ali-h2">
          AI makes the thinking <em>sharper</em>, the evidence stronger,
          the conclusions harder to ignore.
        </h2>
        <p className="ali-lede" style={{ margin: '0 auto' }}>
          A glimpse at the frameworks Ali uses to compress decision timelines and
          surface insight before the meeting starts.
        </p>
      </div>

      <div
        className="ali-curved-stage"
        ref={trackRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="AI strategy framework gallery"
        aria-roledescription="carousel"
      >
        <div className="ali-curved-track">
          {SLIDES.map((s, i) => {
            // Position relative to active, wrapping around
            let offset = i - active
            if (offset > total / 2) offset -= total
            if (offset < -total / 2) offset += total
            const abs = Math.abs(offset)

            // Visibility: only render the 5 closest cards
            const visible = abs <= 2

            // Curved arc transform
            const x = offset * (isTouch ? 56 : 32) // base X spacing in %
            const z = -abs * 220
            const rotateY = offset * (isTouch ? -8 : -22)
            const scale = abs === 0 ? 1 : abs === 1 ? 0.86 : 0.72
            const opacity = abs === 0 ? 1 : abs === 1 ? 0.85 : 0.4
            const blur = abs >= 2 ? 4 : 0

            return (
              <div
                key={s.id}
                className="ali-curved-card"
                aria-hidden={!visible || abs > 0}
                aria-roledescription="slide"
                aria-label={`${s.label}: ${s.title}`}
                onClick={() => {
                  if (offset !== 0) setActive(i)
                }}
                style={{
                  transform: `translate(-50%, -50%) translate3d(${x}%, 0, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: visible ? opacity : 0,
                  zIndex: 100 - abs,
                  filter: blur ? `blur(${blur}px)` : 'none',
                  pointerEvents: visible ? 'auto' : 'none',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.title} loading="lazy" />
                <div className="ali-curved-card-label">
                  <small>{s.label}</small>
                  <strong>{s.title}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="ali-curved-controls">
        <button
          type="button"
          className="ali-curved-arrow"
          onClick={prev}
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="ali-curved-counter" aria-live="polite">
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        <button
          type="button"
          className="ali-curved-arrow"
          onClick={next}
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  )
}
