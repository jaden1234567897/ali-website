'use client'

import { useEffect, useRef } from 'react'

const coins = [
  { label: 'Artificial Intelligence', file: '/engraved-coins/coin-governance.glb', x: -2.05 },
  { label: 'Execution', file: '/engraved-coins/coin-execution.glb', x: 0 },
  { label: 'Strategy', file: '/engraved-coins/coin-strategy.glb', x: 2.05 },
]

export default function EngravedCoinPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.set(0, 0, 6.2)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.12

      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()

      scene.add(new THREE.AmbientLight(0xe8f0f8, 0.72))

      const key = new THREE.DirectionalLight(0xffffff, 5.4)
      key.position.set(4, 5, 6)
      scene.add(key)

      const rim = new THREE.PointLight(0x8bbcff, 6, 24)
      rim.position.set(-4, -2, 4)
      scene.add(rim)

      const warm = new THREE.PointLight(0xf1d28d, 2.8, 18)
      warm.position.set(5, 3, 3)
      scene.add(warm)

      const groups: import('three').Group[] = []

      coins.forEach(coin => {
        new GLTFLoader().load(coin.file, gltf => {
          if (disposed) return

          const group = new THREE.Group()
          const model = gltf.scene
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxAxis = Math.max(size.x, size.y, size.z) || 1

          model.position.sub(center)
          model.scale.setScalar(1.42 / maxAxis)
          group.position.set(coin.x, 0, 0)
          group.add(model)
          scene.add(group)
          groups.push(group)
        })
      })

      const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      const render = () => {
        frame = requestAnimationFrame(render)
        groups.forEach((group, index) => {
          group.rotation.y += 0.005 + index * 0.0007
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

  return <canvas className="specimen-canvas" ref={canvasRef} aria-label="Engraved coin GLB preview" />
}
