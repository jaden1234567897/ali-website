'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    title: 'Diagnose',
    desc: 'A deep-dive into your strategy-execution gap. Where is the disconnect, and what is actually blocking results.',
    bullets: ['Executive interviews', 'Strategy clarity audit', 'Bottleneck mapping'],
  },
  {
    num: '02',
    title: 'Design',
    desc: 'Frameworks and systems built for your organisation — not off-the-shelf templates, but tools your teams will actually use.',
    bullets: ['Custom strategy frameworks', 'AI-powered planning tools', 'Governance & accountability'],
  },
  {
    num: '03',
    title: 'Deploy',
    desc: 'In the room through execution. Not just advisors — partners accountable for real results alongside your leadership team.',
    bullets: ['Implementation leadership', 'Team coaching & enablement', 'Iteration & tracking'],
  },
]

export default function AliProcess() {
  return (
    <section id="process" className="ali-section ali-section--white">
      <div className="ali-container">
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
            The Process
          </p>
          <h2 className="ali-h2">
            From <em>diagnosis</em> to delivery
          </h2>
          <p className="ali-lede" style={{ margin: '0 auto' }}>
            A structured, high-accountability engagement that moves from
            diagnosis to real outcomes.
          </p>
        </div>

        <div className="ali-process">
          <div className="ali-process-line" aria-hidden="true" />
          <div className="ali-process-grid">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="ali-process-step"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="ali-process-num">{step.num}</div>
                <h3 className="ali-process-title">{step.title}</h3>
                <p className="ali-process-desc">{step.desc}</p>
                <ul className="ali-process-bullets">
                  {step.bullets.map(b => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
