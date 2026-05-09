'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// Pinterest-style masonry: 3 columns on desktop → 2 on tablet → 1 on mobile.
// Each image's aspect ratio is hard-coded from its real natural dimensions
// so the grid reserves the correct space *before* the file decodes — no
// blank-grey placeholders, no layout shift while images stream in.
type Photo = {
  src: string
  width: number
  height: number
  alt: string
}

// Switched from JPEG to WebP — same visual quality, smaller payload
// (~30% smaller in this set). All nine load eagerly because the total
// is now small enough (≈1.4 MB) that there's no benefit in deferring
// any of them, and eager-load eliminates the empty-cell flash when
// the section enters the viewport.
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
                    // Top row of each column gets fetchPriority="high";
                    // the rest still eager-load (small total payload),
                    // they're just lower priority on the network queue.
                    priority={i === 0}
                    delay={flatIndex * 0.04}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

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
}: {
  photo: Photo
  priority: boolean
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%',
        aspectRatio: `${photo.width} / ${photo.height}`,
        borderRadius: 12,
        overflow: 'hidden',
        // Animated linear-gradient skeleton so the cell reads as
        // "loading" rather than "empty white box" while the file
        // streams in over the network.
        background:
          'linear-gradient(120deg, rgba(20,20,30,0.05) 0%, rgba(20,20,30,0.10) 50%, rgba(20,20,30,0.05) 100%)',
        backgroundSize: '200% 100%',
        animation: loaded ? 'none' : 'ali-gallery-shimmer 1.6s ease-in-out infinite',
        boxShadow: '0 8px 24px -12px rgba(20, 20, 40, 0.18)',
      }}
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
    </motion.div>
  )
}
