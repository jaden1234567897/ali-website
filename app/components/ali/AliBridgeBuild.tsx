'use client'

// Narrative reveal section — 5-phase scroll-driven story that introduces
// the 3 coins (Strategy, Execution, AI) one by one alongside the text
// that names them.
//
// Phase 1: "Most organizations have STRATEGY TEAMS"     → Strategy coin scales in (centre)
// Phase 2: "and delivery units. No one owns…"           → Strategy slides to its side
// Phase 3: "We are here to Bridge the Strategy to       → Execution coin appears
//          EXECUTION GAP"                                  on the opposite side
// Phase 4: "with the help of ARTIFICIAL INTELLIGENCE"   → AI coin rises into the middle
// Phase 5: "to make that space sharper."                → AI connection lines + pulse
//                                                          particles activate
//
// Section is pinned for ~4000 px of scroll. Three.js scene with 3 silver
// coins is the constant backdrop; text overlay reveals in stages; an SVG
// overlay draws the AI connection curves and runs travelling-pulse particles
// along them once everything's revealed.

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

declare global {
  interface Window {
    __aliBridgeBuildProgress?: number
  }
}

const SECTION_PIN_DISTANCE = 4000

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function AliBridgeBuild() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Text refs — each phase has its own div that we animate independently
  const phase1Ref = useRef<HTMLDivElement>(null)
  const phase2Ref = useRef<HTMLDivElement>(null)
  const phase3Ref = useRef<HTMLDivElement>(null)
  const phase4Ref = useRef<HTMLDivElement>(null)
  const phase5Ref = useRef<HTMLDivElement>(null)

  // ── ScrollTrigger: pinned timeline driving text reveals + global progress
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof window === 'undefined') return

    window.__aliBridgeBuildProgress = 0

    const ctx = gsap.context(() => {
      // Initial — all text hidden
      const allPhases = [
        phase1Ref.current,
        phase2Ref.current,
        phase3Ref.current,
        phase4Ref.current,
        phase5Ref.current,
      ]
      gsap.set(allPhases, { opacity: 0, y: 26, filter: 'blur(8px)' })

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
            window.__aliBridgeBuildProgress = self.progress
          },
          onLeave() {
            window.__aliBridgeBuildProgress = 1
          },
          onLeaveBack() {
            window.__aliBridgeBuildProgress = 0
          },
        },
      })

      // Phase 1 — Most organizations have STRATEGY TEAMS
      tl.to(phase1Ref.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.05 }, 0.05)
      tl.to(phase1Ref.current, { opacity: 0, filter: 'blur(4px)', duration: 0.04 }, 0.27)

      // Phase 2 — and delivery units. No one owns what's in between.
      tl.to(phase2Ref.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.05 }, 0.25)
      tl.to(phase2Ref.current, { opacity: 0, filter: 'blur(4px)', duration: 0.04 }, 0.45)

      // Phase 3 — We are here to Bridge the Strategy to EXECUTION GAP
      tl.to(phase3Ref.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.05 }, 0.45)
      tl.to(phase3Ref.current, { opacity: 0, filter: 'blur(4px)', duration: 0.04 }, 0.65)

      // Phase 4 — with the help of ARTIFICIAL INTELLIGENCE
      tl.to(phase4Ref.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.05 }, 0.65)
      tl.to(phase4Ref.current, { opacity: 0, filter: 'blur(4px)', duration: 0.04 }, 0.85)

      // Phase 5 — to make that space sharper.
      tl.to(phase5Ref.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.05 }, 0.83)
    }, section)

    return () => {
      ctx.revert()
      window.__aliBridgeBuildProgress = 0
    }
  }, [])

  // ── Three.js: 3 coins choreographed by scroll progress
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
        34,
        container.clientWidth / container.clientHeight,
        0.1,
        80,
      )
      camera.position.set(0, 0, 9)
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
      renderer.toneMappingExposure = 1.08

      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()

      // Same lighting as hero coins so all coins on the site read identical
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
        materials: import('three').Material[]
        labelMat: import('three').Material | null
      }
      const coins: Coin[] = []
      const labels = ['STRATEGY', 'EXECUTION', 'AI']

      const makeLabelTex = (label: string) => {
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

      new GLTFLoader().load('/silver_coin.glb', gltf => {
        if (disposed) return
        const proto = gltf.scene
        const box = new THREE.Box3().setFromObject(proto)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxAxis = Math.max(size.x, size.y, size.z) || 1
        const coinDepth = 0.35
        const faceZ = (size.z / maxAxis) * 0.71 * coinDepth + 0.012

        labels.forEach(label => {
          const outer = new THREE.Group()
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
          const labelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.92, 0.22),
            new THREE.MeshBasicMaterial({
              map: makeLabelTex(label),
              transparent: true,
              depthWrite: false,
              side: THREE.DoubleSide,
            }),
          )
          model.position.sub(center)
          const ns = 1.42 / maxAxis
          model.scale.set(ns, ns, ns * coinDepth)
          labelMesh.position.z = faceZ

          const materials: import('three').Material[] = []
          model.traverse(obj => {
            const mesh = obj as import('three').Mesh
            if (mesh.isMesh && mesh.material) {
              const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
              list.forEach(m => {
                m.transparent = true
                materials.push(m)
              })
            }
          })

          outer.add(model)
          outer.add(labelMesh)
          // Start invisible — choreography fades each one in at its phase
          outer.scale.setScalar(0)
          materials.forEach(m => (m.opacity = 0))
          ;(labelMesh.material as import('three').Material).opacity = 0
          scene.add(outer)
          coins.push({
            outer,
            materials,
            labelMat: labelMesh.material as import('three').Material,
          })
        })
      })

      const resize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', resize)

      let isVisible = false
      const visObserver = new IntersectionObserver(
        entries => {
          isVisible = entries[0]?.isIntersecting ?? false
        },
        { threshold: 0, rootMargin: '200px' },
      )
      visObserver.observe(container)

      const clock = new THREE.Clock()

      // Helper — set coin opacity (all materials + label)
      const setCoinOpacity = (coin: Coin, op: number) => {
        coin.materials.forEach(m => (m.opacity = op))
        if (coin.labelMat) coin.labelMat.opacity = op
      }

      const render = () => {
        frame = requestAnimationFrame(render)
        if (!isVisible) return
        const t = clock.elapsedTime
        const progress = clamp(window.__aliBridgeBuildProgress ?? 0)

        const isMobile = window.innerWidth < 768
        // Final positions for each coin
        // Desktop: Execution left, AI middle, Strategy right
        // Mobile:  Strategy top,  AI middle, Execution bottom
        const finalPos = isMobile
          ? {
              strategy: { x: 0, y: 2.5, z: 0 },
              execution: { x: 0, y: -2.5, z: 0 },
              ai: { x: 0, y: 0, z: 0 },
            }
          : {
              strategy: { x: 2.6, y: 0, z: 0 },
              execution: { x: -2.6, y: 0, z: 0 },
              ai: { x: 0, y: 0, z: 0 },
            }

        // Phase progresses
        const strategyEnter = smoothstep(0.05, 0.18, progress)
        const strategyMove = smoothstep(0.18, 0.32, progress)
        const executionEnter = smoothstep(0.45, 0.60, progress)
        const aiEnter = smoothstep(0.65, 0.80, progress)

        if (coins.length === 3) {
          const [strategy, execution, ai] = coins
          // Strategy — enters centre, then slides to final
          const sx = mix(0, finalPos.strategy.x, strategyMove)
          const sy = mix(0, finalPos.strategy.y, strategyMove)
          strategy.outer.position.set(sx, sy, 0)
          strategy.outer.scale.setScalar(mix(0, 1.0, strategyEnter))
          setCoinOpacity(strategy, strategyEnter)
          strategy.outer.rotation.y = Math.sin(t * 0.4) * 0.18
          strategy.outer.rotation.x = Math.sin(t * 0.32) * 0.06

          // Execution — fades in at final position
          execution.outer.position.set(
            finalPos.execution.x,
            finalPos.execution.y,
            0,
          )
          execution.outer.scale.setScalar(mix(0, 1.0, executionEnter))
          setCoinOpacity(execution, executionEnter)
          execution.outer.rotation.y = Math.sin(t * 0.4 + 1.7) * 0.18
          execution.outer.rotation.x = Math.sin(t * 0.32 + 0.9) * 0.06

          // AI — scales up from middle bottom into centre
          const aiStartY = isMobile ? -1 : 0
          const aiStartZ = isMobile ? 0 : -1
          ai.outer.position.set(
            finalPos.ai.x,
            mix(aiStartY, finalPos.ai.y, aiEnter),
            mix(aiStartZ, finalPos.ai.z, aiEnter),
          )
          ai.outer.scale.setScalar(mix(0, 1.0, aiEnter))
          setCoinOpacity(ai, aiEnter)
          ai.outer.rotation.y = Math.sin(t * 0.45 + 3.4) * 0.22
          ai.outer.rotation.x = Math.sin(t * 0.36 + 1.8) * 0.08
        }

        renderer.render(scene, camera)
      }
      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', resize)
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

  // ── SVG: AI connection curves drawn by scroll progress
  useEffect(() => {
    if (!svgRef.current || !sectionRef.current) return
    const svg = svgRef.current
    const curveStrat = svg.querySelector<SVGPathElement>('#curve-strategy')
    const curveExec = svg.querySelector<SVGPathElement>('#curve-execution')
    const curveDirect = svg.querySelector<SVGPathElement>('#curve-direct')

    const setupPath = (el: SVGPathElement | null) => {
      if (!el) return
      const len = el.getTotalLength()
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = `${len}`
    }
    setupPath(curveStrat)
    setupPath(curveExec)
    setupPath(curveDirect)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${SECTION_PIN_DISTANCE}`,
          scrub: 0.5,
        },
      })
      // Direct Strategy↔Execution curve draws after Execution enters
      tl.to(curveDirect, { strokeDashoffset: 0, duration: 0.10 }, 0.58)
      // Then AI joins, and curves from AI to each side draw
      tl.to(curveStrat, { strokeDashoffset: 0, duration: 0.08 }, 0.78)
      tl.to(curveExec, { strokeDashoffset: 0, duration: 0.08 }, 0.78)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="ali-bb"
      aria-label="Bridge the Strategy to Execution Gap"
    >
      <canvas ref={canvasRef} className="ali-bb-canvas" aria-hidden />

      {/* SVG overlay — AI connection curves (drawn by scroll), travelling pulses */}
      <svg
        ref={svgRef}
        className="ali-bb-svg"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="curve-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(196,151,58,0)" />
            <stop offset="30%" stopColor="rgba(196,151,58,0.6)" />
            <stop offset="70%" stopColor="rgba(196,151,58,0.6)" />
            <stop offset="100%" stopColor="rgba(196,151,58,0)" />
          </linearGradient>
          <filter id="bb-pulse-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Direct curve: Execution (left) → Strategy (right), bypasses centre */}
        <path
          id="curve-direct"
          d="M 230 300 Q 600 130 970 300"
          stroke="url(#curve-grad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        {/* AI ↔ Strategy curve */}
        <path
          id="curve-strategy"
          d="M 600 300 Q 770 360 970 300"
          stroke="var(--ali-gold)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* AI ↔ Execution curve */}
        <path
          id="curve-execution"
          d="M 600 300 Q 430 360 230 300"
          stroke="var(--ali-gold)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Travelling AI pulses — start automatically once curves are drawn */}
        <circle r="5" fill="var(--ali-gold)" filter="url(#bb-pulse-glow)">
          <animateMotion
            dur="3.4s"
            repeatCount="indefinite"
            begin="2.5s"
            path="M 600 300 Q 770 360 970 300"
          />
        </circle>
        <circle r="5" fill="var(--ali-gold)" filter="url(#bb-pulse-glow)">
          <animateMotion
            dur="3.4s"
            repeatCount="indefinite"
            begin="3.2s"
            path="M 600 300 Q 430 360 230 300"
          />
        </circle>
        <circle r="4" fill="var(--ali-gold)" filter="url(#bb-pulse-glow)" opacity="0.7">
          <animateMotion
            dur="5s"
            repeatCount="indefinite"
            begin="4s"
            path="M 230 300 Q 600 130 970 300"
          />
        </circle>
      </svg>

      {/* Text overlay — 5 phases, stacked at the same screen position so each
          phase replaces the previous one with a blur-up reveal */}
      <div className="ali-bb-text-stack">
        <div ref={phase1Ref} className="ali-bb-phase">
          <p className="ali-bb-lead">Most organizations have</p>
          <h2 className="ali-bb-heading">Strategy teams</h2>
        </div>
        <div ref={phase2Ref} className="ali-bb-phase">
          <p className="ali-bb-lead">and</p>
          <h2 className="ali-bb-heading">delivery units.</h2>
          <p className="ali-bb-lead ali-bb-lead--italic">
            No one owns what's in between.
          </p>
        </div>
        <div ref={phase3Ref} className="ali-bb-phase">
          <p className="ali-bb-lead">We are here to bridge the strategy to</p>
          <h2 className="ali-bb-heading">Execution gap</h2>
        </div>
        <div ref={phase4Ref} className="ali-bb-phase">
          <p className="ali-bb-lead">with the help of</p>
          <h2 className="ali-bb-heading">Artificial Intelligence</h2>
        </div>
        <div ref={phase5Ref} className="ali-bb-phase">
          <p className="ali-bb-final">
            to make that space <em>sharper</em>.
          </p>
        </div>
      </div>
    </section>
  )
}
