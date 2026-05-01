'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type CoinName = 'top' | 'left' | 'right'

type Pose = {
  x: number
  y: number
  z: number
  scale: number
  rx: number
  ry: number
  rz: number
}

const coinNames: CoinName[] = ['top', 'left', 'right']

const crossPoses: Record<CoinName, Pose> = {
  top: { x: 0, y: 0.02, z: -0.34, scale: 1.05, rx: 90, ry: 0, rz: 0 },
  left: { x: 0, y: 0.03, z: -0.35, scale: 1.0, rx: 90, ry: -6, rz: 62 },
  right: { x: 0, y: -0.03, z: -0.36, scale: 1.0, rx: 90, ry: 6, rz: -62 },
}

const defaultVPoses: Record<CoinName, Pose> = {
  top: { x: 0, y: 0.82, z: -0.42, scale: 0.78, rx: 88, ry: 2, rz: 0 },
  left: { x: -0.56, y: -0.4, z: -0.34, scale: 0.74, rx: 88, ry: -7, rz: 64 },
  right: { x: 0.56, y: -0.4, z: -0.36, scale: 0.74, rx: 88, ry: 7, rz: -64 },
}

const progressFrames = [
  { label: 'Hero Cross', value: 0 },
  { label: 'Left V', value: 34 },
  { label: 'Right V', value: 72 },
  { label: 'Center V', value: 100 },
]

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

function mix(a: number, b: number, progress: number) {
  return a + (b - a) * progress
}

function mixPose(a: Pose, b: Pose, progress: number): Pose {
  return {
    x: mix(a.x, b.x, progress),
    y: mix(a.y, b.y, progress),
    z: mix(a.z, b.z, progress),
    scale: mix(a.scale, b.scale, progress),
    rx: mix(a.rx, b.rx, progress),
    ry: mix(a.ry, b.ry, progress),
    rz: mix(a.rz, b.rz, progress),
  }
}

function route(progress: number) {
  const left = { x: -1.55, y: 0.2 }
  const right = { x: 1.55, y: -0.2 }
  const center = { x: 0, y: 0.05 }

  if (progress < 34) {
    const t = smoothstep(0, 34, progress)
    return { x: mix(0, left.x, t), y: mix(0, left.y, t), formed: t }
  }

  if (progress < 72) {
    const t = smoothstep(34, 72, progress)
    return { x: mix(left.x, right.x, t), y: mix(left.y, right.y, t), formed: 1 }
  }

  const t = smoothstep(72, 100, progress)
  return { x: mix(right.x, center.x, t), y: mix(right.y, center.y, t), formed: 1 }
}

function activeWord(progress: number) {
  if (progress >= 30 && progress < 46) return 'Governance'
  if (progress >= 66 && progress < 82) return 'Execution'
  if (progress >= 90) return 'Strategy'
  return ''
}

function wordAlpha(progress: number) {
  if (progress >= 30 && progress < 46) {
    return progress < 38 ? smoothstep(30, 38, progress) : 1 - smoothstep(38, 46, progress)
  }
  if (progress >= 66 && progress < 82) {
    return progress < 74 ? smoothstep(66, 74, progress) : 1 - smoothstep(74, 82, progress)
  }
  if (progress >= 90) return smoothstep(90, 98, progress)
  return 0
}

export default function MotionLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(34)
  const posesRef = useRef(defaultVPoses)
  const [progress, setProgress] = useState(34)
  const [selected, setSelected] = useState<CoinName>('top')
  const [poses, setPoses] = useState(defaultVPoses)

  progressRef.current = progress
  posesRef.current = poses

  const selectedPose = poses[selected]
  const exported = useMemo(() => JSON.stringify(poses, null, 2), [poses])

  const updatePose = (field: keyof Pose, value: number) => {
    setPoses(current => ({
      ...current,
      [selected]: {
        ...current[selected],
        [field]: value,
      },
    }))
  }

  useEffect(() => {
    let disposed = false
    let frame = 0
    let cleanup = () => {}

    async function boot() {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')

      if (disposed || !canvasRef.current) return

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.set(0, 0, 6.2)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08

      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()

      scene.add(new THREE.AmbientLight(0xe8f0f8, 0.62))

      const key = new THREE.DirectionalLight(0xffffff, 5.4)
      key.position.set(4, 5, 6)
      scene.add(key)

      const rim = new THREE.PointLight(0x8bbcff, 6, 24)
      rim.position.set(-4, -2, 4)
      scene.add(rim)

      const warm = new THREE.PointLight(0xf1d28d, 2.8, 18)
      warm.position.set(5, 3, 3)
      scene.add(warm)

      const rig = new THREE.Group()
      scene.add(rig)

      const groups = new Map<CoinName, { outer: import('three').Group; inner: import('three').Group }>()

      new GLTFLoader().load('/silver_coin.glb', gltf => {
        if (disposed) return

        const proto = gltf.scene
        const box = new THREE.Box3().setFromObject(proto)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxAxis = Math.max(size.x, size.y, size.z) || 1

        coinNames.forEach(name => {
          const outer = new THREE.Group()
          const inner = new THREE.Group()
          const model = proto.clone(true)
          model.position.sub(center)
          model.scale.setScalar(1.42 / maxAxis)
          inner.add(model)
          outer.add(inner)
          rig.add(outer)
          groups.set(name, { outer, inner })
        })
      })

      const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      const render = () => {
        frame = requestAnimationFrame(render)
        const progressValue = progressRef.current
        const currentRoute = route(progressValue)
        const forming = smoothstep(0, 34, progressValue)
        const roll = smoothstep(34, 100, progressValue) * Math.PI * 2.2

        rig.position.set(currentRoute.x, currentRoute.y, -0.02)
        rig.rotation.set(
          Math.cos(roll * 0.7) * 0.08 * currentRoute.formed,
          Math.sin(roll) * 0.28 * currentRoute.formed,
          Math.sin(roll * 0.45) * 0.08 * currentRoute.formed,
        )

        coinNames.forEach(name => {
          const group = groups.get(name)
          if (!group) return

          const pose = mixPose(crossPoses[name], posesRef.current[name], forming)
          group.outer.position.set(pose.x, pose.y, pose.z)
          group.outer.scale.setScalar(pose.scale)
          group.outer.rotation.set(0, 0, THREE.MathUtils.degToRad(pose.rz))
          group.inner.rotation.set(
            THREE.MathUtils.degToRad(pose.rx),
            THREE.MathUtils.degToRad(pose.ry),
            0,
          )
        })

        renderer.render(scene, camera)
      }

      window.addEventListener('resize', resize)
      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', resize)
        scene.traverse(obj => {
          const mesh = obj as import('three').Mesh
          if (!mesh.isMesh) return
          mesh.geometry?.dispose()
        })
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
    <main className="motion-lab">
      <canvas ref={canvasRef} className="motion-lab-canvas" aria-label="Three coin motion lab" />

      <div className="motion-lab-word" style={{ opacity: wordAlpha(progress) }}>
        {activeWord(progress)}
      </div>

      <section className="motion-lab-panel" aria-label="Motion lab controls">
        <div>
          <span>Motion Lab</span>
          <h1>Approve the V shape</h1>
          <p>Exact silver coin asset. No material or color override.</p>
        </div>

        <label className="motion-lab-control motion-lab-progress">
          <span>Scroll progress</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={progress}
            onChange={event => setProgress(Number(event.target.value))}
          />
          <b>{progress}%</b>
        </label>

        <div className="motion-lab-buttons">
          {progressFrames.map(frameItem => (
            <button key={frameItem.label} type="button" onClick={() => setProgress(frameItem.value)}>
              {frameItem.label}
            </button>
          ))}
        </div>

        <div className="motion-lab-tabs">
          {coinNames.map(name => (
            <button
              key={name}
              type="button"
              aria-pressed={selected === name}
              onClick={() => setSelected(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="motion-lab-grid">
          {(
            [
              ['x', -1.2, 1.2, 0.01],
              ['y', -1.2, 1.2, 0.01],
              ['scale', 0.3, 1.4, 0.01],
              ['rx', 0, 120, 1],
              ['ry', -45, 45, 1],
              ['rz', -90, 90, 1],
            ] as const
          ).map(([field, min, max, step]) => (
            <label key={field} className="motion-lab-control">
              <span>{field}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={selectedPose[field]}
                onChange={event => updatePose(field, Number(event.target.value))}
              />
              <b>{selectedPose[field].toFixed(field === 'scale' ? 2 : 0)}</b>
            </label>
          ))}
        </div>

        <textarea readOnly value={exported} aria-label="Approved V pose values" />
      </section>
    </main>
  )
}
