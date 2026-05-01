'use client'

import { useEffect, useRef } from 'react'

export default function ExecutionEngravingTest() {
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
      const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.set(0, 0, 5.2)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.18

      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()

      scene.add(new THREE.AmbientLight(0xffffff, 0.62))

      const key = new THREE.DirectionalLight(0xffffff, 5.2)
      key.position.set(3.5, 3.2, 5)
      scene.add(key)

      const fill = new THREE.DirectionalLight(0x9dbbe8, 2.8)
      fill.position.set(-4, -1.5, 4)
      scene.add(fill)

      const rim = new THREE.PointLight(0xffffff, 4, 12)
      rim.position.set(0, 0, 3)
      scene.add(rim)

      let model: import('three').Object3D | null = null
      const clock = new THREE.Clock()
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      new GLTFLoader().load('/engraved-coins-test/coin-execution-test.glb', gltf => {
        if (disposed) return

        model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxAxis = Math.max(size.x, size.y, size.z) || 1

        model.position.sub(center)
        model.scale.setScalar(1.92 / maxAxis)
        model.rotation.set(0, 0, 0)
        scene.add(model)
        renderer.render(scene, camera)
      })

      const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.render(scene, camera)
      }

      window.addEventListener('resize', resize)

      const render = () => {
        frame = requestAnimationFrame(render)
        if (model && !reducedMotion) {
          const elapsed = clock.getElapsedTime()
          model.rotation.y = elapsed * 0.42
          model.rotation.x = Math.sin(elapsed * 0.38) * 0.12
          model.rotation.z = Math.sin(elapsed * 0.22) * 0.035
        }
        renderer.render(scene, camera)
      }

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

  return <canvas className="engraving-test-canvas" ref={canvasRef} aria-label="Execution engraved coin test preview" />
}
