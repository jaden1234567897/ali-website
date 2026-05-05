'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

declare global {
  interface Window {
    __aliNovaProgress?: number
  }
}

export default function AliNovaTransition() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof window === 'undefined') return

    window.__aliNovaProgress = 0

    const ctx = gsap.context(() => {
      // Use scrub: true so window.__aliNovaProgress maps 1:1 to scroll position.
      // CoinField has its own exponential smoothing (follow = 1 - e^(-delta*7.5)),
      // so all Three.js motion stays fluid without GSAP adding extra lag on top.
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=1500',
        pin: true,
        scrub: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate(self) {
          window.__aliNovaProgress = self.progress
        },
        onLeave() {
          // Ensure progress is exactly 1 when pin releases
          window.__aliNovaProgress = 1
        },
        onLeaveBack() {
          window.__aliNovaProgress = 0
        },
      })
    }, section)

    return () => {
      ctx.revert()
      window.__aliNovaProgress = 0
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="nova"
      className="ali-nova-transition"
      aria-label="Strategy to Execution"
    />
  )
}
