'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
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

// Hover-intent dwell time — the cursor must rest on a book this long before
// it opens. Stops the cover from animating mid-scroll when the cursor just
// happens to pass over a book as the section enters the viewport.
const HOVER_INTENT_MS = 220

export default function AliCoreProducts() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [isTouch, setIsTouch] = useState(false)
  const dwellTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
    return () => {
      if (dwellTimerRef.current) window.clearTimeout(dwellTimerRef.current)
    }
  }, [])

  // Stable handler refs so memoised BookEls don't re-render on parent state
  // changes — only the book whose `open` prop actually flips will update.
  const handleEnter = useCallback(
    (id: string) => {
      if (isTouch) return
      if (dwellTimerRef.current) window.clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = window.setTimeout(() => {
        setOpenId(id)
      }, HOVER_INTENT_MS)
    },
    [isTouch],
  )
  const handleLeave = useCallback(() => {
    if (isTouch) return
    if (dwellTimerRef.current) {
      window.clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = undefined
    }
    setOpenId(null)
  }, [isTouch])
  const handleTap = useCallback(
    (id: string) => {
      if (isTouch) setOpenId(prev => (prev === id ? null : id))
    },
    [isTouch],
  )

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
                onEnter={handleEnter}
                onLeave={handleLeave}
                onTap={handleTap}
                isTouch={isTouch}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Memoised so a hover on book A doesn't re-render books B and C — only
// the book whose `open` prop actually changes will repaint.
const BookEl = memo(function BookEl({
  book,
  open,
  onEnter,
  onLeave,
  onTap,
  isTouch,
}: {
  book: Book
  open: boolean
  onEnter: (id: string) => void
  onLeave: () => void
  onTap: (id: string) => void
  isTouch: boolean
}) {
  const handleEnter = useCallback(() => onEnter(book.id), [onEnter, book.id])
  const handleTap = useCallback(() => onTap(book.id), [onTap, book.id])

  return (
    <div
      className="ali-book"
      data-open={open}
      onMouseEnter={handleEnter}
      onMouseLeave={onLeave}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${book.title.replace('\n', ' ')} — ${isTouch ? 'tap' : 'hover'} to open`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleTap()
        }
      }}
      style={{
        ['--book-color-1' as string]: book.color1,
        ['--book-color-2' as string]: book.color2,
      }}
    >
      <div className="ali-book-stage">
        {/* Cover (3D pivot — front + back face). When the book opens, the
            cover swings on its left hinge and the cream "endpaper" back
            face becomes visible, like a real hardcover book. */}
        <div className="ali-book-cover">
          <div className="ali-book-cover-front">
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
          <div className="ali-book-cover-back" aria-hidden="true" />
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
})
