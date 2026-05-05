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

const SECTION_PIN_DISTANCE = 3400

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

// Triangle final — face-on, separated, NOT touching (breathing room between).
const trianglePoses = [
  { x: 0, y: 1.05, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 },
  { x: -1.55, y: -0.75, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 },
  { x: 1.55, y: -0.75, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0 },
]

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
  // Side columns — appear after the triangle settles
  leftColumn: {
    position: 'absolute',
    top: '50%',
    left: 'clamp(24px, 4vw, 80px)',
    transform: 'translateY(-50%)',
    width: 'clamp(220px, 22vw, 300px)',
    zIndex: 3,
    pointerEvents: 'none',
  } as const,
  rightColumn: {
    position: 'absolute',
    top: '50%',
    right: 'clamp(24px, 4vw, 80px)',
    transform: 'translateY(-50%)',
    width: 'clamp(220px, 22vw, 320px)',
    zIndex: 3,
    pointerEvents: 'none',
  } as const,
  columnHeader: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(15px, 1.2vw, 18px)',
    fontWeight: 600,
    color: 'var(--ali-ink)',
    marginBottom: 16,
    lineHeight: 1.35,
  } as const,
  bulletList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  } as const,
  bullet: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(13px, 1vw, 14.5px)',
    fontWeight: 400,
    lineHeight: 1.5,
    color: 'var(--ali-ink-2)',
    marginBottom: 10,
    paddingLeft: 14,
    position: 'relative',
  } as const,
  bulletDot: {
    position: 'absolute',
    left: 0,
    top: '0.55em',
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--ali-gold)',
  } as const,
  rightBulletArrow: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: 'var(--ali-gold)',
    fontWeight: 700,
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

export default function AliBridge() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const paragraphRef = useRef<HTMLDivElement>(null)
  const paragraphTiltRef = useRef<HTMLDivElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const leftBulletsRef = useRef<(HTMLLIElement | null)[]>([])
  const rightBulletsRef = useRef<(HTMLLIElement | null)[]>([])
  const leftHeaderRef = useRef<HTMLHeadingElement>(null)
  const rightHeaderRef = useRef<HTMLHeadingElement>(null)

  // ── ScrollTrigger: drive bridge progress + paragraph + side columns ──
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof window === 'undefined') return

    window.__aliBridgeProgress = 0

    const ctx = gsap.context(() => {
      // Initial states — paragraph starts BELOW the visible centre so it can
      // rise through the viewport with scroll (NOVA-style cross-over with
      // the star which descends).
      gsap.set(paragraphRef.current, { opacity: 0, y: 260 })
      gsap.set(leftHeaderRef.current, { opacity: 0, y: 18 })
      gsap.set(rightHeaderRef.current, { opacity: 0, y: 18 })
      gsap.set(leftBulletsRef.current, { opacity: 0, y: 14 })
      gsap.set(rightBulletsRef.current, { opacity: 0, y: 14 })

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

      // Paragraph: rises through the viewport linearly with scroll
      // (y: 260 → -260 over 40 % of progress), with opacity fade-in/out
      // bookending the visible window. Linear ease so the rise feels tied
      // to scroll (parallax), not eased by GSAP.
      tl.to(paragraphRef.current, { opacity: 1, duration: 0.06 }, 0.22)
      tl.to(
        paragraphRef.current,
        { y: -260, duration: 0.40, ease: 'none' },
        0.22,
      )
      tl.to(paragraphRef.current, { opacity: 0, duration: 0.06 }, 0.58)

      // Left column: header then bullets stagger in (0.72 → 0.85)
      tl.to(leftHeaderRef.current, { opacity: 1, y: 0, duration: 0.05 }, 0.72)
      tl.to(
        leftBulletsRef.current,
        { opacity: 1, y: 0, stagger: 0.012, duration: 0.04 },
        0.74,
      )

      // Right column: header then bullets stagger in (0.86 → 0.98)
      tl.to(rightHeaderRef.current, { opacity: 1, y: 0, duration: 0.05 }, 0.86)
      tl.to(
        rightBulletsRef.current,
        { opacity: 1, y: 0, stagger: 0.018, duration: 0.04 },
        0.88,
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
        const longLabel = label.length > 12
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const fontSize = 125
          const maxTextWidth = canvas.width - (longLabel ? 20 : 0)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#202328'
          ctx.font = `700 ${fontSize}px Arial, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2 + 4)
          ctx.scale(Math.min(1, maxTextWidth / ctx.measureText(label).width), 1)
          ctx.fillText(label, 0, 0)
          ctx.restore()
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

      const render = () => {
        frame = requestAnimationFrame(render)
        const time = clock.elapsedTime
        const delta = clock.getDelta()
        const progress = clamp(window.__aliBridgeProgress ?? 0)

        // Mouse easing
        const follow = 1 - Math.exp(-delta * 6)
        mouseEased.x += (mouseTarget.x - mouseEased.x) * follow
        mouseEased.y += (mouseTarget.y - mouseEased.y) * follow

        // ── Phase progresses ──
        // 0.00 → 0.10  Strategy returns from POV (face-on, retreats)
        // 0.10 → 0.30  AI/Execution arrive, all 3 form star
        // 0.30 → 0.55  Star rolls (~2 viewports of pin)
        // 0.55 → 0.70  Detach to triangle (face-on, separated)
        // 0.70 → 1.00  Triangle holds, side columns reveal, hover alive
        const reverseT = smoothstep(0, 0.30, progress)
        const starHoldT = smoothstep(0.30, 0.55, progress)
        const detachT = smoothstep(0.55, 0.70, progress)
        const aliveT = smoothstep(0.65, 0.85, progress)

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

        // Vertical scroll-tracking — star descends through the viewport
        // linearly with scroll while the paragraph rises (cross-over
        // parallax). Recentres smoothly during the detach so the triangle
        // poses (which are absolute) settle around (0, 0).
        const starRollT = clamp((progress - 0.10) / 0.45)
        const starRollY = mix(1.2, -1.2, starRollT)
        const recentre = smoothstep(0.55, 0.70, progress)
        rig.position.y = starRollY * (1 - recentre)

        groups.forEach(({ outer, inner, materials, labelMat }, index) => {
          const init = initialPoses[index]
          const star = starPoses[index]
          const tri = trianglePoses[index]
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

          outer.position.set(x, y, z)
          outer.scale.setScalar(s)
          outer.rotation.set(0, 0, rz)

          // Hover-alive — each coin tilts gently toward cursor in triangle phase
          const hoverTiltX = mouseEased.y * 0.18 * aliveT
          const hoverTiltY = mouseEased.x * 0.22 * aliveT
          // Subtle breathing when alive (regardless of mouse position)
          const breathe = aliveT * Math.sin(time * 0.6 + index * 1.7) * 0.025
          inner.rotation.set(rx + hoverTiltX + breathe, ry + hoverTiltY, 0)

          // ── Opacity: SOLID coins throughout. Just fade in at start so
          //    Strategy doesn't pop into existence; same for AI/Execution. ──
          const coinOpacity = mix(0, 1, tEntry)
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
        <div ref={leftColRef} style={styles.leftColumn}>
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

        {/* Right column — My role */}
        <div ref={rightColRef} style={styles.rightColumn}>
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
                <span style={styles.rightBulletArrow} aria-hidden="true">
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
