import { CalendarClock } from 'lucide-react'
import CoinField from './components/CoinField'
import AliNav from './components/ali/AliNav'
import AliNovaTransition from './components/ali/AliNovaTransition'
import AliAbout from './components/ali/AliAbout'
// Branch-2 swap: AliCoreProducts + AliCourseTeaser → single AliTierCards
// section (pricing-table style, 4 columns: Advisory / Materials / 1:1 / Course).
// Positioned right before AliBooking so the four engagement options sit
// next to the "book a call" CTA as the closing conversion block.
import AliTierCards from './components/ali/AliTierCards'
import AliBridge from './components/ali/AliBridge'
import AliCurvedAI from './components/ali/AliCurvedAI'
// ali-v3: AliServices removed — the four engagements live only in the
// Tier Cards section now, so this "Four ways we work together" panel
// was duplicating the same idea visually.
// ali-v3: AliProcess ("From diagnosis to delivery") removed too — the
// page narrative goes straight from gallery → testimonials → tier cards.
// Branch-2 swap: AliTestimonials → AliFlowTestimonials (infinite marquee
// in two rows moving in opposite directions, replacing the static 3-card grid)
import AliFlowTestimonials from './components/ali/AliFlowTestimonials'
// ali-v3: course section re-added (3D interactive book swapped for a
// static dark tier-card-style visual on the right).
import AliCourseTeaser from './components/ali/AliCourseTeaser'
import AliBooking from './components/ali/AliBooking'
import AliCinematicFooter from './components/ali/AliCinematicFooter'
import AliWhatsAppFloat from './components/ali/AliWhatsAppFloat'

export const frameCache: (ImageBitmap | null)[] = Array.from({ length: 193 }, () => null)

export default function Home() {
  return (
    <div className="ali-site site-shell">
      {/* Hero — 3D coin field + butterfly motion (untouched) */}
      <CoinField />

      <AliNav />

      <main id="top">
        <div className="hero-scroll-stage">
          <section className="hero-section nova-hero" aria-label="Ali Al-Ali hero">
            <div className="hero-copy nova-hero-title">
              <h1>
                Where <em>Strategy</em>
                <br />
                Meets Execution.
              </h1>
            </div>

            <aside className="nova-hero-aside">
              <p>
                We align strategy,
                <br />
                governance, and
                <br />
                execution that delivers.
              </p>
              <a className="primary-action nova-start" href="#book">
                <CalendarClock size={16} />
                Let&apos;s Start
              </a>
            </aside>
          </section>
        </div>

        {/* Coin detach: 3 coins separate → Strategy fills screen → fades to cream */}
        <AliNovaTransition />

        {/* About Ali — cinematic pinned reveal (replaces the Bridging the Gap timeline) */}
        <AliAbout />

        {/* Bridge — pinned scroll: text reveal + 3 coins forming a bridge with AI as keystone.
            ali-v3 keeps this animation but uses Strategy / Execution / Artificial Intelligence
            instead of Strategy / Governance / Execution. */}
        <AliBridge />

        {/* Curved AI screenshot slider */}
        <AliCurvedAI />

        <AliFlowTestimonials />

        {/* ali-v3: Three engagement options (Advisory / Materials / 1:1).
            The Course used to live as a fourth column here — it's now its
            own AliCourseTeaser section right below this grid. */}
        <AliTierCards />

        {/* ali-v3: Course teaser with the dark "VOL. 04" tier card as the
            right-side visual (was a 3D interactive book before). */}
        <AliCourseTeaser />

        <AliBooking />
      </main>

      {/* Cinematic curtain-reveal footer with magnetic pills */}
      <AliCinematicFooter />
      <AliWhatsAppFloat />
    </div>
  )
}
