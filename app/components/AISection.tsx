'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  {
    title: 'OKR Cascade Framework',
    label: 'Alignment Tool',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
  {
    title: 'Strategy Map Blueprint',
    label: 'Visualisation',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  },
  {
    title: 'AI Decision Framework',
    label: 'AI Output',
    img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80',
  },
  {
    title: 'Execution Rhythm Design',
    label: 'Governance Model',
    img: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&q=80',
  },
  {
    title: 'Accountability Matrix',
    label: 'Ownership Map',
    img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
  },
  {
    title: 'KPI Performance Board',
    label: 'Measurement',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
  },
  {
    title: 'AI Strategy Analysis',
    label: 'AI Output',
    img: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=600&q=80',
  },
  {
    title: 'Leadership Alignment',
    label: 'Team Framework',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
  },
]

const COUNT = ITEMS.length
const ANGLE_STEP = 360 / COUNT

export default function AISection() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const itemEls = useRef<(HTMLDivElement | null)[]>([])
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const track = trackRef.current
    if (!wrapper || !track) return

    const radius = Math.min(520, window.innerWidth * 0.38)

    itemEls.current.forEach((el, i) => {
      if (!el) return
      el.style.transform = `rotateY(${i * ANGLE_STEP}deg) translateZ(${radius}px)`
    })

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: `+=${window.innerHeight * 4}`,
        pin: true,
        scrub: 1.4,
        anticipatePin: 1,
        onUpdate(self) {
          const deg = self.progress * 360
          track.style.transform = `rotateY(${deg}deg)`

          itemEls.current.forEach((el, i) => {
            if (!el) return
            const itemDeg = i * ANGLE_STEP
            const rel = ((itemDeg + deg) % 360 + 360) % 360
            const norm = rel > 180 ? 360 - rel : rel
            el.style.opacity = String(Math.max(0.1, 1 - norm / 168))
          })

          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${self.progress * 100}%`
          }
        },
      })
    }, wrapper)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={wrapperRef}
      data-coins="back"
      id="ai"
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-deep)',
        borderTop: '1px solid var(--line)',
      }}
    >
      {/* Section header */}
      <div style={{
        position: 'absolute',
        top: 'clamp(52px, 9vh, 90px)',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        <p style={{
          color: 'var(--quiet)',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          AI in Strategy
        </p>
        <h2 style={{
          color: 'var(--ink-strong)',
          fontSize: 'clamp(26px, 3.8vw, 50px)',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1.12,
        }}>
          Strategy without AI is strategy<br />
          left on the table
        </h2>
      </div>

      {/* 3D carousel stage */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1900px',
      }}>
        <div
          ref={trackRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            transformStyle: 'preserve-3d',
          }}
        >
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              ref={el => { itemEls.current[i] = el }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 250,
                height: 340,
                marginLeft: -125,
                marginTop: -170,
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid oklch(0.78 0.13 220 / 0.18)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.72)',
                transition: 'opacity 0.08s linear',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.img}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '56px 18px 18px',
                background: 'linear-gradient(to top, rgba(2,8,18,0.94), transparent)',
                color: '#fff',
              }}>
                <p style={{
                  fontSize: 9,
                  color: 'var(--accent)',
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}>
                  {item.label}
                </p>
                <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom progress + hint */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(24px, 4.5vh, 52px)',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        <p style={{
          color: 'var(--quiet)',
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
        }}>
          Scroll to explore
        </p>
        <div style={{
          width: 160,
          height: 2,
          background: 'var(--line)',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <div
            ref={progressBarRef}
            style={{
              width: '0%',
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 1,
              transition: 'width 0.05s linear',
            }}
          />
        </div>
      </div>
    </div>
  )
}
