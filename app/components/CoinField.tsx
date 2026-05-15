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

// Portrait mobile layout — Strategy ABOVE the hero title, then AI and
// Execution sit in the gap BETWEEN the title and the aside paragraph.
// y values calibrated so AI/Execution land at ~10–20 % below screen
// centre (the empty band between title and aside on a typical phone).
const initialPosesMobile: Pose[] = [
  // Strategy: top centre, sits directly above the word "Strategy" in
  // the hero title with a small gap — close but not overlapping.
  { x: 0, y: 0.24, z: -0.55, s: 1.05, rx: 0.03, ry: 0, rz: 0 },
  // AI: between title and aside, left
  { x: -0.18, y: -0.08, z: -0.20, s: 1.0, rx: 0.03, ry: -0.06, rz: 0 },
  // Execution: between title and aside, right
  { x: 0.18, y: -0.08, z: -0.25, s: 1.0, rx: 0.03, ry: 0.06, rz: 0 },
]

const butterflyPoses: Pose[] = [
  { x: 0, y: 0.015, z: -0.38, s: 1.5, rx: Math.PI / 2, ry: 0.04, rz: Math.PI / 3 },
  { x: 0, y: 0, z: -0.34, s: 1.5, rx: Math.PI / 2, ry: 0, rz: 0 },
  { x: 0, y: -0.015, z: -0.38, s: 1.5, rx: Math.PI / 2, ry: -0.04, rz: -Math.PI / 3 },
]

const coinLabels = ['STRATEGY', 'ARTIFICIAL INTELLIGENCE', 'EXECUTION']

declare global {
  interface Window {
    __aliNovaProgress?: number
  }
}

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

      const groups: { outer: import('three').Group; inner: import('three').Group; labelMaterial: import('three').MeshBasicMaterial }[] = []
      const targetProgress = { current: 0 }
      const easedProgress = { current: 0 }
      const targetCanvasOpacity = { current: 0.98 }
      const easedCanvasOpacity = { current: 0.98 }
      const pointerTarget = { x: 0, y: 0, active: 0 }
      const pointer = { x: 0, y: 0, active: 0 }

      const updateScrollProgress = () => {
        const stage = document.querySelector<HTMLElement>('.hero-scroll-stage')
        // Use the full stage height (not minus viewport) so hero progress reaches 1
        // exactly when the nova section's top hits the viewport — eliminating the
        // 100 vh frozen gap between the hero roll completing and the nova pin starting.
        const scrollable = stage ? Math.max(1, stage.offsetHeight) : Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        const stageRect = stage?.getBoundingClientRect()
        const rawProgress = stage && stageRect ? -stageRect.top / scrollable : window.scrollY / scrollable
        const progress = clamp(rawProgress)

        targetProgress.current = progress

        if (canvasRef.current) {
          const transition = document.querySelector<HTMLElement>('.ali-nova-transition')
          const transitionRect = transition?.getBoundingClientRect()
          const transitionVisible = !!transitionRect && transitionRect.top < window.innerHeight && transitionRect.bottom > 0
          const heroVisibility = stageRect ? smoothstep(0.08, 0.52, clamp(stageRect.bottom / window.innerHeight)) : 1
          targetCanvasOpacity.current = Math.max(0.92 * heroVisibility, transitionVisible ? 0.98 : 0)
        }
      }

      const createLabelTexture = (label: string) => {
        const longLabel = label.length > 12
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 256
        const context = canvas.getContext('2d')

        if (context) {
          const fontSize = 125
          // Reduced long-label padding so "ARTIFICIAL INTELLIGENCE" gets
          // more horizontal room — the canvas-scale compression is gentler,
          // so the text reads more stretched and clearer on the coin.
          const maxTextWidth = canvas.width - (longLabel ? 20 : 0)
          context.clearRect(0, 0, canvas.width, canvas.height)
          context.fillStyle = '#202328'
          context.font = `700 ${fontSize}px Arial, sans-serif`
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.save()
          context.translate(canvas.width / 2, canvas.height / 2 + 4)
          context.scale(Math.min(1, maxTextWidth / context.measureText(label).width), 1)
          context.fillText(label, 0, 0)
          context.restore()
        }

        const texture = new THREE.CanvasTexture(canvas)
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

        initialPoses.forEach((_, index) => {
          const outer = new THREE.Group()
          const inner = new THREE.Group()
          const model = proto.clone(true)
          const label = new THREE.Mesh(
            new THREE.PlaneGeometry(0.92, 0.22),
            new THREE.MeshBasicMaterial({
              map: createLabelTexture(coinLabels[index]),
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
          groups.push({ outer, inner, labelMaterial: label.material as import('three').MeshBasicMaterial })
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

      const updatePointer = (event: PointerEvent) => {
        if (window.innerWidth < 760) return

        pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2
        pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2
        pointerTarget.active = 1
      }

      const releasePointer = () => {
        pointerTarget.x = 0
        pointerTarget.y = 0
        pointerTarget.active = 0
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
        const pointerFollow = reduced ? 1 : 1 - Math.exp(-delta * 5.2)
        easedProgress.current += (targetProgress.current - easedProgress.current) * follow
        easedCanvasOpacity.current += (targetCanvasOpacity.current - easedCanvasOpacity.current) * follow
        pointer.x += (pointerTarget.x - pointer.x) * pointerFollow
        pointer.y += (pointerTarget.y - pointer.y) * pointerFollow
        pointer.active += (pointerTarget.active - pointer.active) * pointerFollow

        // Both sides of the hero→nova boundary read raw scroll-linked values
        // (no easing) so their rates are identical at the handoff. Easing on
        // either side caused a tiny visual jump: hero was decelerating toward
        // its asymptote (easedProgress ~0.99) while nova fired at full rate
        // (rawNova ≥ 0.001), creating a ~6° rig.z mismatch in one frame.
        const scroll = targetProgress.current
        const rawNova = clamp(window.__aliNovaProgress ?? 0)
        const nova = rawNova
        const novaActive = rawNova > 0.001
        // Roll uses LINEAR mapping over the full hero scroll — constant
        // rotation per scroll-unit, no easing curves that would feel like
        // pauses at start or end. close still uses smoothstep for a natural
        // gather, but the spin runs continuously alongside it. This puts the
        // hero pace at ≈864 px / turn (240 svh × 1080 px / 3 turns), which
        // matches nova reverse-roll's 880 px / turn within ~2 %.
        const close = smoothstep(0.02, 0.40, scroll)
        const roll = reduced ? 0 : scroll
        const copyHide = smoothstep(0.08, 0.32, scroll)
        const hoverStrength = reduced || mobile ? 0 : pointer.active
        // Nova phases — fade now ENDS exactly when motion ends, so Strategy
        // is rotating + zooming + fading at the same time (no static pause).
        // Phases are scaled to a 2900 px nova pin (see AliNovaTransition.tsx)
        // so the buffer after fade is only ~0.4 vh of empty scroll.
        //   0.00 → 0.56: reverse hero roll + Strategy pulls toward camera (1.5 vh)
        //   0.56 → 0.85: Strategy zooms to peak POV (~0.78 vh)
        //   0.41 → 0.85: label AND canvas fade together (1.21 vh) — overlaps
        //                end of reverse and ALL of expand, ends with motion
        //   0.85 → 1.00: ~0.4 vh buffer before pin releases, About visible
        const reverseRollPhase = clamp(nova / 0.56)
        const expandPhase = clamp((nova - 0.56) / 0.29)
        const timelineFade = smoothstep(0.41, 0.85, nova)
        const labelFade = 1 - smoothstep(0.41, 0.85, nova)
        const canvasFade = novaActive ? mix(1, 0, timelineFade) : 1

        if (canvasRef.current) {
          canvasRef.current.style.opacity = (easedCanvasOpacity.current * canvasFade).toFixed(3)
        }

        document.documentElement.style.setProperty('--hero-copy-hide', copyHide.toFixed(4))

        if (novaActive) {
          // ali-v3: hero shortened by 1 full roll (1.5 → 0.5 rolls), so
          // heroExitZ is now π not 3π. Nova continues from π → 4π → 4.7π.
          // Total page rolls down from ~3.35 to ~2.35.
          const heroExitZ = Math.PI * 1
          const continuedSpin = heroExitZ + reverseRollPhase * Math.PI * 3 + expandPhase * Math.PI * 0.7
          rig.position.set(0, 0, -0.02)
          rig.scale.setScalar(1)
          rig.rotation.set(0, 0, continuedSpin)
        } else {
          rig.position.set(0, 0, -0.02)
          rig.scale.setScalar(1)
          // ali-v3: 0.5 full turns over the hero scroll (was 1.5). The X/Y
          // sin-wobble curves still return cleanly to 0 at roll=1 so the
          // boundary into the nova rig stays jitter-free.
          rig.rotation.set(
            (reduced ? 0 : Math.sin(roll * Math.PI) * 0.1) - pointer.y * 0.055 * hoverStrength,
            (reduced ? 0 : Math.sin(roll * Math.PI) * 0.16) + pointer.x * 0.075 * hoverStrength,
            roll * Math.PI * 1,
          )
        }

        groups.forEach(({ outer, inner, labelMaterial }, index) => {
          const heroStart = mobile ? initialPosesMobile[index] : initialPoses[index]
          const heroEnd = butterflyPoses[index]
          const start = novaActive ? heroEnd : heroStart
          const end = heroEnd
          const shapeProgress = novaActive ? 1 : close
          let z = mix(start.z, end.z, shapeProgress)
          const viewport = viewportAtZ(z)
          // Mobile uses pre-calibrated initialPosesMobile so spread/lift
          // are 1 / 0 — no extra position scaling on top of the explicit
          // x,y values above.
          const mobileSpread = mobile ? 1 : tablet ? 0.88 : 1
          const mobileLift = 0
          const responsiveScale = mobile ? 0.5 : tablet ? 0.78 : 1
          const hoverScale = 1 + hoverStrength * 0.018
          const hoverX = pointer.x * viewport.width * 0.01 * hoverStrength * (index === 0 ? 0.72 : 1)
          const hoverY = -pointer.y * viewport.height * 0.008 * hoverStrength * (index === 0 ? 0.72 : 1)
          const breath = reduced ? 0 : Math.sin(time * 0.32 + index * 1.6) * 0.012 * (1 - close)
          const drift = reduced ? 0 : Math.cos(time * 0.2 + index * 1.1) * 0.012 * (1 - close)
          const butterflyFlutter = reduced ? 0 : Math.sin(time * 0.95 + index * 0.7) * 0.022 * roll

          let px = mix(start.x, end.x, shapeProgress) * viewport.width * mobileSpread + drift + hoverX
          let py = mix(start.y + mobileLift, end.y, shapeProgress) * viewport.height * mobileSpread + breath + hoverY
          let pz = z
          let scaleValue = mix(start.s, end.s * (mobile ? 0.95 : tablet ? 0.9 : 1), shapeProgress) * responsiveScale * hoverScale
          // Mobile: hold coin scale constant at 1.5 × responsiveScale = 0.75
          // throughout the entire hero phase. Without this, the mix from
          // initialPose.s (~1.0) to butterflyPose.s (1.5) made the star
          // formation grow as the user scrolled — visible as a size jump.
          if (mobile) {
            scaleValue = 1.5 * responsiveScale * hoverScale
          }
          let outerRz = mix(start.rz, end.rz, shapeProgress)
          let innerRx = mix(start.rx, end.rx, shapeProgress) + butterflyFlutter
          let innerRy = mix(start.ry, end.ry, shapeProgress)
          let innerRz = 0

          if (novaActive) {
            // Two-stage nova: star → triangle → expand.
            // The starting "star" pose is computed in the EXACT same coordinate
            // space the hero used at scroll=1 — viewport-scaled position +
            // butterflyFlutter on rx — so the visual at nova=0 matches the
            // hero's last frame pixel-for-pixel. No reset snap.
            const star = butterflyPoses[index]
            const starVp = viewportAtZ(star.z)
            const starWorldX = star.x * starVp.width * mobileSpread
            const starWorldY = star.y * starVp.height * mobileSpread

            // End-of-reverse pose. Strategy is already pulling forward into the
            // user's POV (z=1.4, scale 3.5 — about 2.3× its star size), while
            // AI and Execution hold the face-on triangle base behind it. The
            // expand phase then continues Strategy's zoom uninterrupted from
            // here, so the forward motion is one smooth arc from nova=0 → 0.80.
            const trianglePos = [
              // Strategy: lifting toward camera as it unrolls (POV begins here)
              { x: 0, y: 0.6, z: 1.4, s: 3.5, rx: 0, ry: 0, rz: 0, orz: 0 },
              // AI: bottom-left of triangle base
              { x: -1.30, y: -0.50, z: -0.18, s: 1.55, rx: 0.03, ry: -0.08, rz: -0.03, orz: -0.03 },
              // Execution: bottom-right of triangle base
              { x: 1.30, y: -0.50, z: -0.28, s: 1.55, rx: 0.03, ry: 0.08, rz: 0.03, orz: 0.03 },
            ][index]

            // Expand pose — Strategy peak at z=1.8, s=7 (≈1.1× viewport width).
            // Capped here so the largest size ever rendered is just barely
            // edge-to-edge — no extreme close-up where the metallic surface
            // pixelates. The fade then carries the rest of the disappearance,
            // synchronised with the label so the whole coin dissolves the
            // moment "STRATEGY" is gone.
            const expandPos = [
              { x: 0, y: 0, z: 1.8, s: 7, rx: 0, ry: 0, rz: 0, orz: 0 },
              // AI: pushed lower-left and shrunk; occluded by Strategy
              { x: -2.6, y: -1.6, z: -2.0, s: 0.6, rx: 0.08, ry: -0.1, rz: 0, orz: 0 },
              // Execution: pushed lower-right and shrunk
              { x: 2.6, y: -1.6, z: -2.2, s: 0.6, rx: 0.08, ry: 0.1, rz: 0, orz: 0 },
            ][index]

            const reverseRollT = reverseRollPhase
            const expandT = expandPhase

            // Stage 1: hero-end star (in scaled scene units) → triangle
            const midX = mix(starWorldX, trianglePos.x, reverseRollT)
            const midY = mix(starWorldY, trianglePos.y, reverseRollT)
            const midZ = mix(star.z, trianglePos.z, reverseRollT)
            const midS = mix(star.s, trianglePos.s, reverseRollT)
            const midRx = mix(star.rx, trianglePos.rx, reverseRollT)
            const midRy = mix(star.ry, trianglePos.ry, reverseRollT)
            const midRz = mix(0, trianglePos.rz, reverseRollT)
            const midOrz = mix(star.rz, trianglePos.orz, reverseRollT)

            // Stage 2: triangle → expand. butterflyFlutter AND the cursor
            // hover offsets (hoverX/Y, hoverScale) are carried from hero so
            // every transform component is identical at the boundary, then
            // they fade out together over the reverse-roll. Without the hover
            // carry-over, the cursor-driven offset (typically 1–5 % of viewport
            // for a cursor anywhere off-centre) and the 1.8 % hover-scale
            // would snap to zero in one frame at the handoff.
            const hoverFade = 1 - reverseRollT
            px = mix(midX, expandPos.x, expandT) + hoverX * hoverFade
            py = mix(midY, expandPos.y, expandT) + hoverY * hoverFade
            pz = mix(midZ, expandPos.z, expandT)
            // Mobile multiplier 0.5 matches the constant hero scale
            // (1.5 × 0.5 = 0.75), so the size is identical at the
            // hero→nova boundary — no glitch when the branch flips.
            scaleValue =
              mix(midS, expandPos.s, expandT) *
              (mobile ? 0.5 : tablet ? 0.78 : 1) *
              mix(hoverScale, 1, reverseRollT)
            outerRz = mix(midOrz, expandPos.orz, expandT)
            innerRx = mix(midRx, expandPos.rx, expandT) + butterflyFlutter * hoverFade
            innerRy = mix(midRy, expandPos.ry, expandT)
            innerRz = mix(midRz, expandPos.rz, expandT)
            z = pz
          }

          outer.position.set(px, py, pz)
          outer.scale.setScalar(scaleValue)
          outer.rotation.set(0, 0, outerRz)
          inner.rotation.set(innerRx, innerRy, innerRz)
          labelMaterial.opacity = clamp(novaActive ? labelFade : 1)
        })

        renderer.render(scene, camera)
      }

      updateScrollProgress()
      window.addEventListener('scroll', updateScrollProgress, { passive: true })
      window.addEventListener('resize', resize)
      window.addEventListener('pointermove', updatePointer, { passive: true })
      window.addEventListener('pointerleave', releasePointer)
      window.addEventListener('blur', releasePointer)
      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('scroll', updateScrollProgress)
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
