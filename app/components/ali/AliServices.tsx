'use client'

import { motion } from 'framer-motion'

const SERVICES = [
  {
    num: '01',
    title: 'Strategy Function Design & Set-Up',
    desc: 'Build the strategy capability your organization actually needs — from charter and team structure to operating rhythm and governance forums.',
  },
  {
    num: '02',
    title: 'Strategy Execution',
    desc: 'Translate strategic ambition into delivery. Ownership, accountability, cadence, and the operating model that makes it real.',
  },
  {
    num: '03',
    title: 'Annual Planning',
    desc: 'Run an annual planning process that produces clarity instead of compromise — aligned across strategy, budget, and performance.',
  },
  {
    num: '04',
    title: 'AI for Strategy & Planning',
    desc: 'Embed AI tools and frameworks into your strategy workflow to compress decision timelines and surface evidence before the room asks.',
  },
]

export default function AliServices() {
  return (
    <section id="services" className="ali-section">
      <div className="ali-container">
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
            Services
          </p>
          <h2 className="ali-h2">
            Four ways we work <em>together</em>
          </h2>
          <p className="ali-lede" style={{ margin: '0 auto' }}>
            Each engagement starts with a free 45-minute scoping call.
            No pitch — just a clear read on whether we're a fit.
          </p>
        </div>

        <div className="ali-services-grid">
          {SERVICES.map((s, i) => (
            <motion.a
              key={s.num}
              href="#book"
              className="ali-service"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ali-service-num">{s.num}</div>
              <h3 className="ali-service-title">{s.title}</h3>
              <p className="ali-service-desc">{s.desc}</p>
              <span className="ali-service-link">Book a scoping call</span>
            </motion.a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <a href="#book" className="ali-btn ali-btn--primary">
            Book a Consultation
          </a>
        </div>
      </div>
    </section>
  )
}
