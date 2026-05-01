'use client'

import { useEffect, useRef } from 'react'

export default function CoinSpecimen() {
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
      renderer.toneMappingExposure = 1.08

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

      new GLTFLoader().load('/silver_coin.glb', gltf => {
        if (disposed) return

        const proto = gltf.scene
        const box = new THREE.Box3().setFromObject(proto)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxAxis = Math.max(size.x, size.y, size.z) || 1

        const poses = [
          { x: -1.75, y: 0, s: 1.65, rx: 0.03, ry: 0, rz: 0 },
          { x: 0.25, y: 0, s: 1.65, rx: 0.05, ry: 1.35, rz: 0 },
          { x: 2.05, y: 0, s: 1.42, rx: 0.98, ry: 0.18, rz: -0.56 },
        ]

        poses.forEach(pose => {
          const group = new THREE.Group()
          const model = proto.clone(true)
          model.position.sub(center)
          model.scale.setScalar(pose.s / maxAxis)
          group.position.set(pose.x, pose.y, 0)
          group.rotation.set(pose.rx, pose.ry, pose.rz)
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
          group.rotation.y += 0.006 + index * 0.001
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

  return <canvas className="specimen-canvas" ref={canvasRef} aria-label="Silver coin GLB reference" />
}
