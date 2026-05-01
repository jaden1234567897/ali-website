import { CalendarClock } from 'lucide-react'
import BridgeGapSection from './components/BridgeGapSection'
import CoinField from './components/CoinField'

export const frameCache: (ImageBitmap | null)[] = Array.from({ length: 193 }, () => null)

export default function Home() {
  return (
    <div className="site-shell">
      <CoinField />

      <header className="site-nav nova-nav">
        <a className="brand" href="#top" aria-label="Ali Al-Ali home">
          <strong>Ali Al-Ali</strong>
          <span>Strategy Execution</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#course">Course</a>
          <a href="#advisory">Advisory</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

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
              <a className="primary-action nova-start" href="#contact">
                <CalendarClock size={16} />
                Let&apos;s Start
              </a>
            </aside>
          </section>
        </div>

        <BridgeGapSection />
      </main>
    </div>
  )
}
