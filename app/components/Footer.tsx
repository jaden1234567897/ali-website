'use client'

const YEAR = new Date().getFullYear()

const LINKS = {
  Navigate: [
    { label: 'About',        href: '#about' },
    { label: 'Services',     href: '#services' },
    { label: 'AI Strategy',  href: '#ai' },
    { label: 'Course',       href: '#course' },
    { label: 'Contact',      href: '#contact' },
  ],
  Services: [
    { label: '1:1 Advisory',    href: '#services' },
    { label: 'Team Workshops',  href: '#services' },
    { label: 'Online Course',   href: '#course' },
    { label: 'Bundle Package',  href: '#services' },
    { label: 'Lead Magnet',     href: '#download' },
  ],
}

export default function Footer() {
  return (
    <footer id="contact" style={{ background: '#000610', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ padding: 'clamp(56px,7vw,88px) var(--section-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(32px,4vw,56px)', marginBottom: 'clamp(40px,5vw,64px)' }}>

          {/* Brand */}
          <div style={{ gridColumn: '1 / -1', maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', marginBottom: 6 }}>Ali Al-Ali</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>Strategy · Execution</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.7, maxWidth: 280 }}>
              Executive advisor helping leaders close the gap between strategy and results.
            </p>
            <a
              href="https://www.linkedin.com/in/alialali1"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 20, fontSize: 12, color: 'var(--accent)', textDecoration: 'none', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              LinkedIn →
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 18, fontWeight: 400 }}>{group}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(l => (
                  <a key={l.label} href={l.href}
                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 18 }}>Contact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="mailto:hello@alialali.com"
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                hello@alialali.com
              </a>
              <a href="https://wa.me/message" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#25D366')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                WhatsApp
              </a>
              <a href="#book"
                style={{ marginTop: 8, display: 'inline-block', background: '#fff', color: '#000', fontWeight: 600, fontSize: 12, padding: '9px 20px', borderRadius: 999, textDecoration: 'none', width: 'fit-content' }}>
                Book a Call
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300 }}>
            © {YEAR} Ali Al-Ali. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Use'].map(l => (
              <a key={l} href="#"
                style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
