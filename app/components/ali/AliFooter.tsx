'use client'

import { MessageCircle, Mail } from 'lucide-react'

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

const NAV = {
  Work: [
    { label: 'About Ali', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Process', href: '#process' },
    { label: 'Testimonials', href: '#testimonials' },
  ],
  Products: [
    { label: 'Advisory', href: '#products' },
    { label: 'Materials', href: '#products' },
    { label: '1:1 Consultations', href: '#book' },
    { label: 'Course (soon)', href: '#course' },
  ],
  Resources: [
    { label: 'AI in Strategy', href: '#ai' },
    { label: 'Bridging the Gap', href: '#bridge' },
    { label: 'Book a Call', href: '#book' },
  ],
}

export default function AliFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="ali-footer">
      <div className="ali-footer-grid">
        <div className="ali-footer-brand">
          <strong>Ali Al-Ali</strong>
          <small>Strategy · Execution</small>
          <p>
            Bridging the strategy-to-execution gap for governments, public-sector
            organisations, and enterprise leadership — sharper, faster, with AI.
          </p>
        </div>

        <div className="ali-footer-cols">
          {Object.entries(NAV).map(([title, links]) => (
            <div className="ali-footer-col" key={title}>
              <h6>{title}</h6>
              <ul>
                {links.map(l => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="ali-footer-col">
          <h6>Connect</h6>
          <div className="ali-footer-social">
            <a
              href="https://www.linkedin.com/in/alialali1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedinIcon size={16} />
              LinkedIn
            </a>
            <a href="https://wa.me/message" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} />
              WhatsApp
            </a>
            <a href="mailto:hello@alialali.com">
              <Mail size={16} />
              Email
            </a>
          </div>
        </div>
      </div>

      <div className="ali-footer-bottom">
        <span>© {year} Ali Al-Ali. All rights reserved.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}
