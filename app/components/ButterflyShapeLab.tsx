'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type CoinName = 'strategy' | 'governance' | 'execution'

type Pose = {
  x: number
  y: number
  z: number
  s: number
  rx: number
  ry: number
  rz: number
}

const coinNames: CoinName[] = ['strategy', 'governance', 'execution']

const labels: Record<CoinName, string> = {
  strategy: 'STRATEGY',
  governance: 'ARTIFICIAL INTELLIGENCE',
  execution: 'EXECUTION',
}

const defaultPoses: Record<CoinName, Pose> = {
  strategy: { x: 0, y: 0.015, z: -0.38, s: 1.5, rx: Math.PI / 2, ry: 0.04, rz: Math.PI / 3 },
  governance: { x: 0, y: 0, z: -0.34, s: 1.5, rx: Math.PI / 2, ry: 0, rz: 0 },
  execution: { x: 0, y: -0.015, z: -0.38, s: 1.5, rx: Math.PI / 2, ry: -0.04, rz: -Math.PI / 3 },
}

const fields = [
  { key: 'x', min: -1.2, max: 1.2, step: 0.01 },
  { key: 'y', min: -1.2, max: 1.2, step: 0.01 },
  { key: 'z', min: -1.2, max: 0.4, step: 0.01 },
  { key: 's', min: 0.3, max: 2.4, step: 0.01 },
  { key: 'rx', min: 0, max: 3.2, step: 0.01 },
  { key: 'ry', min: -1.4, max: 1.4, step: 0.01 },
  { key: 'rz', min: -2.2, max: 2.2, step: 0.01 },
] as const

function round(value: number) {
  return Number(value.toFixed(4))
}

function formatCoinFieldArray(poses: Record<CoinName, Pose>) {
  return JSON.stringify(
    coinNames.map(name => ({
      x: round(poses[name].x),
      y: round(poses[name].y),
      z: round(poses[name].z),
      s: round(poses[name].s),
      rx: round(poses[name].rx),
      ry: round(poses[name].ry),
      rz: round(poses[name].rz),
    })),
    null,
    2,
  )
}

export default function ButterflyShapeLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const posesRef = useRef(defaultPoses)
  const [poses, setPoses] = useState(defaultPoses)
  const [selected, setSelected] = useState<CoinName>('strategy')

  useEffect(() => {
    posesRef.current = poses
  }, [poses])

  const selectedPose = poses[selected]
  const output = useMemo(() => formatCoinFieldArray(poses), [poses])

  const updatePose = (field: keyof Pose, value: number) => {
    setPoses(current => ({
      ...current,
      [selected]: {
        ...current[selected],
        [field]: value,
      },
    }))
  }

  const reset = () => setPoses(defaultPoses)

  useEffect(() => {
    let disposed = false
    let frame = 0
    let cleanup = () => {}

    async function boot() {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')

      if (disposed || !canvasRef.current) return

      const canvas = canvasRef.current
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 80)
      camera.position.set(0, 0, 7)

      const renderer = new THREE.WebGLRenderer({
        canvas,
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

      const groups = new Map<CoinName, { outer: import('three').Group; inner: import('three').Group }>()
      const pointerTarget = { x: 0, y: 0, active: 0 }
      const pointer = { x: 0, y: 0, active: 0 }

      const createLabelTexture = (label: string) => {
        const longLabel = label.length > 12
        const labelCanvas = document.createElement('canvas')
        labelCanvas.width = 1024
        labelCanvas.height = 256
        const context = labelCanvas.getContext('2d')

        if (context) {
          const fontSize = 125
          const maxTextWidth = labelCanvas.width - (longLabel ? 84 : 0)
          context.clearRect(0, 0, labelCanvas.width, labelCanvas.height)
          context.fillStyle = '#202328'
          context.font = `700 ${fontSize}px Arial, sans-serif`
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.save()
          context.translate(labelCanvas.width / 2, labelCanvas.height / 2 + 4)
          context.scale(Math.min(1, maxTextWidth / context.measureText(label).width), 1)
          context.fillText(label, 0, 0)
          context.restore()
        }

        const texture = new THREE.CanvasTexture(labelCanvas)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 8
        texture.needsUpdate = true
        return texture
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

        coinNames.forEach(name => {
          const outer = new THREE.Group()
          const inner = new THREE.Group()
          const model = proto.clone(true)
          const label = new THREE.Mesh(
            new THREE.PlaneGeometry(0.92, 0.22),
            new THREE.MeshBasicMaterial({
              map: createLabelTexture(labels[name]),
              transparent: true,
              depthWrite: false,
              side: THREE.DoubleSide,
            }),
          )

          model.position.sub(center)
          const normalizedScale = 1.42 / maxAxis
          model.scale.set(normalizedScale, normalizedScale, normalizedScale * coinDepth)
          label.position.z = faceZ
          inner.add(model)
          inner.add(label)
          outer.add(inner)
          rig.add(outer)
          groups.set(name, { outer, inner })
        })
      })

      const updatePointer = (event: PointerEvent) => {
        pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2
        pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2
        pointerTarget.active = 1
      }

      const releasePointer = () => {
        pointerTarget.x = 0
        pointerTarget.y = 0
        pointerTarget.active = 0
      }

      const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      const clock = new THREE.Clock()

      const render = () => {
        frame = requestAnimationFrame(render)
        const delta = clock.getDelta()
        const follow = 1 - Math.exp(-delta * 5.2)
        pointer.x += (pointerTarget.x - pointer.x) * follow
        pointer.y += (pointerTarget.y - pointer.y) * follow
        pointer.active += (pointerTarget.active - pointer.active) * follow

        rig.position.set(0, 0, -0.02)
        rig.rotation.set(
          -pointer.y * 0.055 * pointer.active,
          pointer.x * 0.075 * pointer.active,
          0,
        )

        coinNames.forEach((name, index) => {
          const group = groups.get(name)
          if (!group) return

          const pose = posesRef.current[name]
          const hoverScale = 1 + pointer.active * 0.018
          const hoverX = pointer.x * 0.05 * pointer.active * (index === 0 ? 0.72 : 1)
          const hoverY = -pointer.y * 0.04 * pointer.active * (index === 0 ? 0.72 : 1)

          group.outer.position.set(pose.x + hoverX, pose.y + hoverY, pose.z)
          group.outer.scale.setScalar(pose.s * hoverScale)
          group.outer.rotation.set(0, 0, pose.rz)
          group.inner.rotation.set(pose.rx, pose.ry, 0)
        })

        renderer.render(scene, camera)
      }

      window.addEventListener('resize', resize)
      window.addEventListener('pointermove', updatePointer, { passive: true })
      window.addEventListener('pointerleave', releasePointer)
      window.addEventListener('blur', releasePointer)
      resize()
      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', updatePointer)
        window.removeEventListener('pointerleave', releasePointer)
        window.removeEventListener('blur', releasePointer)

        const geometries = new Set<import('three').BufferGeometry>()
        const materials = new Set<import('three').Material>()
        scene.traverse(obj => {
          const mesh = obj as import('three').Mesh
          if (!mesh.isMesh) return
          if (mesh.geometry) geometries.add(mesh.geometry)
          const material = mesh.material
          if (Array.isArray(material)) material.forEach(item => materials.add(item))
          else if (material) materials.add(material)
        })
        geometries.forEach(geometry => geometry.dispose())
        materials.forEach(material => material.dispose())
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
      <canvas ref={canvasRef} className="motion-lab-canvas" aria-label="Butterfly coin shape lab" />

      <section className="motion-lab-panel" aria-label="Butterfly shape controls">
        <div>
          <span>Butterfly Lab</span>
          <h1>Shape tuner</h1>
          <p>Move your cursor over the sculpture to preview hover. Adjust values, then send the output back.</p>
        </div>

        <div className="motion-lab-buttons">
          <button type="button" onClick={reset}>
            Reset
          </button>
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
          {fields.map(field => (
            <label key={field.key} className="motion-lab-control">
              <span>{field.key}</span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={selectedPose[field.key]}
                onChange={event => updatePose(field.key, Number(event.target.value))}
              />
              <b>{selectedPose[field.key].toFixed(2)}</b>
            </label>
          ))}
        </div>

        <textarea readOnly value={output} aria-label="CoinField butterfly pose values" />
      </section>
    </main>
  )
}
