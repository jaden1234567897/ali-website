'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Pinterest-style masonry with a full-screen lightbox. Each image opens on
// click; in the lightbox you can navigate with ← / → arrows, click the
// backdrop to dismiss, or press Escape.
type Photo = {
  src: string
  width: number
  height: number
  alt: string
}

const PHOTOS: Photo[] = [
  { src: '/1568825693603_LE_upscale_prime.webp', width: 1634, height: 1224, alt: 'Conference floor' },
  { src: '/1577510049318.webp', width: 1280, height: 960, alt: 'Workshop session' },
  { src: '/1580212578575.webp', width: 960, height: 1280, alt: 'Speaking on stage' },
  { src: '/1582113313095.webp', width: 800, height: 450, alt: 'Strategy briefing' },
  { src: '/1582113314409.webp', width: 1280, height: 960, alt: 'Boardroom discussion' },
  { src: '/aboutme%202.webp', width: 960, height: 1280, alt: 'Field portrait' },
  { src: '/aboutme%203.webp', width: 1536, height: 1152, alt: 'On the floor' },
  { src: '/aboutme%204.webp', width: 1536, height: 1152, alt: 'In the room' },
  { src: '/aboutme%205.webp', width: 1536, height: 1152, alt: 'In the field' },
]

const COLUMN_COUNT = 3

function distribute(photos: Photo[], cols: number) {
  const out: Photo[][] = Array.from({ length: cols }, () => [])
  photos.forEach((p, i) => out[i % cols].push(p))
  return out
}

export default function AliCurvedAI() {
  const columns = distribute(PHOTOS, COLUMN_COUNT)
  // Index into the flat PHOTOS array — null means lightbox is closed
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const open = useCallback((src: string) => {
    const idx = PHOTOS.findIndex(p => p.src === src)
    if (idx >= 0) setActiveIdx(idx)
  }, [])

  const close = useCallback(() => setActiveIdx(null), [])

  const goNext = useCallback(() => {
    setActiveIdx(i => (i === null ? null : (i + 1) % PHOTOS.length))
  }, [])

  const goPrev = useCallback(() => {
    setActiveIdx(i => (i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length))
  }, [])

  // Keyboard navigation + body-scroll lock while lightbox is open
  useEffect(() => {
    if (activeIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [activeIdx, close, goNext, goPrev])

  return (
    <section
      id="ai"
      style={{
        position: 'relative',
        width: '100%',
        background: 'var(--ali-cream)',
        padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 96px)',
      }}
      aria-label="Ali Al-Ali — Gallery"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          className="ali-eyebrow"
          style={{
            justifyContent: 'center',
            display: 'inline-flex',
            marginBottom: 16,
          }}
        >
          Gallery
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.4vw, 46px)',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--ali-ink)',
            margin: '0 auto 56px',
            maxWidth: 720,
          }}
        >
          From the work, the room, the field.
        </h2>

        <div className="ali-gallery-grid">
          {columns.map((colPhotos, colIdx) => (
            <div key={colIdx} className="ali-gallery-col">
              {colPhotos.map((photo, i) => {
                const flatIndex = colIdx + i * COLUMN_COUNT
                return (
                  <GalleryImage
                    key={photo.src}
                    photo={photo}
                    priority={i === 0}
                    delay={flatIndex * 0.04}
                    onOpen={() => open(photo.src)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeIdx !== null && (
          <Lightbox
            photo={PHOTOS[activeIdx]}
            onClose={close}
            onPrev={goPrev}
            onNext={goNext}
            count={PHOTOS.length}
            index={activeIdx}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        .ali-gallery-grid {
          display: grid;
          grid-template-columns: repeat(${COLUMN_COUNT}, 1fr);
          gap: 18px;
        }
        .ali-gallery-col {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        @media (max-width: 880px) {
          .ali-gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .ali-gallery-col {
            gap: 14px;
          }
        }
        @media (max-width: 560px) {
          .ali-gallery-grid {
            grid-template-columns: 1fr;
          }
        }
        @keyframes ali-gallery-shimmer {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
      `}</style>
    </section>
  )
}

function GalleryImage({
  photo,
  priority,
  delay,
  onOpen,
}: {
  photo: Photo
  priority: boolean
  delay: number
  onOpen: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015 }}
      style={{
        width: '100%',
        aspectRatio: `${photo.width} / ${photo.height}`,
        borderRadius: 12,
        overflow: 'hidden',
        background:
          'linear-gradient(120deg, rgba(20,20,30,0.05) 0%, rgba(20,20,30,0.10) 50%, rgba(20,20,30,0.05) 100%)',
        backgroundSize: '200% 100%',
        animation: loaded ? 'none' : 'ali-gallery-shimmer 1.6s ease-in-out infinite',
        boxShadow: '0 8px 24px -12px rgba(20, 20, 40, 0.18)',
        cursor: 'zoom-in',
        border: 'none',
        padding: 0,
        display: 'block',
      }}
      aria-label={`Open ${photo.alt}`}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="eager"
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 500ms ease',
        }}
      />
    </motion.button>
  )
}

function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  count,
  index,
}: {
  photo: Photo
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  count: number
  index: number
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Gallery viewer — ${photo.alt}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(20px, 5vw, 80px)',
      }}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          background: 'rgba(255, 255, 255, 0.06)',
          color: 'rgba(255, 255, 255, 0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'background 200ms ease, border-color 200ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'
          e.currentTarget.style.borderColor = 'rgba(196, 151, 58, 0.45)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)'
        }}
      >
        <X size={20} strokeWidth={2.2} />
      </button>

      {/* Previous */}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation()
          onPrev()
        }}
        aria-label="Previous image"
        style={navButtonStyle('left')}
      >
        <ChevronLeft size={24} strokeWidth={2.2} />
      </button>

      {/* Image */}
      <motion.img
        key={photo.src}
        src={photo.src}
        alt={photo.alt}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '92vw',
          maxHeight: '85vh',
          width: 'auto',
          height: 'auto',
          borderRadius: 8,
          boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.5)',
          objectFit: 'contain',
        }}
      />

      {/* Next */}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation()
          onNext()
        }}
        aria-label="Next image"
        style={navButtonStyle('right')}
      >
        <ChevronRight size={24} strokeWidth={2.2} />
      </button>

      {/* Position indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)',
          fontSize: 12,
          letterSpacing: '0.22em',
          color: 'rgba(255, 255, 255, 0.55)',
          pointerEvents: 'none',
        }}
      >
        {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </div>
    </motion.div>
  )
}

function navButtonStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    [side]: 'clamp(12px, 3vw, 36px)',
    transform: 'translateY(-50%)',
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'background 200ms ease, border-color 200ms ease',
  }
}
