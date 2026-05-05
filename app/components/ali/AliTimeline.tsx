'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const ITEMS = [
  {
    num: '01',
    title: 'Most Organizations Have a Gap',
    body: 'Strategy teams produce the vision. Delivery units do the work. But no one owns the translation layer in between — and that gap is where momentum dies.',
    side: 'left',
  },
  {
    num: '02',
    title: 'Governance That Actually Delivers',
    body: 'We design operating frameworks and governance structures that make execution inevitable — not aspirational. Clear ownership. Aligned accountability.',
    side: 'right',
  },
  {
    num: '03',
    title: 'AI-Sharpened Decisions',
    body: 'Artificial intelligence compresses weeks of strategic analysis into hours. Leaders get clearer evidence, faster — so decisions improve without slowing down.',
    side: 'left',
  },
  {
    num: '04',
    title: 'Strategy Meets the Budget',
    body: 'We align planning, budgeting, and performance management so resources flow toward what actually matters — not last year\'s priorities.',
    side: 'right',
  },
  {
    num: '05',
    title: 'From Slide to Outcome',
    body: 'Strategy without execution is just a slide deck. We close the gap — one initiative, one decision forum, one operating model at a time.',
    side: 'left',
  },
] as const

export default function AliTimeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const line = lineRef.current
    if (!section || !line || typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // ── Draw the vertical line as user scrolls through the section ───────
      const totalH = section.getBoundingClientRect().height
      const pathLen = line.getTotalLength?.() ?? totalH

      gsap.set(line, { strokeDasharray: pathLen, strokeDashoffset: pathLen })

      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        end: 'bottom 40%',
        scrub: 0.6,
        onUpdate(self) {
          const offset = pathLen * (1 - self.progress)
          line.style.strokeDashoffset = offset.toFixed(2)
        },
        invalidateOnRefresh: true,
      })

      // ── Reveal each card + dot when it enters the viewport ───────────────
      itemRefs.current.forEach((item, i) => {
        if (!item) return
        const dot = dotRefs.current[i]
        const isLeft = ITEMS[i].side === 'left'

        gsap.fromTo(
          item,
          { opacity: 0, y: 36, x: isLeft ? 20 : -20 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            ease: 'power3.out',
            duration: 0.8,
            scrollTrigger: {
              trigger: item,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          },
        )

        if (dot) {
          gsap.fromTo(
            dot,
            { opacity: 0, scale: 0 },
            {
              opacity: 1,
              scale: 1,
              ease: 'back.out(2)',
              duration: 0.5,
              scrollTrigger: {
                trigger: item,
                start: 'top 78%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="bridge" className="ali-timeline">
      <div className="ali-tl-head">
        <p className="ali-tl-eyebrow">✦ &nbsp; Bridging the Gap</p>
        <h2 className="ali-tl-title">
          Where strategy stops being aspiration
          <br />and becomes operational reality.
        </h2>
      </div>

      <div className="ali-tl-track">
        {/* Animated SVG line running the full height of the track */}
        <svg
          className="ali-tl-svg"
          viewBox={`0 0 2 800`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path ref={lineRef} className="ali-tl-path" d="M 1 0 L 1 800" />
        </svg>

        <div className="ali-tl-items">
          {ITEMS.map((item, i) => (
            <div
              key={item.num}
              className={`ali-tl-item ali-tl-item--${item.side}`}
              style={{ position: 'relative' }}
            >
              {/* Gold dot on the line */}
              <div
                ref={el => {
                  dotRefs.current[i] = el
                }}
                className="ali-tl-dot"
                aria-hidden="true"
                style={{
                  top: '50%',
                  position: 'absolute',
                }}
              />

              <div
                ref={el => {
                  itemRefs.current[i] = el
                }}
                className="ali-tl-card"
              >
                <p className="ali-tl-num">{item.num}</p>
                <h3 className="ali-tl-card-title">{item.title}</h3>
                <p className="ali-tl-card-body">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
