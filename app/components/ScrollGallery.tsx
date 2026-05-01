'use client'

import { useEffect, useRef, useState } from 'react'
import { BadgeCheck } from 'lucide-react'

const cards = [
  {
    title: 'Strategy Map',
    eyebrow: 'AI Output',
    body: 'North-star objective, value pools, initiative clusters, and leadership decisions in one executive view.',
  },
  {
    title: 'Execution Cadence',
    eyebrow: 'Governance',
    body: 'Weekly decision rhythm, owner map, risk log, and 30/60/90-day milestones for fast movement.',
  },
  {
    title: 'Gap Diagnostic',
    eyebrow: 'Assessment',
    body: 'Fragmented ownership, unclear accountability, weak prioritization, and bottlenecks translated into actions.',
  },
  {
    title: 'Board Narrative',
    eyebrow: 'Communication',
    body: 'A concise story for executives: what changed, what matters, what trade-offs need approval.',
  },
  {
    title: 'AI Prompt System',
    eyebrow: 'Toolkit',
    body: 'Reusable prompts and templates for scenario planning, initiative scoring, and progress reviews.',
  },
]

export default function ScrollGallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const [rotation, setRotation] = useState(0)
  const [radius, setRadius] = useState(420)

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current
      if (!el) return
      setRadius(window.innerWidth < 760 ? 245 : window.innerWidth < 1020 ? 330 : 420)
      const rect = el.getBoundingClientRect()
      const scrollable = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      setRotation(progress * 360)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const anglePerCard = 360 / cards.length

  return (
    <section ref={sectionRef} id="ai" className="gallery-scroll-section">
      <div className="gallery-sticky">
        <div className="gallery-copy">
          <p className="section-label">AI in strategy execution</p>
          <h2>Sexy outputs that make leadership decisions easier.</h2>
          <p>
            The AI layer turns strategy work into tangible artifacts: diagnostics, initiative scoring,
            operating cadences, and executive narratives that teams can actually use.
          </p>
        </div>

        <div className="gallery-stage" aria-label="Rotating AI strategy output gallery">
          <div
            className="gallery-ring"
            style={{ transform: `rotateY(${rotation}deg)` }}
          >
            {cards.map((card, index) => {
              const angle = index * anglePerCard
              const relative = Math.abs(((angle + rotation + 540) % 360) - 180)
              const opacity = Math.max(0.28, 1 - relative / 220)

              return (
                <article
                  className="gallery-card"
                  key={card.title}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    opacity,
                  }}
                >
                  <div className="gallery-card-top">
                    <span>{card.eyebrow}</span>
                    <BadgeCheck size={16} aria-hidden="true" />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <div className="mini-dashboard" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <b />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
