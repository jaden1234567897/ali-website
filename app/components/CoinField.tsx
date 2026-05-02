'use client'

import { useEffect, useRef } from 'react'

type Pose = {
  x: number
  y: number
  z: number
  s: number
  rx: number
  ry: number
  rz: number
}

const initialPoses: Pose[] = [
  { x: 0, y: 0.265, z: -0.55, s: 1.2, rx: 0.03, ry: 0, rz: 0.02 },
  { x: -0.14, y: -0.08, z: -0.18, s: 1.38, rx: 0.03, ry: -0.08, rz: -0.03 },
  { x: 0.14, y: -0.08, z: -0.28, s: 1.36, rx: 0.03, ry: 0.08, rz: 0.03 },
]

const butterflyPoses: Pose[] = [
  { x: 0, y: 0.015, z: -0.42, s: 1.42, rx: Math.PI / 2, ry: 0.04, rz: Math.PI / 3 },
  { x: 0, y: 0, z: -0.34, s: 1.5, rx: Math.PI / 2, ry: 0, rz: 0 },
  { x: 0, y: -0.015, z: -0.38, s: 1.42, rx: Math.PI / 2, ry: -0.04, rz: -Math.PI / 3 },
]

const bridgePoses: Pose[] = [
  { x: 0, y: 0.32, z: -0.44, s: 0.72, rx: Math.PI / 2, ry: 0.03, rz: 0 },
  { x: -0.19, y: -0.19, z: -0.34, s: 0.7, rx: Math.PI / 2, ry: -0.08, rz: 1.08 },
  { x: 0.19, y: -0.19, z: -0.36, s: 0.7, rx: Math.PI / 2, ry: 0.08, rz: -1.08 },
]

const engravedCoinFiles = [
  '/engraved-coins/coin-strategy.glb',
  '/engraved-coins/coin-governance.glb',
  '/engraved-coins/coin-execution.glb',
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

function routeX(progress: number, mobile: boolean) {
  const left = mobile ? -0.012 : -0.19
  const right = mobile ? 0.012 : 0.19

  if (progress < 0.34) return mix(0, left, smoothstep(0, 0.34, progress))
  if (progress < 0.72) return mix(left, right, smoothstep(0.34, 0.72, progress))
  return mix(right, 0, smoothstep(0.72, 1, progress))
}

function routeY(progress: number, mobile: boolean) {
  const leftDrop = mobile ? 0.004 : 0.026
  const rightLift = mobile ? -0.005 : -0.026
  const centerDrop = mobile ? 0.002 : 0.01

  if (progress < 0.34) return mix(0, leftDrop, smoothstep(0, 0.34, progress))
  if (progress < 0.72) return mix(leftDrop, rightLift, smoothstep(0.34, 0.72, progress))
  return mix(rightLift, centerDrop, smoothstep(0.72, 1, progress))
}

function bridgeTilt(progress: number) {
  const leftTilt = -0.06
  const rightTilt = 0.06

  if (progress < 0.34) return mix(0, leftTilt, smoothstep(0, 0.34, progress))
  if (progress < 0.72) return mix(leftTilt, rightTilt, smoothstep(0.34, 0.72, progress))
  return mix(rightTilt, 0, smoothstep(0.72, 1, progress))
}

function coinSpin(progress: number) {
  return smoothstep(0.34, 1, progress) * Math.PI * 2.2
}

export default function CoinField() {
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
      const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 80)
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

      const groups: { outer: import('three').Group; inner: import('three').Group }[] = []
      const targetProgress = { current: 0 }
      const easedProgress = { current: 0 }
      const targetBridgeProgress = { current: 0 }
      const easedBridgeProgress = { current: 0 }
      const bridgeVisible = { current: false }

      const updateScrollProgress = () => {
        const stage = document.querySelector<HTMLElement>('.hero-scroll-stage')
        const scrollable = stage ? Math.max(1, stage.offsetHeight - window.innerHeight) : Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        const rawProgress = stage ? -stage.getBoundingClientRect().top / scrollable : window.scrollY / scrollable
        const bridge = document.querySelector<HTMLElement>('.coin-motion-section')
        const bridgeRect = bridge?.getBoundingClientRect()
        const bridgeHeight = bridge ? Math.max(1, bridge.offsetHeight) : 1
        const progress = clamp(rawProgress)

        targetProgress.current = progress
        targetBridgeProgress.current = bridge && bridgeRect ? clamp((window.innerHeight - bridgeRect.top) / bridgeHeight) : 0
        bridgeVisible.current = !!bridgeRect && bridgeRect.top < window.innerHeight && bridgeRect.bottom > 0

        if (canvasRef.current) {
          canvasRef.current.style.opacity = '0.72'
        }
      }

      const loader = new GLTFLoader()
      engravedCoinFiles.forEach((file, index) => {
        loader.load(file, gltf => {
          if (disposed) return

          const outer = new THREE.Group()
          const inner = new THREE.Group()
          const model = gltf.scene
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxAxis = Math.max(size.x, size.y, size.z) || 1

          model.position.sub(center)
          model.scale.setScalar(1.42 / maxAxis)
          inner.add(model)
          outer.add(inner)
          rig.add(outer)
          groups[index] = { outer, inner }
        })
      })

      const clock = new THREE.Clock()
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        updateScrollProgress()
      }

      const viewportAtZ = (z: number) => {
        const zDistance = Math.max(1, camera.position.z - z)
        const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * zDistance
        return { height, width: height * camera.aspect }
      }

      const render = () => {
        frame = requestAnimationFrame(render)
        const delta = clock.getDelta()
        const time = clock.elapsedTime
        const mobile = window.innerWidth < 760
        const tablet = window.innerWidth >= 760 && window.innerWidth < 1120

        const follow = reduced ? 1 : 1 - Math.exp(-delta * 7.5)
        easedProgress.current += (targetProgress.current - easedProgress.current) * follow
        easedBridgeProgress.current += (targetBridgeProgress.current - easedBridgeProgress.current) * follow

        const scroll = easedProgress.current
        const bridge = easedBridgeProgress.current
        const preBridge = smoothstep(0.76, 0.98, scroll)
        const motion = Math.max(preBridge * 0.34, bridge)
        const inBridge = motion > 0.001 || bridgeVisible.current
        const close = smoothstep(0.02, 0.58, scroll)
        const detach = smoothstep(0, 0.34, motion)
        const roll = reduced ? 0 : smoothstep(0.58, 1, scroll)
        const copyHide = smoothstep(0.16, 0.48, scroll)

        document.documentElement.style.setProperty('--hero-copy-hide', copyHide.toFixed(4))

        if (inBridge) {
          const viewport = viewportAtZ(-0.38)
          const xRoute = routeX(motion, mobile)
          const yRoute = routeY(motion, mobile)
          const tilt = reduced ? 0 : bridgeTilt(motion)
          const transition = smoothstep(0, 0.2, motion)
          const heroRx = reduced ? 0 : Math.sin(roll * Math.PI) * 0.1
          const heroRy = reduced ? 0 : Math.sin(roll * Math.PI * 1.1) * 0.16
          const heroRz = roll * Math.PI * 2
          const sculptureRoll = reduced ? 0 : Math.sin(coinSpin(motion)) * 0.26
          const sculpturePitch = reduced ? 0 : Math.cos(coinSpin(motion) * 0.8) * 0.08
          const bridgeRx = sculpturePitch
          const bridgeRy = sculptureRoll

          rig.position.set(xRoute * viewport.width, yRoute * viewport.height, -0.02)
          rig.rotation.set(
            mix(heroRx, bridgeRx, transition),
            mix(heroRy, bridgeRy, transition),
            mix(heroRz, tilt, transition),
          )
        } else {
          rig.position.set(0, 0, -0.02)
          rig.rotation.set(
            reduced ? 0 : Math.sin(roll * Math.PI) * 0.1,
            reduced ? 0 : Math.sin(roll * Math.PI * 1.1) * 0.16,
            roll * Math.PI * 2,
          )
        }

        groups.forEach(({ outer, inner }, index) => {
          const heroStart = initialPoses[index]
          const heroEnd = butterflyPoses[index]
          const bridgeEnd = bridgePoses[index]
          const start = inBridge ? heroEnd : heroStart
          const end = inBridge ? bridgeEnd : heroEnd
          const shapeProgress = inBridge ? detach : close
          const z = mix(start.z, end.z, shapeProgress)
          const viewport = viewportAtZ(z)
          const mobileSpread = mobile ? 0.78 : tablet ? 0.88 : 1
          const mobileLift = mobile ? -0.08 : 0
          const bridgeSpread = mobile ? 0.5 : tablet ? 0.68 : 0.72
          const responsiveScale = mobile ? 0.56 : tablet ? 0.78 : 1
          const bridgeScale = mobile ? 0.5 : tablet ? 0.64 : 0.68
          const breath = reduced || inBridge ? 0 : Math.sin(time * 0.32 + index * 1.6) * 0.012 * (1 - close)
          const drift = reduced || inBridge ? 0 : Math.cos(time * 0.2 + index * 1.1) * 0.012 * (1 - close)
          const butterflyFlutter = reduced || inBridge ? 0 : Math.sin(time * 0.95 + index * 0.7) * 0.022 * roll
          const spin = coinSpin(motion)
          const travelStarted = smoothstep(0.34, 1, motion)
          const scrollSpin = reduced || !inBridge ? 0 : Math.sin(spin + index * 0.45) * 0.055 * travelStarted
          const rimRoll = reduced || !inBridge ? 0 : Math.cos(spin + index * 0.35) * 0.035 * travelStarted
          const spread = inBridge ? bridgeSpread : mobileSpread
          const lift = inBridge ? 0 : mobileLift

          outer.position.set(
            mix(start.x, end.x, shapeProgress) * viewport.width * spread + drift,
            mix(start.y + lift, end.y, shapeProgress) * viewport.height * spread + breath,
            z,
          )

          const finalScaleBoost = mobile ? 0.74 : tablet ? 0.9 : 1
          const scale = mix(start.s, inBridge ? end.s : end.s * finalScaleBoost, shapeProgress)
          outer.scale.setScalar(scale * (inBridge ? bridgeScale : responsiveScale))
          outer.rotation.set(
            0,
            0,
            mix(start.rz, end.rz, shapeProgress),
          )
          inner.rotation.set(
            mix(start.rx, end.rx, shapeProgress) + butterflyFlutter,
            mix(start.ry, end.ry, shapeProgress) + scrollSpin,
            rimRoll,
          )
        })

        renderer.render(scene, camera)
      }

      updateScrollProgress()
      window.addEventListener('scroll', updateScrollProgress, { passive: true })
      window.addEventListener('resize', resize)
      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('scroll', updateScrollProgress)
        window.removeEventListener('resize', resize)

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

  // Foreground / background toggle - watch [data-coins="front"] sections.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const frontSections = document.querySelectorAll('[data-coins="front"]')
    if (!frontSections.length) return

    const observer = new IntersectionObserver(
      entries => {
        const anyFront = entries.some(e => e.isIntersecting)
        canvas.style.zIndex = anyFront ? '4' : '1'
      },
      { threshold: 0.01 },
    )

    frontSections.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return <canvas ref={canvasRef} className="coin-field" aria-hidden="true" />
}
