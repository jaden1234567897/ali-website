'use client'

// Three coin panels stacked vertically — replacement for the current
// AliBridge pinned-scroll triangle. Each panel mirrors the screenshot Ali
// approved: text + bullet list on the left, big silver coin on the right.
//
// Coins are individual small Three.js scenes (one per panel) so they live
// in their own column and never compete with the text for layout space.
// Idle wobble keeps them feeling alive; no scroll-driven choreography —
// the section is intentionally calm so attention stays on the bullets.

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

type Panel = {
  id: string
  title: string
  bullets: string[]
  coinLabel: string
}

const PANELS: Panel[] = [
  {
    id: 'strategy',
    title: 'Why strategy fails:',
    bullets: [
      'fragmented ownership',
      'unclear accountabilities',
      'unclear decision rights',
      'governance that controls instead of enables',
      'annual planning that becomes a compliance exercise',
      'systems that depend on individuals instead of institutions',
    ],
    coinLabel: 'STRATEGY',
  },
  {
    id: 'execution',
    // TODO — Ali will provide real bullets for Execution
    title: 'Why execution stalls:',
    bullets: [
      'plans without owners',
      'reviews that revisit instead of decide',
      'capacity never matched to commitments',
      'priorities that drift between quarters',
      'progress measured in activity, not outcomes',
      'handovers between strategy and delivery that go cold',
    ],
    coinLabel: 'EXECUTION',
  },
  {
    id: 'ai',
    // TODO — Ali will provide real bullets for AI
    title: 'Where AI sharpens the work:',
    bullets: [
      'prompts that survive board scrutiny',
      'frameworks (OGSM, SWOT) you can run weekly',
      'evidence stronger, faster — fewer blind spots',
      'planning tools that compress reporting cycles',
      'diagnostics that name the breakage between intent and delivery',
      'reviews that ask sharper questions, not bigger packs',
    ],
    coinLabel: 'AI',
  },
]

export default function AliCoinTrio() {
  return (
    <section id="bridge" className="ali-trio" aria-label="Strategy, Execution and AI">
      {PANELS.map(panel => (
        <CoinPanel key={panel.id} panel={panel} />
      ))}
    </section>
  )
}

function CoinPanel({ panel }: { panel: Panel }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20%' })

  return (
    <div ref={ref} className="ali-trio-panel">
      <motion.div
        className="ali-trio-text"
        initial={{ opacity: 0, y: 28 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="ali-trio-title">{panel.title}</h3>
        <ul className="ali-trio-bullets">
          {panel.bullets.map((bullet, i) => (
            <motion.li
              key={bullet}
              initial={{ opacity: 0, x: -18 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="ali-trio-dot" aria-hidden />
              {bullet}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div className="ali-trio-coin-slot">
        <SingleCoin label={panel.coinLabel} active={isInView} />
      </div>
    </div>
  )
}

// ── Single 3D coin (one per panel) ───────────────────────────────
function SingleCoin({ label, active }: { label: string; active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active

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
      if (disposed || !canvasRef.current || !containerRef.current) return

      const container = containerRef.current
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
      camera.position.set(0, 0, 4.6)
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

      // Same lighting recipe as the hero coins so all silver coins on the
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
      let entryT = 0

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

        // Label
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
        if (!activeRef.current) return
        const t = clock.elapsedTime
        const delta = clock.getDelta()
        entryT += (1 - entryT) * Math.min(1, delta * 2.6)
        outer.scale.setScalar(entryT)
        outer.rotation.y = Math.sin(t * 0.45) * 0.22
        outer.rotation.x = Math.sin(t * 0.35) * 0.08
        renderer.render(scene, camera)
      }
      render()

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

  return (
    <div ref={containerRef} className="ali-trio-coin" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  )
}
