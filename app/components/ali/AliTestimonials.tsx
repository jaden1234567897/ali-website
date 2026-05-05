'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote:
      'Ali helped us transform a perfectly crafted strategy into a living, breathing operating model. Our execution scores improved by over 40% within six months.',
    name: 'Chief Strategy Officer',
    org: 'Regional Financial Institution',
    initial: 'C',
  },
  {
    quote:
      'A rare ability to translate abstract strategy into concrete daily actions that people actually follow. The clarity he brought to our leadership team was remarkable.',
    name: 'Chief Executive',
    org: 'Technology Scale-up · UAE',
    initial: 'E',
  },
  {
    quote:
      'The AI-assisted planning tools alone saved us weeks of manual reporting every quarter. Working with Ali on our OKR rollout was genuinely transformative.',
    name: 'VP Strategy',
    org: 'Multinational FMCG Group',
    initial: 'V',
  },
]

export default function AliTestimonials() {
  return (
    <section id="testimonials" className="ali-section">
      <div className="ali-container">
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
            What Leaders Say
          </p>
          <h2 className="ali-h2">
            Voices from inside the <em>boardroom</em>
          </h2>
        </div>

        <div className="ali-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              className="ali-testimonial"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ali-testimonial-mark" aria-hidden="true">"</div>
              <blockquote className="ali-testimonial-quote">{t.quote}</blockquote>
              <figcaption className="ali-testimonial-attr">
                <div className="ali-testimonial-avatar">{t.initial}</div>
                <div>
                  <div className="ali-testimonial-name">{t.name}</div>
                  <div className="ali-testimonial-org">{t.org}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
