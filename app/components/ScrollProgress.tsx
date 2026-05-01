'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 2, zIndex: 200, overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <div
        ref={barRef}
        style={{
          height: '100%', width: '100%',
          background: 'linear-gradient(to right, rgba(34,211,238,0.3), rgba(34,211,238,0.85), rgba(103,232,249,1))',
          transformOrigin: 'left center',
          transform: 'scaleX(0)',
        }}
      />
    </div>
  )
}
