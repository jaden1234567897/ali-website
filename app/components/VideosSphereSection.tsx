'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const cards = [
  { src: '/alii.webp', alt: 'Ali Al-Ali portrait', position: 'center 28%' },
  { src: '/frames/00001.webp', alt: '', position: 'center' },
  { src: '/alii.webp', alt: 'Ali Al-Ali portrait', position: 'center 32%' },
  { src: '/frames/00004.webp', alt: '', position: 'center' },
  { src: '/alii.webp', alt: 'Ali Al-Ali portrait', position: 'center 30%' },
  { src: '/frames/00007.webp', alt: '', position: 'center' },
]

export default function VideosSphereSection() {
  const [rotation, setRotation] = useState(0)
  const step = 360 / cards.length

  useEffect(() => {
    const id = window.setInterval(() => {
      setRotation(current => current - step)
    }, 2800)

    return () => window.clearInterval(id)
  }, [step])

  const carouselCards = useMemo(
    () =>
      cards.map((card, index) => ({
        ...card,
        index,
        style: {
          '--item-angle': `${index * step}deg`,
          '--item-index': index,
        } as React.CSSProperties,
      })),
    [step],
  )

  const previous = () => setRotation(current => current + step)
  const next = () => setRotation(current => current - step)
  const reset = () => setRotation(0)

  return (
    <section id="media" className="videos-sphere-section" aria-label="Ali Al-Ali horizon 3D carousel">
      <button className="videos-sphere-reset" type="button" onClick={reset} aria-label="Reset carousel">
        <RotateCcw size={18} />
      </button>

      <button className="videos-sphere-arrow videos-sphere-arrow-left" type="button" onClick={previous} aria-label="Previous image">
        <ChevronLeft size={22} />
      </button>

      <div className="videos-sphere-stage" aria-live="off">
        <div
          className="videos-sphere-ring"
          style={{ '--ring-rotation': `${rotation}deg` } as React.CSSProperties}
        >
          {carouselCards.map(card => (
            <figure className="videos-sphere-card" key={`${card.src}-${card.index}`} style={card.style}>
              <Image
                src={card.src}
                alt={card.alt}
                fill
                sizes="(max-width: 760px) 54vw, 260px"
                priority={card.index < 2}
                style={{ objectPosition: card.position }}
              />
            </figure>
          ))}
        </div>
      </div>

      <button className="videos-sphere-arrow videos-sphere-arrow-right" type="button" onClick={next} aria-label="Next image">
        <ChevronRight size={22} />
      </button>
    </section>
  )
}
