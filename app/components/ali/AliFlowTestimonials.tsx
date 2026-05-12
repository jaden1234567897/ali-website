'use client'

// Flow Testimonials — infinite marquee in two rows moving in opposite
// directions. Branch-2 replacement for the static 3-card AliTestimonials
// grid. Pure-CSS animation (no JS scheduler) so the motion stays smooth at
// 60fps regardless of scroll position.
//
// The animation works by rendering each row's testimonials TWICE (the
// duplicated set sits to the right of the original). The CSS animation
// translates the row by -50% of its width — at the end of that move, the
// duplicated set has reached exactly where the original started, so the
// loop is seamless and invisible to the eye.

import { Star } from 'lucide-react'

type Testimonial = {
  quote: string
  name: string
  org: string
  initial: string
}

// First three are Ali's existing testimonials (kept verbatim). The next
// five are TODO placeholders — same role/sector format, plausible voice
// for the consulting domain. Swap them with real client quotes when ready.
const TESTIMONIALS: Testimonial[] = [
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
  // TODO — replace with real client quotes when available
  {
    quote:
      "He doesn't just talk frameworks, he installs them. Six months later our exec meetings decide things instead of revisiting them.",
    name: 'Board Director',
    org: 'Government Holding Company',
    initial: 'B',
  },
  {
    quote:
      "Ali's diagnostic uncovered the political layer we'd been avoiding for years. The fact that he can name it without inflaming it is rare.",
    name: 'Director of Strategy',
    org: 'Public Health Authority',
    initial: 'D',
  },
  {
    quote:
      'We engaged Ali expecting a strategy refresh. We got an operating model that survived a leadership change. That is the difference.',
    name: 'Executive Director',
    org: 'Sovereign Investment Office',
    initial: 'E',
  },
  {
    quote:
      'The clarity he brings to ownership and decision rights is unusual. People stopped escalating and started executing.',
    name: 'Group COO',
    org: 'Industrial Conglomerate',
    initial: 'G',
  },
  {
    quote:
      "We've worked with the big consultancies. Ali fits in a room of operators in a way the big names don't.",
    name: 'Head of Transformation',
    org: 'Telecom Operator',
    initial: 'H',
  },
]

// Split into two rows. Even-indexed → row 1 (moves left), odd-indexed →
// row 2 (moves right). Gives each row 4 cards from 8 total.
const ROW_1 = TESTIMONIALS.filter((_, i) => i % 2 === 0)
const ROW_2 = TESTIMONIALS.filter((_, i) => i % 2 === 1)

export default function AliFlowTestimonials() {
  return (
    <section id="testimonials" className="ali-section ali-flow-tm">
      <div className="ali-container" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
          What Leaders Say
        </p>
        <h2 className="ali-h2">
          Voices from inside the <em>boardroom</em>
        </h2>
      </div>

      <div className="ali-flow-tm-rows">
        <div className="ali-flow-tm-track" aria-label="Testimonials, row 1">
          {/* Render TWICE for seamless loop */}
          <div className="ali-flow-tm-marquee ali-flow-tm-marquee--left">
            {[...ROW_1, ...ROW_1].map((t, i) => (
              <FlowCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>

        <div className="ali-flow-tm-track" aria-label="Testimonials, row 2">
          <div className="ali-flow-tm-marquee ali-flow-tm-marquee--right">
            {[...ROW_2, ...ROW_2].map((t, i) => (
              <FlowCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FlowCard({ t }: { t: Testimonial }) {
  return (
    <figure className="ali-flow-tm-card">
      <div className="ali-flow-tm-stars" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <blockquote className="ali-flow-tm-quote">{t.quote}</blockquote>
      <figcaption className="ali-flow-tm-attr">
        <div className="ali-flow-tm-avatar" aria-hidden="true">
          {t.initial}
        </div>
        <div>
          <div className="ali-flow-tm-name">{t.name}</div>
          <div className="ali-flow-tm-org">{t.org}</div>
        </div>
      </figcaption>
    </figure>
  )
}
