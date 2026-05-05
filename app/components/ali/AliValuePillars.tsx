'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

type Pillar = {
  name: string
  eyebrow: string
  role: string
  posStart: { x: number; y: number; scale: number }
  posEnd: { x: number; y: number; scale: number }
}

const PILLARS: Pillar[] = [
  {
    name: 'Strategy',
    eyebrow: '01 · Direction',
    role: 'Ambition that holds up under scrutiny.',
    posStart: { x: -120, y: -140, scale: 0.6 },
    posEnd: { x: -22, y: -16, scale: 1 },
  },
  {
    name: 'Governance',
    eyebrow: '02 · Architecture',
    role: 'Ownership, decision rights, accountability.',
    posStart: { x: 120, y: -140, scale: 0.6 },
    posEnd: { x: 22, y: -16, scale: 1 },
  },
  {
    name: 'Execution',
    eyebrow: '03 · Delivery',
    role: 'Outcomes the operating model protects.',
    posStart: { x: 0, y: 160, scale: 0.6 },
    posEnd: { x: 0, y: 22, scale: 1 },
  },
]

export default function AliValuePillars() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.6'],
  })

  const t = useTransform(scrollYProgress, [0, 1], [0, 1])
  const centerOpacity = useTransform(t, [0.6, 0.95], [0, 1])
  const centerScale = useTransform(t, [0.6, 1], [0.92, 1])

  return (
    <section ref={ref} id="value" className="ali-pillars" aria-label="Where Ali operates">
      <div className="ali-pillars-header">
        <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
          Where Ali operates
        </p>
        <h2 className="ali-h2">
          Ambition becomes <em>executable</em> — at the intersection.
        </h2>
      </div>

      <div className="ali-pillars-stage">
        {PILLARS.map(p => (
          <PillarCoin key={p.name} pillar={p} progress={t} />
        ))}

        <motion.div
          className="ali-pillar-center"
          style={{ opacity: centerOpacity, scale: centerScale }}
        >
          <span className="ali-pillar-center-tag">Ali Al-Ali</span>
          <p className="ali-pillar-center-line">
            "I make ambition executable in the real world."
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function PillarCoin({
  pillar,
  progress,
}: {
  pillar: Pillar
  progress: MotionValue<number>
}) {
  const x = useTransform(progress, [0, 1], [`${pillar.posStart.x}%`, `${pillar.posEnd.x}%`])
  const y = useTransform(progress, [0, 1], [`${pillar.posStart.y}%`, `${pillar.posEnd.y}%`])
  const scale = useTransform(progress, [0, 1], [pillar.posStart.scale, pillar.posEnd.scale])
  const opacity = useTransform(progress, [0, 0.4, 1], [0, 1, 1])

  return (
    <motion.div
      className="ali-pillar-coin"
      style={{ x, y, scale, opacity, transformOrigin: 'center center' }}
    >
      <div className="ali-pillar-eyebrow">{pillar.eyebrow}</div>
      <div className="ali-pillar-name">{pillar.name}</div>
      <div className="ali-pillar-role">{pillar.role}</div>
    </motion.div>
  )
}
