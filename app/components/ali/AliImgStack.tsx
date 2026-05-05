'use client'

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface AliImgStackProps {
  images: string[]
}

interface Card {
  id: number
  src: string
  rotation: number
}

// Fixed per-card rotations matching the Framer Gallery Stack feel.
// Each image keeps its own rotation as the stack cycles — only z-index changes.
const ROTATIONS = [0, -3, 3, -5, 5, -2, 4, -4]
const EXIT_DURATION = 0.55
const EXIT_EASE: [number, number, number, number] = [0.12, 0.23, 0.5, 1]
const AUTO_INTERVAL_MS = 3000

const AliImgStack = forwardRef<HTMLDivElement, AliImgStackProps>(function AliImgStack(
  { images },
  ref,
) {
  const [cards, setCards] = useState<Card[]>(() =>
    images.map((src, i) => ({
      id: i,
      src,
      rotation: ROTATIONS[i % ROTATIONS.length],
    })),
  )
  const [exitingId, setExitingId] = useState<number | null>(null)
  const [snapBackId, setSnapBackId] = useState<number | null>(null)
  const [cardWidth, setCardWidth] = useState(280)
  const cardsRef = useRef(cards)
  const isAnimatingRef = useRef(false)

  // Keep ref in sync so cycleNext (memoised, no deps) reads the latest stack.
  useEffect(() => {
    cardsRef.current = cards
  }, [cards])

  // Responsive card width — clamps to 200–300 px based on viewport.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const recompute = () => {
      const w = window.innerWidth
      const next = Math.max(200, Math.min(300, Math.round(w * 0.28)))
      setCardWidth(next)
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [])

  const cycleNext = useCallback(() => {
    if (isAnimatingRef.current) return
    if (cardsRef.current.length <= 1) return

    const topId = cardsRef.current[0].id
    isAnimatingRef.current = true
    setExitingId(topId)

    // After the slide-out finishes, shift the array so the exited card
    // is at the back. Use snapBack to teleport it (no animation) into
    // its new resting pose so we don't see it slide back across the screen.
    window.setTimeout(() => {
      setCards(prev => {
        const next = [...prev]
        const moved = next.shift()!
        next.push(moved)
        return next
      })
      setExitingId(null)
      setSnapBackId(topId)
      // Clear snapBack after 2 frames so subsequent renders use normal transitions.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSnapBackId(null)
          isAnimatingRef.current = false
        })
      })
    }, EXIT_DURATION * 1000)
  }, [])

  // Auto-cycle every 3 s on both desktop and mobile.
  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(cycleNext, AUTO_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [cycleNext, images.length])

  const cardHeight = cardWidth * (7 / 5)
  const stackHeight = cardHeight + 40

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: stackHeight,
        margin: '0 auto',
        // Allow the exit slide to escape the container without clipping.
        overflow: 'visible',
      }}
      role="group"
      aria-label="Gallery stack of Ali Al-Ali — cycles automatically every 3 seconds"
    >
      {cards.map((card, index) => {
        const isExiting = card.id === exitingId
        const isSnapBack = card.id === snapBackId
        const isTop = index === 0

        // All cards stay fully opaque always. Stack depth comes from
        // rotation alone — corners of behind cards peek out while the
        // top card fully covers the centre. No fractional-opacity state
        // exists, so no two images can ever blend through each other.
        const restingPose = {
          x: 0,
          y: 0,
          rotate: card.rotation,
          opacity: 1,
          scale: 1,
        }
        // Exit: slide right + fade. The fade is delayed (see transition
        // below) so it only starts after the card has moved past the
        // rising card's position — no fractional-opacity ghosting.
        const exitPose = {
          x: 900,
          y: 0,
          rotate: 0,
          opacity: 0,
          scale: 0.9,
        }

        return (
          <motion.div
            key={card.id}
            onClick={() => {
              if (isTop) cycleNext()
            }}
            style={{
              position: 'absolute',
              width: cardWidth,
              aspectRatio: '5 / 7',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow:
                '0 18px 48px -14px rgba(20,20,40,0.28), 0 4px 12px -6px rgba(20,20,40,0.18)',
              background: '#fff',
              cursor: isTop ? 'pointer' : 'default',
              border: '1px solid rgba(0,0,0,0.06)',
              willChange: 'transform, opacity',
              userSelect: 'none',
              zIndex: cards.length - index,
              // Force a dedicated GPU compositor layer so the image is
              // rasterized once at high resolution rather than re-sampled
              // every frame as transforms apply (the cause of the
              // blur-then-sharpen effect during cycle).
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              // Tell the browser to prioritise sharpness over smoothing
              // when the image is rotated/scaled.
              imageRendering: '-webkit-optimize-contrast',
            }}
            animate={isExiting ? exitPose : restingPose}
            transition={
              isSnapBack
                ? { duration: 0 }
                : isExiting
                  ? {
                      duration: EXIT_DURATION,
                      ease: EXIT_EASE,
                      // Hold full opacity for the first ~0.2 s while the card
                      // clears the centre, then fade over the remaining
                      // ~0.35 s. This puts the fade entirely AFTER the card
                      // has moved past the rising card's x-position, so the
                      // fractional-opacity moment never overlaps.
                      opacity: { duration: 0.35, delay: 0.2, ease: 'easeOut' },
                    }
                  : { duration: EXIT_DURATION, ease: EXIT_EASE }
            }
            whileHover={isTop && !isExiting ? { scale: 1.03 } : undefined}
            whileTap={isTop ? { scale: 0.98 } : undefined}
          >
            <Image
              src={card.src}
              alt={`Ali Al-Ali — portrait ${card.id + 1}`}
              fill
              // Bigger sizes hint forces srcset to pick a 2× retina variant
              // (≥ 640 px source for a 320 px element). Combined with
              // quality 95 this is near the practical max for JPEG.
              sizes="(max-width: 768px) 360px, 480px"
              quality={95}
              // priority on every stack card so all five preload at full
              // quality — no lazy-load placeholder appears when one cycles
              // to the top.
              priority
              style={{
                objectFit: 'cover',
                objectPosition: 'top center',
                pointerEvents: 'none',
                imageRendering: '-webkit-optimize-contrast',
              }}
              draggable={false}
            />
            {isTop && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderLeft: '3px solid var(--ali-gold)',
                  borderRadius: 18,
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
})

export default AliImgStack
