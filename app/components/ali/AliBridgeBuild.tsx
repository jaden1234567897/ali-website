'use client'

// "Bridge the Strategy to Execution Gap" — narrative section that sits
// between the Tier Cards and the existing AliBridge triangle.
//
// What happens:
//   • Two silver coins (Execution / Strategy on desktop, Strategy / Execution
//     on mobile) — same model as the hero — sit on opposite sides of the
//     viewport with empty space between them.
//   • As the user scrolls, a suspension bridge BUILDS between them in stages:
//       1. Pylons rise out of nothing
//       2. Main cable swoops between the pylons in a catenary curve
//       3. Vertical hangers drop from the cable to the deck position
//       4. Deck slides across to connect both sides
//   • When the bridge is complete, a gold "AI pulse" travels along it
//     continuously — the visual proof that AI is what bridges the gap.

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function AliBridgeBuild() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // ── Three.js coins ──────────────────────────────────────────────
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
      if (disposed || !canvasRef.current || !sectionRef.current) return

      const container = sectionRef.current
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        32,
        container.clientWidth / container.clientHeight,
        0.1,
        80,
      )
      camera.position.set(0, 0, 8)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05

      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()

      // Same lighting recipe as the hero coins so they read as the same
      // physical objects.
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

      type Coin = {
        outer: import('three').Group
        inner: import('three').Group
        label: string
      }
      const coins: Coin[] = []

      const createLabelTex = (label: string) => {
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#202328'
          ctx.font = '700 125px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 4)
        }
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        return tex
      }

      const loader = new GLTFLoader()
      loader.load('/silver_coin.glb', gltf => {
        if (disposed) return
        const proto = gltf.scene
        const box = new THREE.Box3().setFromObject(proto)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxAxis = Math.max(size.x, size.y, size.z) || 1
        const coinDepth = 0.35
        const faceZ = (size.z / maxAxis) * 0.71 * coinDepth + 0.012

        const labels = ['STRATEGY', 'EXECUTION']
        labels.forEach(label => {
          const outer = new THREE.Group()
          const inner = new THREE.Group()
          const model = proto.clone(true)

          // Clone materials per coin so labels don't fight each other
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
              map: createLabelTex(label),
              transparent: true,
              depthWrite: false,
              side: THREE.DoubleSide,
            }),
          )

          model.position.sub(center)
          const ns = 1.42 / maxAxis
          model.scale.set(ns, ns, ns * coinDepth)
          labelMesh.position.z = faceZ

          inner.add(model)
          inner.add(labelMesh)
          outer.add(inner)
          scene.add(outer)
          coins.push({ outer, inner, label })
        })
      })

      const layoutCoins = () => {
        if (coins.length < 2) return
        const isMobile = window.innerWidth < 768
        // Desktop: Execution (idx 1) left, Strategy (idx 0) right
        // Mobile:  Strategy (idx 0) top,   Execution (idx 1) bottom
        const strategy = coins[0]
        const execution = coins[1]
        if (isMobile) {
          strategy.outer.position.set(0, 2.2, 0)
          execution.outer.position.set(0, -2.2, 0)
          strategy.outer.scale.setScalar(0.95)
          execution.outer.scale.setScalar(0.95)
        } else {
          execution.outer.position.set(-3.1, 0, 0)
          strategy.outer.position.set(3.1, 0, 0)
          strategy.outer.scale.setScalar(1.15)
          execution.outer.scale.setScalar(1.15)
        }
      }

      const resize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
        layoutCoins()
      }
      window.addEventListener('resize', resize)

      // Only render when visible
      let isVisible = false
      const visObserver = new IntersectionObserver(
        entries => {
          isVisible = entries[0]?.isIntersecting ?? false
        },
        { threshold: 0, rootMargin: '200px' },
      )
      visObserver.observe(container)

      const clock = new THREE.Clock()
      const render = () => {
        frame = requestAnimationFrame(render)
        if (!isVisible) return
        const t = clock.elapsedTime
        // Idle breathing rotation
        coins.forEach((coin, i) => {
          if (!coin.outer) return
          if (coins.length === 2 && coin.outer.position.x !== undefined) {
            // first ensure layout (in case GLB loaded late)
            // small idle wobble
            coin.outer.rotation.y = Math.sin(t * 0.4 + i * 1.7) * 0.18
            coin.outer.rotation.x = Math.sin(t * 0.32 + i * 0.9) * 0.06
          }
        })
        renderer.render(scene, camera)
      }
      render()

      // Initial layout once coins load
      const layoutInterval = window.setInterval(() => {
        if (coins.length >= 2) {
          layoutCoins()
          window.clearInterval(layoutInterval)
        }
      }, 100)

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', resize)
        window.clearInterval(layoutInterval)
        visObserver.disconnect()
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

  // ── Bridge SVG scroll animation ─────────────────────────────────
  useEffect(() => {
    if (!sectionRef.current || !svgRef.current) return
    const svg = svgRef.current

    // Find each animatable path/group
    const pylonL = svg.querySelector<SVGPathElement>('#pylon-left')
    const pylonR = svg.querySelector<SVGPathElement>('#pylon-right')
    const cable = svg.querySelector<SVGPathElement>('#cable')
    const deck = svg.querySelector<SVGPathElement>('#deck')
    const hangers = svg.querySelectorAll<SVGLineElement>('.hanger')
    const pulse = svg.querySelector<SVGCircleElement>('#ai-pulse')
    const bridgeLabel = svg.querySelector<SVGGElement>('#bridge-label')

    // Pre-compute path lengths and set them to invisible state
    const setupPath = (el: SVGPathElement | null) => {
      if (!el) return 0
      const len = el.getTotalLength()
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = `${len}`
      return len
    }
    setupPath(pylonL)
    setupPath(pylonR)
    setupPath(cable)
    setupPath(deck)
    hangers.forEach(h => {
      const len = h.y2.baseVal.value - h.y1.baseVal.value
      h.style.strokeDasharray = `${Math.abs(len)}`
      h.style.strokeDashoffset = `${Math.abs(len)}`
    })
    if (pulse) pulse.style.opacity = '0'
    if (bridgeLabel) bridgeLabel.style.opacity = '0'

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'bottom 50%',
          scrub: 0.5,
        },
      })

      // Stage 1 — pylons rise (both at once)
      tl.to([pylonL, pylonR], { strokeDashoffset: 0, duration: 0.2 }, 0)
      // Stage 2 — cable arcs between pylons
      tl.to(cable, { strokeDashoffset: 0, duration: 0.25 }, 0.2)
      // Stage 3 — hangers drop one by one
      tl.to(
        hangers,
        { strokeDashoffset: 0, stagger: 0.025, duration: 0.05 },
        0.42,
      )
      // Stage 4 — deck slides across
      tl.to(deck, { strokeDashoffset: 0, duration: 0.2 }, 0.6)
      // Stage 5 — "Bridge the Strategy to Execution Gap" label fades in
      tl.to(bridgeLabel, { opacity: 1, duration: 0.1 }, 0.78)
      // Stage 6 — AI pulse becomes visible (CSS animation handles the
      // travel along the deck once it's revealed)
      tl.to(pulse, { opacity: 1, duration: 0.05 }, 0.85)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="ali-bridge-build"
      aria-label="Bridge the Strategy to Execution Gap"
    >
      <canvas ref={canvasRef} className="ali-bridge-build-canvas" aria-hidden />

      <div className="ali-bridge-build-text-top">
        <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
          The Gap
        </p>
        <h2 className="ali-h2">
          Most organizations have <em>strategy teams</em> and{' '}
          <em>delivery units</em>.
        </h2>
        <p className="ali-bridge-build-deck">No one owns what's in between.</p>
      </div>

      <svg
        ref={svgRef}
        className="ali-bridge-build-svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {/* Pylons */}
        <path
          id="pylon-left"
          d="M 200 500 L 200 180"
          stroke="var(--ali-ink)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          id="pylon-right"
          d="M 800 500 L 800 180"
          stroke="var(--ali-ink)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Pylon caps */}
        <line x1="185" y1="180" x2="215" y2="180" stroke="var(--ali-ink)" strokeWidth="3" strokeLinecap="round" />
        <line x1="785" y1="180" x2="815" y2="180" stroke="var(--ali-ink)" strokeWidth="3" strokeLinecap="round" />
        {/* Main cable — catenary curve between pylon tops */}
        <path
          id="cable"
          d="M 200 180 Q 500 380 800 180"
          stroke="var(--ali-gold)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Vertical hangers — from cable to deck (y=470) */}
        {[
          { t: 0.15, x: 290, y: 244 },
          { t: 0.27, x: 362, y: 286 },
          { t: 0.4, x: 440, y: 324 },
          { t: 0.5, x: 500, y: 330 },
          { t: 0.6, x: 560, y: 324 },
          { t: 0.73, x: 638, y: 286 },
          { t: 0.85, x: 710, y: 244 },
        ].map(h => (
          <line
            key={h.t}
            className="hanger"
            x1={h.x}
            y1={h.y}
            x2={h.x}
            y2={470}
            stroke="var(--ali-gold)"
            strokeOpacity={0.55}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
        {/* Deck — horizontal line across */}
        <path
          id="deck"
          d="M 130 470 L 870 470"
          stroke="var(--ali-ink)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Bridge label */}
        <g id="bridge-label">
          <text
            x="500"
            y="510"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="20"
            fontStyle="italic"
            fontWeight="600"
            fill="var(--ali-gold)"
          >
            Bridge the Gap
          </text>
        </g>
        {/* AI pulse — a small dot that travels along the deck once revealed */}
        <circle
          id="ai-pulse"
          r="6"
          fill="var(--ali-gold)"
          filter="url(#pulse-glow)"
        >
          <animateMotion
            dur="3.2s"
            repeatCount="indefinite"
            path="M 130 470 L 870 470"
          />
        </circle>
        <defs>
          <filter id="pulse-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="ali-bridge-build-text-bottom">
        <p>
          We are here to{' '}
          <em>Bridge the Strategy to Execution Gap</em>
          {' '}with the help of{' '}
          <strong>Artificial Intelligence</strong> to make that space sharper.
        </p>
      </div>
    </section>
  )
}
