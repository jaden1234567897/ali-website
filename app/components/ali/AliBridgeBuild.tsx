'use client'

// Premium Scroll Timeline — narrative reveal of the strategy→execution gap
// story, modelled on the Framer Premium Timeline component.
//
// Section is tall (~220vh) with natural scroll (no pin). A white vector line
// snakes vertically through the section, drawing as the user scrolls. Cards
// reveal one by one as they enter the viewport — text and coins both. Once
// revealed, nothing fades out. Strategy and Execution coins sit on opposite
// sides of the section; AI coin appears at the bottom alongside the closing
// statement.
//
// Coins are individual small Three.js scenes (one per card) — keeps the
// layout DOM-driven, simplifies positioning, and avoids the
// canvas-spanning-the-whole-section pattern that made the previous version
// drift behind text.

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ── Single 3D coin component ────────────────────────────────────
function SingleCoin({ label }: { label: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: false, margin: '-50px' })

  useEffect(() => {
    let disposed = false
    let frame = 0
    let cleanup = () => {}
    let visible = false

    async function boot() {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { RoomEnvironment } = await import(
        'three/examples/jsm/environments/RoomEnvironment.js'
      )
      if (disposed || !canvasRef.current || !containerRef.current) return

      const container = containerRef.current
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50)
      camera.position.set(0, 0, 4.5)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      const resize = () => {
        const s = Math.min(container.clientWidth, container.clientHeight)
        renderer.setSize(s, s)
        camera.aspect = 1
        camera.updateProjectionMatrix()
      }
      resize()
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08

      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()

      // Same lighting recipe used by the hero coins so all coins on the
      // site read as the same physical material.
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

      const outer = new THREE.Group()
      scene.add(outer)
      outer.scale.setScalar(0)
      let entryT = 0 // 0→1 once visible

      new GLTFLoader().load('/silver_coin.glb', gltf => {
        if (disposed) return
        const proto = gltf.scene
        const box = new THREE.Box3().setFromObject(proto)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxAxis = Math.max(size.x, size.y, size.z) || 1
        const coinDepth = 0.35
        const faceZ = (size.z / maxAxis) * 0.71 * coinDepth + 0.012

        const model = proto.clone(true)
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
        model.position.sub(center)
        const ns = 1.42 / maxAxis
        model.scale.set(ns, ns, ns * coinDepth)

        // Label texture
        const labelCanvas = document.createElement('canvas')
        labelCanvas.width = 1024
        labelCanvas.height = 256
        const lctx = labelCanvas.getContext('2d')
        if (lctx) {
          lctx.fillStyle = '#202328'
          lctx.font = '700 125px Arial, sans-serif'
          lctx.textAlign = 'center'
          lctx.textBaseline = 'middle'
          lctx.fillText(label, labelCanvas.width / 2, labelCanvas.height / 2 + 4)
        }
        const labelTex = new THREE.CanvasTexture(labelCanvas)
        labelTex.colorSpace = THREE.SRGBColorSpace
        labelTex.anisotropy = 8
        const labelMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(0.92, 0.22),
          new THREE.MeshBasicMaterial({
            map: labelTex,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
        )
        labelMesh.position.z = faceZ

        outer.add(model)
        outer.add(labelMesh)
      })

      window.addEventListener('resize', resize)

      const ro = new ResizeObserver(resize)
      ro.observe(container)

      const clock = new THREE.Clock()
      const render = () => {
        frame = requestAnimationFrame(render)
        if (!visible) return
        const t = clock.elapsedTime
        const delta = clock.getDelta()
        // Smooth entry — ease scale toward 1 once the card is in view
        entryT += (1 - entryT) * Math.min(1, delta * 2.6)
        outer.scale.setScalar(entryT)
        // Gentle idle wobble
        outer.rotation.y = Math.sin(t * 0.45) * 0.22
        outer.rotation.x = Math.sin(t * 0.35) * 0.08
        renderer.render(scene, camera)
      }
      render()

      const setVisible = (v: boolean) => {
        visible = v
      }
      ;(container as HTMLDivElement & { __setVisible?: (v: boolean) => void }).__setVisible = setVisible

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', resize)
        ro.disconnect()
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
  }, [label])

  // Sync visibility flag with the render loop (allows render to skip when
  // off-screen and resume once in view).
  useEffect(() => {
    const el = containerRef.current as
      | (HTMLDivElement & { __setVisible?: (v: boolean) => void })
      | null
    el?.__setVisible?.(isInView)
  }, [isInView])

  return (
    <div ref={containerRef} className="ali-bb-coin" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  )
}

// ── Reveal-on-scroll wrapper for text cards ─────────────────────
function RevealCard({
  children,
  align,
  className = '',
}: {
  children: React.ReactNode
  align: 'left' | 'right' | 'center'
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-15%' })
  return (
    <motion.div
      ref={ref}
      className={`ali-bb-card ali-bb-card--${align} ${className}`}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ── Main section ────────────────────────────────────────────────
export default function AliBridgeBuild() {
  const sectionRef = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !pathRef.current) return
    const path = pathRef.current
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    path.style.strokeDashoffset = `${len}`

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 0.7,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="ali-bb" aria-label="Bridge the Strategy to Execution Gap">
      {/* Vector line — sits behind everything else, draws as user scrolls.
          viewBox covers the section as a 100×100 grid so each card can be
          placed by percentage and the path will track them. */}
      <svg
        className="ali-bb-line"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          ref={pathRef}
          d="
            M 50 6
            C 50 14, 30 14, 28 20
            C 26 28, 72 32, 72 42
            C 72 50, 50 48, 50 56
            C 50 64, 72 66, 72 74
            C 72 82, 30 82, 28 90
          "
          stroke="#ffffff"
          strokeWidth="0.32"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="ali-bb-grid">
        {/* Row 1 — Most organizations have (centred) */}
        <RevealCard align="center" className="ali-bb-row-top">
          <p className="ali-bb-intro">Most organizations have</p>
        </RevealCard>

        {/* Row 2 — Strategy team / coin (left) */}
        <RevealCard align="left" className="ali-bb-row-strategy">
          <h3 className="ali-bb-label">Strategy team</h3>
          <SingleCoin label="STRATEGY" />
        </RevealCard>

        {/* Row 3 — delivery units text (right) */}
        <RevealCard align="right" className="ali-bb-row-delivery">
          <p className="ali-bb-body">
            and <em>delivery units</em>. No one owns what&apos;s in between.
          </p>
        </RevealCard>

        {/* Row 4 — we are here to bridge the (centred) */}
        <RevealCard align="center" className="ali-bb-row-mid">
          <p className="ali-bb-body ali-bb-body--strong">
            We are here to bridge the
          </p>
        </RevealCard>

        {/* Row 5 — to execution / coin (right) */}
        <RevealCard align="right" className="ali-bb-row-execution">
          <h3 className="ali-bb-label">to Execution.</h3>
          <SingleCoin label="EXECUTION" />
        </RevealCard>

        {/* Row 6 — with the help of AI / coin (left) */}
        <RevealCard align="left" className="ali-bb-row-ai">
          <p className="ali-bb-body">with the help of</p>
          <SingleCoin label="AI" />
          <h3 className="ali-bb-label ali-bb-label--gold">Artificial Intelligence</h3>
          <p className="ali-bb-body ali-bb-body--muted">to make that space sharper.</p>
        </RevealCard>
      </div>
    </section>
  )
}
