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
import AliServices from './components/ali/AliServices'
import AliProcess from './components/ali/AliProcess'
// Branch-2 swap: AliTestimonials → AliFlowTestimonials (infinite marquee
// in two rows moving in opposite directions, replacing the static 3-card grid)
import AliFlowTestimonials from './components/ali/AliFlowTestimonials'
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

        {/* Bridge — pinned scroll: text reveal + 3 coins forming a bridge with AI as keystone */}
        <AliBridge />

        {/* Curved AI screenshot slider */}
        <AliCurvedAI />

        <AliServices />
        <AliProcess />
        <AliFlowTestimonials />

        {/* Branch-2: Four engagement options (Advisory / Materials / 1:1 / Course)
            placed right before the booking CTA — credibility above, decisive
            offers + call-to-action below. */}
        <AliTierCards />

        <AliBooking />
      </main>

      {/* Cinematic curtain-reveal footer with magnetic pills */}
      <AliCinematicFooter />
      <AliWhatsAppFloat />
    </div>
  )
}
