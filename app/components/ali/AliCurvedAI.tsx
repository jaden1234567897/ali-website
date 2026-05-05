'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

// Distorted Gallery — cinematic 3D perspective carousel
// • Active image centered, full-size
// • Surrounding images rotate / distort to the sides
// • Autoplay every 7s
// • Arrow buttons + keyboard arrow keys + touch swipe navigation
// • Hover lifts brightness + shadow for active card
const IMAGES = [
  '/ali-photo.jpg',
  '/aboutme%202.jpg',
  '/aboutme%203.jpg',
  '/aboutme%204.jpg',
  '/aboutme%205.jpg',
]

const AUTOPLAY_MS = 7000
const TRANSITION_MS = 700

export default function AliCurvedAI() {
  const [active, setActive] = useState(0)
  const total = IMAGES.length
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const lastUserActionAt = useRef<number>(0)

  const goNext = useCallback(() => {
    setActive(prev => (prev + 1) % total)
    lastUserActionAt.current = Date.now()
  }, [total])
  const goPrev = useCallback(() => {
    setActive(prev => (prev - 1 + total) % total)
    lastUserActionAt.current = Date.now()
  }, [total])
  const goTo = useCallback((idx: number) => {
    setActive(idx)
    lastUserActionAt.current = Date.now()
  }, [])

  // Autoplay (pauses for 1 cycle after user interaction)
  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() - lastUserActionAt.current < AUTOPLAY_MS) return
      setActive(prev => (prev + 1) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [total])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  // Touch swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const dx = endX - touchStartX.current
    if (Math.abs(dx) > 60) {
      if (dx > 0) goPrev()
      else goNext()
    }
    touchStartX.current = null
  }

  return (
    <section
      id="ai"
      style={{
        position: 'relative',
        width: '100%',
        background: 'var(--ali-cream)',
        padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 96px)',
        overflow: 'hidden',
      }}
      aria-label="Ali Al-Ali — Gallery"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          className="ali-eyebrow"
          style={{
            justifyContent: 'center',
            display: 'inline-flex',
            marginBottom: 16,
          }}
        >
          Gallery
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.4vw, 46px)',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--ali-ink)',
            margin: '0 auto 56px',
            maxWidth: 720,
          }}
        >
          From the work, the room, the field.
        </h2>

        {/* 3D stage */}
        <div
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(360px, 56vh, 620px)',
            perspective: 1600,
            perspectiveOrigin: '50% 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            userSelect: 'none',
          }}
          role="region"
          aria-roledescription="carousel"
          aria-live="polite"
        >
          {IMAGES.map((src, i) => {
            // Compute the shortest signed distance from active in either direction
            let offset = i - active
            if (offset > total / 2) offset -= total
            if (offset < -total / 2) offset += total

            const abs = Math.abs(offset)
            const isActive = offset === 0

            // 3D distortion math:
            // active: front, full size, no rotation
            // ±1: tilted 35°, pushed back, slightly smaller
            // ±2: tilted 55°, pushed further back, smallest
            const rotateY = offset === 0 ? 0 : Math.sign(offset) * (35 + (abs - 1) * 20)
            const translateX = offset * 38 // % of base width
            const translateZ = offset === 0 ? 0 : -120 - (abs - 1) * 100
            const scale = offset === 0 ? 1 : 0.85 - (abs - 1) * 0.08
            const opacity = abs <= 2 ? 1 - (abs - 0) * 0.08 : 0
            const zIndex = 10 - abs

            return (
              <div
                key={src}
                aria-hidden={!isActive}
                onClick={() => goTo(i)}
                style={{
                  position: 'absolute',
                  width: 'min(64vw, 720px)',
                  height: '100%',
                  borderRadius: 18,
                  overflow: 'hidden',
                  cursor: isActive ? 'default' : 'pointer',
                  transformStyle: 'preserve-3d',
                  transform: `translate(-50%, 0) translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  left: '50%',
                  transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${TRANSITION_MS}ms ease, filter ${TRANSITION_MS}ms ease`,
                  willChange: 'transform, opacity',
                  zIndex,
                  opacity,
                  boxShadow: isActive
                    ? '0 30px 80px -20px rgba(20,20,40,0.5), 0 10px 24px -10px rgba(20,20,40,0.3)'
                    : '0 12px 30px -10px rgba(20,20,40,0.25)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  background: '#fff',
                  filter: isActive ? 'brightness(1)' : 'brightness(0.78)',
                }}
                onMouseEnter={e => {
                  if (isActive) {
                    e.currentTarget.style.boxShadow =
                      '0 36px 90px -18px rgba(20,20,40,0.55), 0 12px 28px -10px rgba(20,20,40,0.35)'
                    e.currentTarget.style.filter = 'brightness(1.05)'
                  }
                }}
                onMouseLeave={e => {
                  if (isActive) {
                    e.currentTarget.style.boxShadow =
                      '0 30px 80px -20px rgba(20,20,40,0.5), 0 10px 24px -10px rgba(20,20,40,0.3)'
                    e.currentTarget.style.filter = 'brightness(1)'
                  }
                }}
              >
                <Image
                  src={src}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 90vw, 720px"
                  quality={95}
                  priority={isActive}
                  draggable={false}
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Controls — arrows + dot indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            marginTop: 48,
          }}
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              border: '1px solid var(--ali-line)',
              background: 'transparent',
              color: 'var(--ali-ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212, 178, 87, 0.1)'
              e.currentTarget.style.borderColor = 'var(--ali-gold)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--ali-line)'
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              letterSpacing: '0.18em',
              color: 'var(--ali-muted)',
              minWidth: 60,
              textAlign: 'center',
            }}
          >
            {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              border: '1px solid var(--ali-line)',
              background: 'transparent',
              color: 'var(--ali-ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212, 178, 87, 0.1)'
              e.currentTarget.style.borderColor = 'var(--ali-gold)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--ali-line)'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
