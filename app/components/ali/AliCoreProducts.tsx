'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type Book = {
  id: string
  mark: string
  title: string
  subtitle: string
  color1: string
  color2: string
  inside: {
    eyebrow: string
    heading: string
    desc: string
    bullets: string[]
    cta: string
    href: string
  }
}

const BOOKS: Book[] = [
  {
    id: 'advisory',
    mark: 'Vol. 01',
    title: 'Strategy\nAdvisory',
    subtitle: 'Authority · Expertise',
    color1: '#1f1f1f',
    color2: '#0a0a0a',
    inside: {
      eyebrow: 'Authority & Expertise',
      heading: 'Closing the gap from the boardroom out',
      desc: 'Two decades of strategy execution work for governments, public-sector, and enterprise leadership.',
      bullets: [
        'Executive advisory & coaching',
        'Strategy function design',
        'Governance & operating models',
      ],
      cta: 'Read about Ali',
      href: '#about',
    },
  },
  {
    id: 'materials',
    mark: 'Vol. 02',
    title: 'Digital\nMaterials',
    subtitle: 'Templates · Frameworks',
    color1: '#1f1f1f',
    color2: '#0a0a0a',
    inside: {
      eyebrow: 'Templates & Frameworks',
      heading: 'Tools your team will actually use',
      desc: 'Downloadable frameworks, templates, and AI prompts — built for real operating teams, not slideware.',
      bullets: [
        'Strategy frameworks & OGSM',
        'AI prompts & playbooks',
        'Templates for cascade & review',
      ],
      cta: 'Get the materials',
      href: '#course',
    },
  },
  {
    id: 'consultations',
    mark: 'Vol. 03',
    title: '1:1\nConsultations',
    subtitle: 'Booking · Direct',
    color1: '#1f1f1f',
    color2: '#0a0a0a',
    inside: {
      eyebrow: 'Booking & Direct',
      heading: 'Work with Ali, one-on-one',
      desc: 'Focused 45-minute or 90-minute sessions to diagnose, sharpen, or unblock your strategy execution.',
      bullets: [
        'Discovery call (free, 45 min)',
        'Deep-dive working session',
        'Course + 1:1 bundle available',
      ],
      cta: 'Book a session',
      href: '#book',
    },
  },
]

export default function AliCoreProducts() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const handleEnter = (id: string) => {
    if (!isTouch) setOpenId(id)
  }
  const handleLeave = () => {
    if (!isTouch) setOpenId(null)
  }
  const handleTap = (id: string) => {
    if (isTouch) setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <section id="products" className="ali-section ali-products">
      <div className="ali-container" style={{ textAlign: 'center' }}>
        <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
          Core Products
        </p>
        <h2 className="ali-h2" style={{ maxWidth: 720, margin: '0 auto 24px' }}>
          Three ways to <em>close the gap</em>
        </h2>
        <p className="ali-lede" style={{ margin: '0 auto 0' }}>
          {isTouch ? 'Tap a book' : 'Hover a book'} to see what's inside. Each one
          opens onto the next step you can take with Ali.
        </p>

        <div className="ali-products-shelf">
          {BOOKS.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <BookEl
                book={book}
                open={openId === book.id}
                onEnter={() => handleEnter(book.id)}
                onLeave={handleLeave}
                onTap={() => handleTap(book.id)}
                isTouch={isTouch}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BookEl({
  book,
  open,
  onEnter,
  onLeave,
  onTap,
  isTouch,
}: {
  book: Book
  open: boolean
  onEnter: () => void
  onLeave: () => void
  onTap: () => void
  isTouch: boolean
}) {
  return (
    <div
      className="ali-book"
      data-open={open}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onTap}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${book.title.replace('\n', ' ')} — ${isTouch ? 'tap' : 'hover'} to open`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTap()
        }
      }}
      style={{
        ['--book-color-1' as string]: book.color1,
        ['--book-color-2' as string]: book.color2,
      }}
    >
      <div className="ali-book-stage">
        {/* Cover (front face) */}
        <div className="ali-book-cover">
          <div>
            <div className="ali-book-mark">{book.mark}</div>
          </div>
          <div className="ali-book-title" style={{ whiteSpace: 'pre-line' }}>
            {book.title}
          </div>
          <div className="ali-book-foot">
            <span>{book.subtitle}</span>
            <span aria-hidden="true">↗</span>
          </div>
        </div>

        {/* Inside (back face — rotated 180) */}
        <div className="ali-book-inside">
          <div className="ali-book-inside-mark">{book.inside.eyebrow}</div>
          <div className="ali-book-inside-title">{book.inside.heading}</div>
          <p className="ali-book-inside-desc">{book.inside.desc}</p>
          <ul>
            {book.inside.bullets.map(b => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <a
            href={book.inside.href}
            className="ali-book-inside-cta"
            onClick={e => e.stopPropagation()}
          >
            {book.inside.cta}
          </a>
        </div>
      </div>

      <div className="ali-book-shadow" aria-hidden="true" />
    </div>
  )
}
