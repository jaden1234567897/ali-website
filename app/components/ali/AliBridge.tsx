'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

declare global {
  interface Window {
    __aliBridgeProgress?: number
  }
}

const SECTION_PIN_DISTANCE = 5000

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// ─── Coin pose tables (index 0=Strategy, 1=AI, 2=Execution) ────────

// Strategy in your face from the previous section's POV ending,
// AI/Execution off-screen sides waiting to fly in.
const initialPoses = [
  { x: 0, y: 0, z: 4.0, s: 8, rx: 0, ry: 0, rz: 0 },
  { x: -3.5, y: 0.4, z: -0.34, s: 1.5, rx: Math.PI / 2, ry: 0, rz: 0 },
  { x: 3.5, y: -0.4, z: -0.4, s: 1.5, rx: Math.PI / 2, ry: 0, rz: 0 },
]

// NOVA-style edge-on asterisk — coins stacked at centre, rotated ±60° on z.
const starPoses = [
  { x: 0, y: 0.05, z: -0.40, s: 1.5, rx: Math.PI / 2, ry: 0.04, rz: Math.PI / 3 },
  { x: 0, y: 0.00, z: -0.34, s: 1.5, rx: Math.PI / 2, ry: 0, rz: 0 },
  { x: 0, y: -0.05, z: -0.40, s: 1.5, rx: Math.PI / 2, ry: -0.04, rz: -Math.PI / 3 },
]

// Triangle initial — Strategy top, Execution bottom-LEFT, AI/Gov bottom-RIGHT.
// Y values shifted +0.4 so the visual centre of the triangle (which is
// pulled downward by the two bottom coins outweighing the single top one)
// sits at the geometric middle of the viewport.
const trianglePoses = [
  { x: 0, y: 1.45, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 },      // Strategy → top
  { x: 1.55, y: -0.35, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 },  // Governance → bottom-right
  { x: -1.55, y: -0.35, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 }, // Execution → bottom-left
]

// Triangle rotated — each coin moves CCW by one vertex.
const triangleRotatedPoses = [
  { x: -1.55, y: -0.35, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 }, // Strategy → bottom-left
  { x: 0, y: 1.45, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 },      // Governance → top
  { x: 1.55, y: -0.35, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 },  // Execution → bottom-right
]

// Strategy zoom — Strategy moves to RIGHT side, larger and forward.
// AI/Execution move off-screen so the focus is Strategy alone.
const strategyZoomPoses = [
  { x: 1.45, y: 0, z: 1.0, s: 1.65, rx: 0, ry: 0, rz: 0 },  // Strategy → right + zoom
  { x: 0, y: 4.5, z: -2, s: 0.6, rx: 0, ry: 0, rz: 0 },     // Governance hidden above
  { x: 0, y: -4.5, z: -2, s: 0.6, rx: 0, ry: 0, rz: 0 },    // Execution hidden below
]

// Final duo — Strategy hidden, Governance top-right + Execution bottom-right.
// Both text columns appear on the LEFT side (this is the fix the user wanted).
const finalDuoPoses = [
  { x: 0, y: 4.5, z: -2, s: 0.6, rx: 0, ry: 0, rz: 0 },     // Strategy hidden above
  { x: 1.5, y: 0.65, z: 0.3, s: 1.05, rx: 0, ry: 0, rz: 0 },// Governance → top-right
  { x: 1.5, y: -0.65, z: 0.3, s: 1.05, rx: 0, ry: 0, rz: 0 },// Execution → bottom-right
]

// ali-v3: replaces the duo with two SOLO phases. AI enters from above
// and lands at the same right-side zoom position Strategy used; then AI
// exits up and Execution enters from below to land at the same spot.
// One coin visible at a time, same size as Strategy's zoom.
const aiSoloPoses = [
  { x: 0, y: 4.5, z: -2, s: 0.6, rx: 0, ry: 0, rz: 0 },     // Strategy hidden above
  { x: 1.45, y: 0, z: 1.0, s: 1.65, rx: 0, ry: 0, rz: 0 }, // AI at Strategy zoom pos
  { x: 0, y: -4.5, z: -2, s: 0.6, rx: 0, ry: 0, rz: 0 },   // Execution hidden below
]
const executionSoloPoses = [
  { x: 0, y: 4.5, z: -2, s: 0.6, rx: 0, ry: 0, rz: 0 },    // Strategy still hidden above
  { x: 0, y: 4.5, z: -2, s: 0.6, rx: 0, ry: 0, rz: 0 },    // AI exits upward → above
  { x: 1.45, y: 0, z: 1.0, s: 1.65, rx: 0, ry: 0, rz: 0 }, // Execution at Strategy zoom pos
]

// ── MOBILE pose tables ─────────────────────────────────────────────
// Two-step flow: coin arrives at CENTER, holds, then LIFTS to upper third
// (not high enough to crop behind the fixed nav). Text columns occupy the
// middle/lower portion once the coin has lifted.
const trianglePosesMobile = [
  { x: 0, y: 0.85, z: 0, s: 0.85, rx: 0, ry: 0, rz: 0 },     // Strategy → top
  { x: 0.85, y: -0.25, z: 0, s: 0.85, rx: 0, ry: 0, rz: 0 }, // Governance → bottom-right
  { x: -0.85, y: -0.25, z: 0, s: 0.85, rx: 0, ry: 0, rz: 0 },// Execution → bottom-left
]
const triangleRotatedPosesMobile = [
  { x: -0.85, y: -0.25, z: 0, s: 0.85, rx: 0, ry: 0, rz: 0 },
  { x: 0, y: 0.85, z: 0, s: 0.85, rx: 0, ry: 0, rz: 0 },
  { x: 0.85, y: -0.25, z: 0, s: 0.85, rx: 0, ry: 0, rz: 0 },
]
// Strategy first arrives CENTRE (a held beat), then lifts to upper third.
const strategyCenterPosesMobile = [
  { x: 0, y: 0, z: 0.4, s: 1.0, rx: 0, ry: 0, rz: 0 },      // Strategy → centre
  { x: 0, y: 5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },       // Governance hidden
  { x: 0, y: -5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },      // Execution hidden
]
const strategyZoomPosesMobile = [
  { x: 0, y: 0.85, z: 0.4, s: 0.8, rx: 0, ry: 0, rz: 0 },   // Strategy → upper third
  { x: 0, y: 5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },
  { x: 0, y: -5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },
]
// Duo first arrives CENTRE side-by-side, then both lift together.
const duoCenterPosesMobile = [
  { x: 0, y: 5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },        // Strategy hidden
  { x: -0.65, y: 0, z: 0.3, s: 0.85, rx: 0, ry: 0, rz: 0 },  // Governance centre-left
  { x: 0.65, y: 0, z: 0.3, s: 0.85, rx: 0, ry: 0, rz: 0 },   // Execution centre-right
]
const finalDuoPosesMobile = [
  { x: 0, y: 5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },
  { x: -0.65, y: 0.85, z: 0.3, s: 0.7, rx: 0, ry: 0, rz: 0 },// Governance upper-left
  { x: 0.65, y: 0.85, z: 0.3, s: 0.7, rx: 0, ry: 0, rz: 0 }, // Execution upper-right
]
// ali-v3 mobile: sequential solos at the same upper-third spot Strategy used.
const aiSoloPosesMobile = [
  { x: 0, y: 5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },        // Strategy hidden above
  { x: 0, y: 0.85, z: 0.4, s: 0.8, rx: 0, ry: 0, rz: 0 },    // AI at Strategy-zoom mobile pos
  { x: 0, y: -5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },       // Execution hidden below
]
const executionSoloPosesMobile = [
  { x: 0, y: 5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },        // Strategy still hidden above
  { x: 0, y: 5, z: -2, s: 0.5, rx: 0, ry: 0, rz: 0 },        // AI exits upward → above
  { x: 0, y: 0.85, z: 0.4, s: 0.8, rx: 0, ry: 0, rz: 0 },    // Execution at Strategy-zoom pos
]

// ali-v3: the middle coin is now ARTIFICIAL INTELLIGENCE (was GOVERNANCE).
// Stored as a space-separated single string — createLabelTexture decides
// whether to wrap onto two lines based on viewport (mobile only).
const COIN_LABELS = ['STRATEGY', 'ARTIFICIAL INTELLIGENCE', 'EXECUTION']

const styles = {
  section: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    background: 'var(--ali-cream)',
    overflow: 'hidden',
  } as const,
  stage: {
    position: 'relative',
    width: '100%',
    height: '100vh',
  } as const,
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 2,
  } as const,
  // Centred paragraph — sits BEHIND the canvas (z-1) so the solid coins
  // appear in front of it, like the NOVA reference where rotating shapes
  // overlay the text and reveal it as they move.
  paragraphWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(20px, 5vw, 60px)',
    pointerEvents: 'none',
    zIndex: 1,
    perspective: 1400,
  } as const,
  paragraph: {
    width: '92%',
    maxWidth: 980,
    textAlign: 'center',
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(22px, 2.6vw, 36px)',
    fontWeight: 500,
    lineHeight: 1.32,
    letterSpacing: '-0.015em',
    color: 'var(--ali-ink)',
  } as const,
  paragraphTilt: {
    width: '100%',
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  } as const,
  line: {
    margin: '6px 0',
  } as const,
  // Highlighted "punch" line — larger, italic, dramatic. The third line of
  // the paragraph (No one owns what's in between.) lands as the emotional
  // pivot of the whole section.
  lineHighlight: {
    fontSize: 'clamp(30px, 3.8vw, 50px)',
    fontWeight: 600,
    fontStyle: 'italic',
    letterSpacing: '-0.025em',
    lineHeight: 1.15,
    margin: '18px 0',
    color: 'var(--ali-ink)',
  } as const,
  goldHighlight: {
    color: 'var(--ali-gold)',
    fontStyle: 'italic',
    fontWeight: 600,
  } as const,
  italicWord: {
    fontStyle: 'italic',
    color: 'var(--ali-ink)',
    fontWeight: 600,
  } as const,
  italicGold: {
    fontStyle: 'italic',
    color: 'var(--ali-gold)',
    fontWeight: 700,
  } as const,
  // BOTH columns sit on the LEFT (coins move to right side in zoom + duo).
  // They sequence: "Why fails" first (during Strategy zoom), then "My role"
  // replaces it (during Execution + Governance duo).
  leftColumn: {
    position: 'absolute',
    top: '50%',
    left: 'clamp(60px, 8vw, 180px)',
    transform: 'translateY(-50%)',
    width: 'clamp(320px, 36vw, 520px)',
    zIndex: 3,
    pointerEvents: 'none',
  } as const,
  rightColumn: {
    position: 'absolute',
    top: '50%',
    left: 'clamp(60px, 8vw, 180px)',
    transform: 'translateY(-50%)',
    width: 'clamp(320px, 36vw, 520px)',
    zIndex: 3,
    pointerEvents: 'none',
  } as const,
  columnHeader: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(20px, 1.85vw, 30px)',
    fontWeight: 600,
    color: 'var(--ali-ink)',
    marginBottom: 24,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  } as const,
  bulletList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  } as const,
  bullet: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(17px, 1.55vw, 22px)',
    fontWeight: 500,
    lineHeight: 1.5,
    color: 'var(--ali-ink)',
    marginBottom: 14,
    paddingLeft: 22,
    position: 'relative',
    willChange: 'transform, opacity, filter',
  } as const,
  bulletDot: {
    position: 'absolute',
    left: 0,
    top: '0.55em',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--ali-gold)',
    boxShadow: '0 0 0 4px rgba(212, 178, 87, 0.16)',
  } as const,
  rightBulletArrow: {
    position: 'absolute',
    left: 0,
    top: '0.05em',
    color: 'var(--ali-gold)',
    fontWeight: 700,
    fontSize: '1.05em',
  } as const,
}

const WHY_FAILS = [
  'fragmented ownership',
  'unclear accountabilities',
  'unclear decision rights',
  'governance that controls instead of enables',
  'annual planning that becomes a compliance exercise',
  'systems that depend on individuals instead of institutions',
]

const MY_ROLE = [
  'clarify ownership, accountability, and decision forums',
  'align strategy with planning, budgeting, and performance',
  'build operating models that work under pressure, not just on paper',
]

// ali-v3: placeholder bullets for the AI solo phase. Same blur-up reveal
// animation as WHY_FAILS — Ali will swap these for real content later.
const AI_POINTS = [
  'prompts that survive board scrutiny',
  'frameworks (OGSM, SWOT) you can run weekly',
  'evidence stronger, faster — fewer blind spots',
  'planning tools that compress reporting cycles',
  'diagnostics that name the breakage between intent and delivery',
  'reviews that ask sharper questions, not bigger packs',
]

export default function AliBridge() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const paragraphRef = useRef<HTMLDivElement>(null)
  const paragraphTiltRef = useRef<HTMLDivElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const leftBulletsRef = useRef<(HTMLLIElement | null)[]>([])
  const rightBulletsRef = useRef<(HTMLLIElement | null)[]>([])
  const aiBulletsRef = useRef<(HTMLLIElement | null)[]>([])
  const leftHeaderRef = useRef<HTMLHeadingElement>(null)
  const rightHeaderRef = useRef<HTMLHeadingElement>(null)
  const aiHeaderRef = useRef<HTMLHeadingElement>(null)
  const aiColRef = useRef<HTMLDivElement>(null)

  // ── ScrollTrigger: drive bridge progress + paragraph + side columns ──
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof window === 'undefined') return

    window.__aliBridgeProgress = 0

    const ctx = gsap.context(() => {
      // Initial states — paragraph starts below visible centre, bullets and
      // headers start with a blur-up effect (filter: blur 8px → 0px on reveal).
      gsap.set(paragraphRef.current, { opacity: 0, y: 260 })
      gsap.set(leftHeaderRef.current, { opacity: 0, y: 18, filter: 'blur(8px)' })
      gsap.set(rightHeaderRef.current, { opacity: 0, y: 18, filter: 'blur(8px)' })
      gsap.set(aiHeaderRef.current, { opacity: 0, y: 18, filter: 'blur(8px)' })
      gsap.set(leftBulletsRef.current, { opacity: 0, y: 18, filter: 'blur(8px)' })
      gsap.set(rightBulletsRef.current, { opacity: 0, y: 18, filter: 'blur(8px)' })
      gsap.set(aiBulletsRef.current, { opacity: 0, y: 18, filter: 'blur(8px)' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${SECTION_PIN_DISTANCE}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            window.__aliBridgeProgress = self.progress
          },
          onLeave() {
            window.__aliBridgeProgress = 1
          },
          onLeaveBack() {
            window.__aliBridgeProgress = 0
          },
        },
      })

      // Paragraph: rises through the viewport linearly with scroll while
      // the star descends. Repositioned to match the tightened 0.20→0.40
      // star-rolling phase.
      tl.to(paragraphRef.current, { opacity: 1, duration: 0.05 }, 0.16)
      tl.to(
        paragraphRef.current,
        { y: -260, duration: 0.30, ease: 'none' },
        0.16,
      )
      tl.to(paragraphRef.current, { opacity: 0, duration: 0.05 }, 0.42)

      // ── Phase E: Strategy zoom, "Why fails" reveals on LEFT ──
      // Reveal starts at 0.69 so on mobile the coin has finished lifting
      // (lift completes at 0.68); on desktop this gives a brief "Strategy
      // alone" beat before the failure modes appear.
      tl.to(
        leftHeaderRef.current,
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.04 },
        0.69,
      )
      tl.to(
        leftBulletsRef.current,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.014,
          duration: 0.04,
        },
        0.71,
      )
      // ── End Phase E: Strategy + Why fails fade out together ──
      tl.to(
        leftHeaderRef.current,
        { opacity: 0, filter: 'blur(6px)', duration: 0.04 },
        0.84,
      )
      tl.to(
        leftBulletsRef.current,
        { opacity: 0, filter: 'blur(6px)', stagger: 0.005, duration: 0.04 },
        0.84,
      )

      // ── Phase F (ali-v3): AI solo — random points reveal on LEFT, same
      //    blur-up animation as "Why strategy fails". Mirrors the Strategy
      //    zoom panel exactly so the two coins feel like equal beats. ──
      tl.to(
        aiHeaderRef.current,
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.04 },
        0.87,
      )
      tl.to(
        aiBulletsRef.current,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.014,
          duration: 0.04,
        },
        0.89,
      )
      // AI text fades out as the Execution solo begins.
      tl.to(
        aiHeaderRef.current,
        { opacity: 0, filter: 'blur(6px)', duration: 0.04 },
        0.94,
      )
      tl.to(
        aiBulletsRef.current,
        { opacity: 0, filter: 'blur(6px)', stagger: 0.005, duration: 0.04 },
        0.94,
      )

      // ── Phase G: Execution solo — "My role" reveals on LEFT ──
      tl.to(
        rightHeaderRef.current,
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.04 },
        0.965,
      )
      tl.to(
        rightBulletsRef.current,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.008,
          duration: 0.03,
        },
        0.98,
      )
    }, section)

    return () => {
      ctx.revert()
      window.__aliBridgeProgress = 0
    }
  }, [])

  // ── Cursor-follow tilt for the paragraph (NOVA-style hover parallax) ──
  // Paragraph wrapper has perspective: 1400px so a small rotateX/rotateY
  // reads as a 3D tilt rather than a flat skew. eased with rAF so motion is
  // fluid even on touchpads / low-rate mice.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const tilt = paragraphTiltRef.current
    if (!tilt) return

    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }
    let rafId = 0
    let active = true

    const onMove = (e: MouseEvent) => {
      // Normalised cursor position from centre, range −1 → 1
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const tick = () => {
      if (!active) return
      eased.x += (target.x - eased.x) * 0.08
      eased.y += (target.y - eased.y) * 0.08

      const tiltX = -eased.y * 4 // cursor up → top of paragraph leans toward viewer
      const tiltY = eased.x * 4
      const transX = eased.x * 8
      const transY = eased.y * 4

      tilt.style.transform = `translate3d(${transX}px, ${transY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      active = false
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // ── Three.js scene — same silver_coin.glb as hero ──
  useEffect(() => {
    let disposed = false
    let frame = 0
    let cleanup = () => {}

    async function boot() {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { RoomEnvironment } = await import(
        'three/examples/jsm/environments/RoomEnvironment.js'
      )

      if (disposed || !canvasRef.current) return

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        38,
        window.innerWidth / window.innerHeight,
        0.1,
        80,
      )
      camera.position.set(0, 0, 7)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08

      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()

      // Same lighting recipe as the hero CoinField
      scene.add(new THREE.AmbientLight(0xe8f0f8, 0.55))
      const key = new THREE.DirectionalLight(0xffffff, 5.5)
      key.position.set(4, 5.5, 6)
      scene.add(key)
      const cool = new THREE.PointLight(0x7aa8e8, 5.5, 30)
      cool.position.set(-5, -2, 5)
      scene.add(cool)
      const warm = new THREE.PointLight(0xf0d090, 3.2, 22)
      warm.position.set(6, 3, 3)
      scene.add(warm)
      const top = new THREE.DirectionalLight(0xd8e8f5, 1.8)
      top.position.set(0, 8, 2)
      scene.add(top)

      const rig = new THREE.Group()
      scene.add(rig)

      type CoinGroup = {
        outer: import('three').Group
        inner: import('three').Group
        materials: import('three').Material[]
        labelMat: import('three').Material | null
      }
      const groups: CoinGroup[] = []

      const createLabelTexture = (label: string) => {
        // ali-v3: long labels wrap to two lines ONLY on mobile, same logic
        // as the hero coins. Desktop renders ARTIFICIAL INTELLIGENCE as a
        // single line (auto-scaled horizontally to fit the coin face).
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
        const tooLong = label.length > 12
        const firstSpace = label.indexOf(' ')
        const lines =
          isMobile && tooLong && firstSpace > 0
            ? [label.slice(0, firstSpace), label.slice(firstSpace + 1)]
            : [label]
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const fontSize = lines.length > 1 ? 92 : 125
          const lineHeight = fontSize * 1.05
          const maxTextWidth = canvas.width - 20
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#202328'
          ctx.font = `700 ${fontSize}px Arial, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const totalH = (lines.length - 1) * lineHeight
          const startY = canvas.height / 2 - totalH / 2 + 4
          lines.forEach((line, i) => {
            const widthScale = Math.min(1, maxTextWidth / ctx.measureText(line).width)
            ctx.save()
            ctx.translate(canvas.width / 2, startY + i * lineHeight)
            ctx.scale(widthScale, 1)
            ctx.fillText(line, 0, 0)
            ctx.restore()
          })
        }
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        tex.needsUpdate = true
        return tex
      }

      new GLTFLoader().load('/silver_coin.glb', gltf => {
        if (disposed) return

        const proto = gltf.scene
        const box = new THREE.Box3().setFromObject(proto)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxAxis = Math.max(size.x, size.y, size.z) || 1
        const coinDepth = 0.35
        const faceZ = (size.z / maxAxis) * 0.71 * coinDepth + 0.012

        COIN_LABELS.forEach((labelText, index) => {
          const outer = new THREE.Group()
          const inner = new THREE.Group()
          const model = proto.clone(true)

          // CRITICAL: Three.js Object3D.clone shares materials by default.
          // We must clone materials per coin so opacity changes on one coin
          // don't affect the others (the bug that made Strategy invisible
          // when AI/Execution had their opacity dropped during zoom phase).
          model.traverse(obj => {
            const mesh = obj as import('three').Mesh
            if (mesh.isMesh && mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map(m => m.clone())
              } else {
                mesh.material = mesh.material.clone()
              }
            }
          })

          const labelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.92, 0.22),
            new THREE.MeshBasicMaterial({
              map: createLabelTexture(labelText),
              transparent: true,
              depthWrite: false,
              side: THREE.DoubleSide,
            }),
          )

          model.position.sub(center)
          const normalizedScale = 1.42 / maxAxis
          model.scale.set(normalizedScale, normalizedScale, normalizedScale * coinDepth)
          labelMesh.position.z = faceZ

          const materials: import('three').Material[] = []
          model.traverse(obj => {
            const mesh = obj as import('three').Mesh
            if (mesh.isMesh && mesh.material) {
              const matList = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material]
              matList.forEach(m => {
                m.transparent = true
                materials.push(m)
              })
            }
          })

          inner.add(model)
          inner.add(labelMesh)
          outer.add(inner)
          rig.add(outer)
          groups.push({
            outer,
            inner,
            materials,
            labelMat: labelMesh.material as import('three').Material,
          })
        })
      })

      // Mouse tracking for hover-alive triangle in final phase
      const mouseTarget = { x: 0, y: 0 }
      const mouseEased = { x: 0, y: 0 }
      const onMouseMove = (e: MouseEvent) => {
        mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2
        mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('mousemove', onMouseMove, { passive: true })

      const clock = new THREE.Clock()

      const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', resize)

      // Only render when section is visible — avoids GPU load while user is
      // scrolling through other sections (was contributing to lag in the
      // books section above).
      let isVisible = false
      const visibilityObserver = new IntersectionObserver(
        entries => {
          isVisible = entries[0]?.isIntersecting ?? false
        },
        { threshold: 0, rootMargin: '200px' },
      )
      if (sectionRef.current) visibilityObserver.observe(sectionRef.current)

      const render = () => {
        frame = requestAnimationFrame(render)
        if (!isVisible) return
        const time = clock.elapsedTime
        const delta = clock.getDelta()
        const progress = clamp(window.__aliBridgeProgress ?? 0)

        // Mouse easing
        const follow = 1 - Math.exp(-delta * 6)
        mouseEased.x += (mouseTarget.x - mouseEased.x) * follow
        mouseEased.y += (mouseTarget.y - mouseEased.y) * follow

        // ── Phase progresses ──
        // 0.00 → 0.20  Reverse + star formation
        // 0.20 → 0.40  Star rolling (paragraph parallax)
        // 0.40 → 0.48  Detach to triangle
        // 0.48 → 0.55  Triangle rotates CCW
        // 0.55 → 0.62  Strategy zooms to right
        // 0.62 → 0.78  "Why fails" reveals + holds
        // 0.78 → 0.85  Strategy + bullets fade out
        // 0.85 → 0.91  AI ENTERS FROM TOP, lands at Strategy zoom position (ali-v3)
        // 0.91 → 0.93  AI held alone on the right
        // 0.93 → 1.00  AI EXITS UP, Execution ENTERS FROM BELOW to the same spot
        const reverseT = smoothstep(0, 0.20, progress)
        const starHoldT = smoothstep(0.20, 0.40, progress)
        const detachT = smoothstep(0.40, 0.48, progress)
        const rotateT = smoothstep(0.48, 0.55, progress)
        const zoomT = smoothstep(0.55, 0.62, progress)
        // ali-v3: duo replaced by two sequential solos. aiSoloT brings AI
        // down from above to the zoom spot; executionSoloT brings AI back
        // up and Execution up from below to the zoom spot.
        const aiSoloT = smoothstep(0.85, 0.91, progress)
        const executionSoloT = smoothstep(0.93, 1.00, progress)
        const aliveT = smoothstep(0.48, 0.55, progress) * (1 - smoothstep(0.55, 0.62, progress))

        // Per-coin entry timing — Strategy first, AI/Execution delayed
        const strategyT = smoothstep(0, 0.65, reverseT)
        const sideT = smoothstep(0.35, 1.0, reverseT)

        // Continuous forward rig spin throughout reverse + star + early detach.
        // Total ≈ 5.5 turns, all forward direction (no glitches).
        const rigSpin =
          mix(0, Math.PI * 4, reverseT) +
          mix(0, Math.PI * 1.5, starHoldT) +
          mix(0, Math.PI * 0.5, detachT)
        rig.rotation.set(0, 0, rigSpin)

        // Star descends linearly with scroll while the paragraph rises
        // (cross-over parallax). Recentres during detach (0.55→0.70) so
        // the triangle settles at (0, 0).
        const starRollT = clamp((progress - 0.25) / 0.30)
        const starRollY = mix(0.8, -0.8, starRollT)
        const recentre = smoothstep(0.55, 0.70, progress)
        // Mobile: coins sit at the top of the viewport (poses bake in y≈1.55)
        // so the text columns can occupy the middle of the section.
        const mobile = window.innerWidth < 768
        rig.position.y = starRollY * (1 - recentre)
        rig.scale.setScalar(1)

        // Mobile sub-phase: Strategy still lifts from centre → upper third.
        // The duo lift no longer applies (duo is gone — replaced by solos).
        const liftStrategyT = mobile ? smoothstep(0.62, 0.68, progress) : 0

        groups.forEach(({ outer, inner, materials, labelMat }, index) => {
          const init = initialPoses[index]
          const star = starPoses[index]
          const tri = mobile ? trianglePosesMobile[index] : trianglePoses[index]
          const triR = mobile ? triangleRotatedPosesMobile[index] : triangleRotatedPoses[index]
          // On mobile, the "zoom" target is CENTRE first; the lift to top happens
          // in a separate stage 4b below. On desktop, sz is the desktop zoom pose.
          const sz = mobile ? strategyCenterPosesMobile[index] : strategyZoomPoses[index]
          // ali-v3: two solo target poses replace the single duo target.
          const aiSolo = mobile ? aiSoloPosesMobile[index] : aiSoloPoses[index]
          const execSolo = mobile ? executionSoloPosesMobile[index] : executionSoloPoses[index]
          const tEntry = index === 0 ? strategyT : sideT

          // Stage 1: initial → star
          let x = mix(init.x, star.x, tEntry)
          let y = mix(init.y, star.y, tEntry)
          let z = mix(init.z, star.z, tEntry)
          let s = mix(init.s, star.s, tEntry)
          let rx = mix(init.rx, star.rx, tEntry)
          let ry = mix(init.ry, star.ry, tEntry)
          let rz = mix(init.rz, star.rz, tEntry)

          // Stage 2: star → triangle
          x = mix(x, tri.x, detachT)
          y = mix(y, tri.y, detachT)
          z = mix(z, tri.z, detachT)
          s = mix(s, tri.s, detachT)
          rx = mix(rx, tri.rx, detachT)
          ry = mix(ry, tri.ry, detachT)
          rz = mix(rz, tri.rz, detachT)

          // Stage 3: triangle → triangle rotated (CCW one vertex)
          x = mix(x, triR.x, rotateT)
          y = mix(y, triR.y, rotateT)
          z = mix(z, triR.z, rotateT)
          s = mix(s, triR.s, rotateT)
          rx = mix(rx, triR.rx, rotateT)
          ry = mix(ry, triR.ry, rotateT)
          rz = mix(rz, triR.rz, rotateT)

          // Stage 4: rotated → strategy zoom (Strategy on right, others off-screen)
          x = mix(x, sz.x, zoomT)
          y = mix(y, sz.y, zoomT)
          z = mix(z, sz.z, zoomT)
          s = mix(s, sz.s, zoomT)
          rx = mix(rx, sz.rx, zoomT)
          ry = mix(ry, sz.ry, zoomT)
          rz = mix(rz, sz.rz, zoomT)

          // Stage 5a (ali-v3): zoom → AI solo. AI moves DOWN from above to
          // the same spot Strategy occupied; Strategy stays hidden above.
          x = mix(x, aiSolo.x, aiSoloT)
          y = mix(y, aiSolo.y, aiSoloT)
          z = mix(z, aiSolo.z, aiSoloT)
          s = mix(s, aiSolo.s, aiSoloT)
          rx = mix(rx, aiSolo.rx, aiSoloT)
          ry = mix(ry, aiSolo.ry, aiSoloT)
          rz = mix(rz, aiSolo.rz, aiSoloT)

          // Stage 5b (ali-v3): AI solo → Execution solo. AI rises back up
          // and out of view; Execution rises from below into the spot.
          x = mix(x, execSolo.x, executionSoloT)
          y = mix(y, execSolo.y, executionSoloT)
          z = mix(z, execSolo.z, executionSoloT)
          s = mix(s, execSolo.s, executionSoloT)
          rx = mix(rx, execSolo.rx, executionSoloT)
          ry = mix(ry, execSolo.ry, executionSoloT)
          rz = mix(rz, execSolo.rz, executionSoloT)

          // Stage 4b (mobile): Strategy centre → lifted to upper third.
          if (mobile && index === 0) {
            const lift = strategyZoomPosesMobile[0]
            x = mix(x, lift.x, liftStrategyT)
            y = mix(y, lift.y, liftStrategyT)
            z = mix(z, lift.z, liftStrategyT)
            s = mix(s, lift.s, liftStrategyT)
          }

          outer.position.set(x, y, z)
          outer.scale.setScalar(s)
          outer.rotation.set(0, 0, rz)

          const hoverTiltX = mouseEased.y * 0.18 * aliveT
          const hoverTiltY = mouseEased.x * 0.22 * aliveT
          const breathe = aliveT * Math.sin(time * 0.6 + index * 1.7) * 0.025
          inner.rotation.set(rx + hoverTiltX + breathe, ry + hoverTiltY, 0)

          // ali-v3 per-coin opacity timeline:
          //   Strategy : enters with tEntry; fades out as AI solo starts.
          //   AI       : enters with tEntry; hides during Strategy zoom;
          //              fades IN during AI solo; fades OUT during Execution solo.
          //   Execution: enters with tEntry; hides during Strategy zoom;
          //              stays hidden during AI solo; fades IN during Execution solo.
          let coinOpacity = mix(0, 1, tEntry)
          if (index === 0) {
            // Strategy: fade out as AI takes its spot
            coinOpacity = mix(coinOpacity, 0, aiSoloT)
          } else if (index === 1) {
            // AI: hide during Strategy zoom, reveal during AI solo, hide during Execution solo
            coinOpacity = mix(coinOpacity, 0, zoomT)
            coinOpacity = mix(coinOpacity, 1, aiSoloT)
            coinOpacity = mix(coinOpacity, 0, executionSoloT)
          } else {
            // Execution: hide during Strategy zoom, stay hidden through AI solo, reveal during Execution solo
            coinOpacity = mix(coinOpacity, 0, zoomT)
            coinOpacity = mix(coinOpacity, 1, executionSoloT)
          }

          materials.forEach(m => {
            m.opacity = coinOpacity
          })
          if (labelMat) labelMat.opacity = coinOpacity
        })

        renderer.render(scene, camera)
      }

      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        visibilityObserver.disconnect()
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', resize)
        const geos = new Set<import('three').BufferGeometry>()
        const mats = new Set<import('three').Material>()
        scene.traverse(obj => {
          const mesh = obj as import('three').Mesh
          if (!mesh.isMesh) return
          if (mesh.geometry) geos.add(mesh.geometry)
          const m = mesh.material
          if (Array.isArray(m)) m.forEach(item => mats.add(item))
          else if (m) mats.add(m)
        })
        geos.forEach(g => g.dispose())
        mats.forEach(m => m.dispose())
        renderer.dispose()
      }
    }

    boot()

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={styles.section}
      aria-label="Bridging the Strategy to Execution Gap"
    >
      <div style={styles.stage}>
        <canvas ref={canvasRef} style={styles.canvas} aria-hidden="true" />

        {/* Centred paragraph (behind coins, visible during star roll) */}
        <div style={styles.paragraphWrap}>
          <div ref={paragraphRef} style={styles.paragraph}>
            <div ref={paragraphTiltRef} style={styles.paragraphTilt}>
              <div style={styles.line}>Most organizations have</div>
              <div style={styles.line}>
                <span style={styles.goldHighlight}>strategy teams</span> and{' '}
                <span style={styles.goldHighlight}>delivery units</span>.
              </div>
              <div style={styles.lineHighlight}>
                No one owns what&apos;s{' '}
                <em style={styles.italicGold}>in between</em>.
              </div>
              <div style={styles.line}>
                We are here to{' '}
                <span style={styles.goldHighlight}>
                  Bridge the Strategy to Execution Gap
                </span>
              </div>
              <div style={styles.line}>
                with the help of{' '}
                <span style={styles.goldHighlight}>Artificial Intelligence</span>{' '}
                to make that space <em style={styles.italicWord}>sharper</em>.
              </div>
            </div>
          </div>
        </div>

        {/* Left column — Why strategy fails */}
        <div
          ref={leftColRef}
          className="ali-bridge-col ali-bridge-col--left"
          style={styles.leftColumn}
        >
          <h3 ref={leftHeaderRef} style={styles.columnHeader}>
            Why strategy fails:
          </h3>
          <ul style={styles.bulletList}>
            {WHY_FAILS.map((item, i) => (
              <li
                key={item}
                ref={el => {
                  leftBulletsRef.current[i] = el
                }}
                style={styles.bullet}
              >
                <span style={styles.bulletDot} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* AI column — random points (ali-v3, shown during AI solo phase) */}
        <div
          ref={aiColRef}
          className="ali-bridge-col ali-bridge-col--left"
          style={styles.leftColumn}
        >
          <h3 ref={aiHeaderRef} style={styles.columnHeader}>
            Where AI sharpens the work:
          </h3>
          <ul style={styles.bulletList}>
            {AI_POINTS.map((item, i) => (
              <li
                key={item}
                ref={el => {
                  aiBulletsRef.current[i] = el
                }}
                style={styles.bullet}
              >
                <span style={styles.bulletDot} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — My role (shown during Execution solo phase) */}
        <div
          ref={rightColRef}
          className="ali-bridge-col ali-bridge-col--right"
          style={styles.rightColumn}
        >
          <h3 ref={rightHeaderRef} style={styles.columnHeader}>
            My role: design execution governance that enables delivery
          </h3>
          <ul style={styles.bulletList}>
            {MY_ROLE.map((item, i) => (
              <li
                key={item}
                ref={el => {
                  rightBulletsRef.current[i] = el
                }}
                style={styles.bullet}
              >
                <span style={styles.bulletDot} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile layout overrides — coin sits at the top of the section,
          text columns are vertically centered in the middle, full width. */}
      <style jsx>{`
        @media (max-width: 768px) {
          :global(.ali-bridge-col--left),
          :global(.ali-bridge-col--right) {
            top: auto !important;
            bottom: 6vh !important;
            left: 5% !important;
            right: 5% !important;
            transform: none !important;
            width: 90% !important;
            max-height: 48vh;
            overflow: hidden;
          }
          :global(.ali-bridge-col h3) {
            font-size: clamp(14px, 4vw, 18px) !important;
            margin-bottom: 12px !important;
            text-align: center;
          }
          :global(.ali-bridge-col li) {
            font-size: clamp(12px, 3.4vw, 15px) !important;
            margin-bottom: 9px !important;
            padding-left: 18px !important;
          }
        }
      `}</style>
    </section>
  )
}
