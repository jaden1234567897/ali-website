'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// Pinterest-style masonry: 3 columns on desktop → 2 on tablet → 1 on mobile.
// Each image keeps its natural aspect ratio so columns flow with varied
// heights, the way a real Pinterest board does.
const IMAGES = [
  '/1568825693603_LE_upscale_prime.jpg',
  '/1577510049318.jpg',
  '/1580212578575.jpg',
  '/1582113313095.jpg',
  '/1582113314409.jpg',
  '/aboutme%202.jpg',
  '/aboutme%203.jpg',
  '/aboutme%204.jpg',
  '/aboutme%205.jpg',
]

const COLUMN_COUNT = 3

function distribute(images: string[], cols: number) {
  const out: string[][] = Array.from({ length: cols }, () => [])
  images.forEach((src, i) => out[i % cols].push(src))
  return out
}

export default function AliCurvedAI() {
  const columns = distribute(IMAGES, COLUMN_COUNT)

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
          {columns.map((colImages, colIdx) => (
            <div key={colIdx} className="ali-gallery-col">
              {colImages.map((src, i) => (
                <GalleryImage
                  key={src}
                  src={src}
                  alt={`Gallery image ${colIdx * 100 + i + 1}`}
                />
              ))}
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
      `}</style>
    </section>
  )
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(20, 20, 30, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 8px 24px -12px rgba(20, 20, 40, 0.18)',
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 800ms ease',
        }}
      />
    </motion.div>
  )
}
