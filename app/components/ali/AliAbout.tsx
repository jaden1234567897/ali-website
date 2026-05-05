'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AliImgStack from './AliImgStack'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

type Stat =
  | { kind: 'count'; value: number; suffix: string; label: string }
  | { kind: 'text'; display: string; label: string }

const STATS: Stat[] = [
  { kind: 'count', value: 20, suffix: '+', label: 'Years Experience' },
  { kind: 'text', display: 'GCC', label: 'Regional Focus' },
  { kind: 'count', value: 100, suffix: '+', label: 'Leaders Coached' },
]

const PILLS = ['Strategy', 'Governance', 'Execution']

const styles = {
  section: {
    position: 'relative',
    width: '100%',
    background: 'var(--ali-cream)',
    padding: '24px clamp(20px, 5vw, 96px) clamp(80px, 10vw, 140px)',
    overflow: 'hidden',
  } as const,
  stage: {
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
  } as const,
  head: {
    textAlign: 'center',
    maxWidth: 680,
    margin: '0 auto 56px',
  } as const,
  eyebrow: {
    justifyContent: 'center',
    display: 'inline-flex',
    marginBottom: 16,
  } as const,
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(26px, 3vw, 40px)',
    fontWeight: 600,
    lineHeight: 1.18,
    letterSpacing: '-0.015em',
    color: 'var(--ali-ink)',
    margin: 0,
  } as const,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 0.85fr) 1.15fr',
    gap: 'clamp(36px, 5vw, 72px)',
    alignItems: 'start',
    perspective: '1200px',
  } as const,
  photo: {
    position: 'relative',
    isolation: 'isolate',
    width: '100%',
    maxWidth: 440,
    aspectRatio: '4 / 5',
    borderRadius: 'var(--ali-radius-lg)',
    overflow: 'hidden',
    background: 'var(--ali-cream)',
    boxShadow: 'var(--ali-shadow-md)',
    willChange: 'transform, opacity',
  } as const,
  photoGoldEdge: {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderLeft: '4px solid var(--ali-gold)',
    borderRadius: 'var(--ali-radius-lg)',
    pointerEvents: 'none',
    zIndex: 3,
  } as const,
  sweep: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    background:
      'linear-gradient(105deg, transparent 30%, rgba(212,178,87,0) 38%, rgba(212,178,87,0.55) 50%, rgba(212,178,87,0) 62%, transparent 70%)',
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  } as const,
  content: {
    minWidth: 0,
  } as const,
  pills: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  } as const,
  pill: {
    display: 'inline-block',
    padding: '6px 14px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--ali-gold)',
    border: '1px solid var(--ali-gold)',
    borderRadius: 999,
    background: 'transparent',
    whiteSpace: 'nowrap',
    willChange: 'transform, opacity',
  } as const,
  name: {
    position: 'relative',
    display: 'inline-block',
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(28px, 3.2vw, 42px)',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: 'var(--ali-ink)',
    margin: '0 0 24px',
    paddingBottom: 6,
    lineHeight: 1.1,
  } as const,
  nameInner: {
    display: 'inline-block',
    perspective: '800px',
  } as const,
  nameWord: {
    display: 'inline-block',
    transformOrigin: '50% 100%',
    backfaceVisibility: 'hidden',
    willChange: 'transform, opacity',
  } as const,
  nameUnderline: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: 3,
    background: 'var(--ali-gold)',
    transformOrigin: '0% 50%',
    willChange: 'transform',
  } as const,
  bio: {
    fontSize: 'clamp(15px, 1.15vw, 16.5px)',
    lineHeight: 1.7,
    color: 'var(--ali-ink-2)',
    margin: '0 0 18px',
  } as const,
  bioMuted: { color: 'var(--ali-muted)' } as const,
  bioInner: {
    display: 'inline-block',
    willChange: 'transform, opacity',
  } as const,
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    padding: '28px 0',
    margin: '28px 0',
    borderTop: '1px solid var(--ali-line)',
    borderBottom: '1px solid var(--ali-line)',
  } as const,
  statValue: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(26px, 2.6vw, 34px)',
    fontWeight: 600,
    color: 'var(--ali-gold)',
    lineHeight: 1,
  } as const,
  statLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--ali-muted)',
    marginTop: 8,
  } as const,
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  } as const,
}

export default function AliAbout() {
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const photoFrameRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<(HTMLSpanElement | null)[]>([])
  const nameWordsRef = useRef<(HTMLSpanElement | null)[]>([])
  const underlineRef = useRef<HTMLSpanElement>(null)
  const bioLinesRef = useRef<(HTMLSpanElement | null)[]>([])
  const statBlocksRef = useRef<(HTMLDivElement | null)[]>([])
  const statValuesRef = useRef<(HTMLDivElement | null)[]>([])
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      gsap.set(eyebrowRef.current, { opacity: 0, y: 24 })
      gsap.set(titleRef.current, { opacity: 0, y: 32 })
      gsap.set(photoFrameRef.current, { opacity: 0, y: 60, scale: 0.94 })
      gsap.set(pillsRef.current, { opacity: 0, y: 12 })
      gsap.set(nameWordsRef.current, { opacity: 0, y: 30, rotationX: -45 })
      gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: '0% 50%' })
      gsap.set(bioLinesRef.current, { opacity: 0, y: 22 })
      gsap.set(statBlocksRef.current, { opacity: 0, y: 18 })
      gsap.set(actionsRef.current, { opacity: 0, y: 20 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 100%',
          toggleActions: 'play none none reverse',
        },
        defaults: { ease: 'power3.out' },
      })

      tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5 })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.35')
        .to(photoFrameRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.9 }, '-=0.45')
        .to(
          pillsRef.current,
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: 'back.out(2)' },
          '-=0.55',
        )
        .to(
          nameWordsRef.current,
          { opacity: 1, y: 0, rotationX: 0, stagger: 0.1, duration: 0.6 },
          '-=0.3',
        )
        .to(underlineRef.current, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, '-=0.35')
        .to(bioLinesRef.current, { opacity: 1, y: 0, stagger: 0.15, duration: 0.5 }, '-=0.3')
        .to(statBlocksRef.current, { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }, '-=0.25')

      STATS.forEach((stat, i) => {
        if (stat.kind !== 'count') return
        const el = statValuesRef.current[i]
        if (!el) return
        const counter = { val: 0 }
        tl.to(
          counter,
          {
            val: stat.value,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate() {
              el.textContent = `${Math.round(counter.val)}${stat.suffix}`
            },
          },
          '<',
        )
      })

      tl.to(actionsRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" style={styles.section}>
      <div style={styles.stage}>
        <div style={styles.head}>
          <p ref={eyebrowRef} className="ali-eyebrow" style={styles.eyebrow}>
            About Ali
          </p>
          <h2 ref={titleRef} style={styles.title}>
            Ambition becomes <em style={{ fontStyle: 'italic', color: 'var(--ali-gold)', fontWeight: 500 }}>executable</em> in the real world.
          </h2>
        </div>

        <div className="ali-about-section-grid" style={styles.grid}>
          <div
            ref={photoFrameRef}
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              willChange: 'transform, opacity',
              perspective: 1000,
            }}
          >
            <AliImgStack
              images={[
                '/ali-photo.jpg',
                '/aboutme%202.jpg',
                '/aboutme%203.jpg',
                '/aboutme%204.jpg',
                '/aboutme%205.jpg',
              ]}
            />
          </div>

          <div style={styles.content}>
            <div style={styles.pills}>
              {PILLS.map((p, i) => (
                <span
                  key={p}
                  ref={el => {
                    pillsRef.current[i] = el
                  }}
                  style={styles.pill}
                >
                  {p}
                </span>
              ))}
            </div>

            <h3 style={styles.name}>
              <span style={styles.nameInner}>
                <span
                  ref={el => {
                    nameWordsRef.current[0] = el
                  }}
                  style={styles.nameWord}
                >
                  Ali
                </span>{' '}
                <span
                  ref={el => {
                    nameWordsRef.current[1] = el
                  }}
                  style={styles.nameWord}
                >
                  Al-Ali
                </span>
              </span>
              <span ref={underlineRef} style={styles.nameUnderline} aria-hidden="true" />
            </h3>

            <p style={styles.bio}>
              <span
                ref={el => {
                  bioLinesRef.current[0] = el
                }}
                style={styles.bioInner}
              >
                For over two decades, I&apos;ve worked in environments where strategy failure is not abstract — it&apos;s visible, political, and costly. Most of my career has been inside government entities, public-sector organisations, and enterprise-scale environments.
              </span>
            </p>

            <p style={{ ...styles.bio, ...styles.bioMuted }}>
              <span
                ref={el => {
                  bioLinesRef.current[1] = el
                }}
                style={styles.bioInner}
              >
                I operate at the intersection of strategy, governance, and execution: designing execution governance, clarifying ownership and decision forums, aligning strategy with planning and budgeting, and building operating models that work under pressure — not just on paper.
              </span>
            </p>

            <div style={styles.stats}>
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  ref={el => {
                    statBlocksRef.current[i] = el
                  }}
                >
                  <div
                    ref={el => {
                      statValuesRef.current[i] = el
                    }}
                    style={styles.statValue}
                  >
                    {s.kind === 'text' ? s.display : `0${s.suffix}`}
                  </div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div ref={actionsRef} style={styles.actions}>
              <a href="#book" className="ali-btn ali-btn--primary">
                Work with Ali
              </a>
              <a
                href="https://www.linkedin.com/in/alialali1"
                target="_blank"
                rel="noopener noreferrer"
                className="ali-btn ali-btn--ghost"
              >
                <LinkedinIcon size={16} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 880px) {
            .ali-about-section-grid {
              grid-template-columns: 1fr !important;
              gap: 36px !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
