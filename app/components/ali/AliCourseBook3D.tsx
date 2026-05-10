'use client'

import { useEffect, useRef } from 'react'

// Static 3D book — clean stopgap until the SkinnedMesh page-flip lands.
// What it does today:
//   • Real BoxGeometry with thickness so the book reads as a solid object
//   • Custom canvas-rendered front cover with Ali's course branding
//   • Cream page edges showing visible thickness on the right/top/bottom
//   • Studio-style lighting (RoomEnvironment IBL + key/rim/top directionals)
//   • Subtle floating idle animation
//   • Hover: book tilts toward the viewer
//
// Page-flip interaction is intentionally not here yet — the proper Framer
// reference uses a SkinnedMesh per page with bones along the spine, which
// is a focused multi-hour piece. This component is the visual baseline so
// the section isn't broken in the meantime.

const BOOK_WIDTH = 1.5
const BOOK_HEIGHT = 2.0
const BOOK_DEPTH = 0.18

function renderCoverCanvas() {
  const canvas = document.createElement('canvas')
  const SCALE = 2
  canvas.width = 600 * SCALE
  canvas.height = 800 * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.scale(SCALE, SCALE)

  // Dark gradient background, ink-on-ink to match the rest of the site
  const gradient = ctx.createLinearGradient(0, 0, 600, 800)
  gradient.addColorStop(0, '#1f1f1f')
  gradient.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 600, 800)

  // Spine darken on the left edge
  const spineGrad = ctx.createLinearGradient(0, 0, 30, 0)
  spineGrad.addColorStop(0, 'rgba(0,0,0,0.55)')
  spineGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = spineGrad
  ctx.fillRect(0, 0, 30, 800)

  // Gold inner border
  ctx.strokeStyle = 'rgba(196,151,58,0.45)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(40, 40, 520, 720)

  // Eyebrow
  ctx.fillStyle = '#c4973a'
  ctx.font = '700 18px "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('A COURSE BY ALI', 300, 130)

  // Title — three lines, big and confident
  ctx.fillStyle = '#ffffff'
  ctx.font = '600 64px Georgia, "Playfair Display", serif'
  ctx.textBaseline = 'middle'
  const titleLines = ['From', 'Strategy', 'to Execution']
  titleLines.forEach((line, i) => {
    ctx.fillText(line, 300, 340 + (i - 1) * 80)
  })

  // Footer detail
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '600 14px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('6 MODULES · 2026', 300, 720)

  return canvas
}

function renderBackCanvas() {
  const canvas = document.createElement('canvas')
  const SCALE = 2
  canvas.width = 600 * SCALE
  canvas.height = 800 * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.scale(SCALE, SCALE)
  const gradient = ctx.createLinearGradient(0, 0, 600, 800)
  gradient.addColorStop(0, '#1a1a1a')
  gradient.addColorStop(1, '#070707')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 600, 800)
  ctx.strokeStyle = 'rgba(196,151,58,0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(40, 40, 520, 720)
  return canvas
}

function renderEdgeCanvas() {
  // Cream page-edge texture — fine horizontal lines suggest stacked paper
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = '#f1e9d3'
  ctx.fillRect(0, 0, 256, 1024)
  ctx.strokeStyle = 'rgba(110, 96, 66, 0.18)'
  ctx.lineWidth = 1
  for (let y = 2; y < 1024; y += 2) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(256, y)
    ctx.stroke()
  }
  return canvas
}

export default function AliCourseBook3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let disposed = false
    let frame = 0
    let cleanup = () => {}

    async function boot() {
      const THREE = await import('three')
      const { RoomEnvironment } = await import(
        'three/examples/jsm/environments/RoomEnvironment.js'
      )
      if (disposed || !canvasRef.current || !containerRef.current) return

      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50)
      camera.position.set(0, 0.1, 5.4)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.setSize(width, height)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05

      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()
      scene.add(new THREE.AmbientLight(0xeae3d2, 0.55))
      const key = new THREE.DirectionalLight(0xffffff, 2.4)
      key.position.set(3, 4, 4)
      scene.add(key)
      const rim = new THREE.DirectionalLight(0xfff2d8, 1.2)
      rim.position.set(-3, 2, -2)
      scene.add(rim)
      const top = new THREE.DirectionalLight(0xd8e2ee, 0.7)
      top.position.set(0, 5, 1)
      scene.add(top)

      // Textures from canvas
      const makeTex = (canvas: HTMLCanvasElement) => {
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        tex.needsUpdate = true
        return tex
      }
      const coverTex = makeTex(renderCoverCanvas())
      const backTex = makeTex(renderBackCanvas())
      const edgeTex = makeTex(renderEdgeCanvas())

      // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z (right, left, top, bottom, front, back)
      const matRight = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.7 })
      const matLeft = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 })
      const matTop = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.7 })
      const matBottom = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.7 })
      const matFront = new THREE.MeshStandardMaterial({
        map: coverTex,
        roughness: 0.55,
        metalness: 0.04,
      })
      const matBack = new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.6,
        metalness: 0.04,
      })

      const geometry = new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, BOOK_DEPTH)
      const book = new THREE.Mesh(geometry, [
        matRight,
        matLeft,
        matTop,
        matBottom,
        matFront,
        matBack,
      ])
      const bookGroup = new THREE.Group()
      bookGroup.add(book)
      scene.add(bookGroup)

      // Soft ground shadow — a faded ellipse plane below the book
      const shadowCanvas = document.createElement('canvas')
      shadowCanvas.width = 256
      shadowCanvas.height = 128
      const sctx = shadowCanvas.getContext('2d')
      if (sctx) {
        const grad = sctx.createRadialGradient(128, 64, 0, 128, 64, 110)
        grad.addColorStop(0, 'rgba(20, 20, 30, 0.35)')
        grad.addColorStop(1, 'rgba(20, 20, 30, 0)')
        sctx.fillStyle = grad
        sctx.fillRect(0, 0, 256, 128)
      }
      const shadowTex = new THREE.CanvasTexture(shadowCanvas)
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
      const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.0), shadowMat)
      shadowMesh.rotation.x = -Math.PI / 2
      shadowMesh.position.y = -1.18
      scene.add(shadowMesh)

      // Hover state — bookGroup.userData drives the idle/interactive rotations
      bookGroup.userData.hovered = false
      const onPointerEnter = () => {
        bookGroup.userData.hovered = true
      }
      const onPointerLeave = () => {
        bookGroup.userData.hovered = false
      }
      canvasRef.current.addEventListener('pointerenter', onPointerEnter)
      canvasRef.current.addEventListener('pointerleave', onPointerLeave)

      // Resize
      const ro = new ResizeObserver(() => {
        const w = container.clientWidth
        const h = container.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      })
      ro.observe(container)

      const clock = new THREE.Clock()
      const eased = { rotY: 0.35, rotX: -0.05 }

      const render = () => {
        frame = requestAnimationFrame(render)
        const t = clock.elapsedTime

        // Idle floating: gentle sway on Y, smaller bob on X, slight Y bounce
        const targetRotY = Math.sin(t * 0.4) * 0.18 + 0.35 + (bookGroup.userData.hovered ? -0.18 : 0)
        const targetRotX = Math.sin(t * 0.32) * 0.04 - 0.05 + (bookGroup.userData.hovered ? -0.06 : 0)
        eased.rotY += (targetRotY - eased.rotY) * 0.08
        eased.rotX += (targetRotX - eased.rotX) * 0.08
        bookGroup.rotation.y = eased.rotY
        bookGroup.rotation.x = eased.rotX
        bookGroup.position.y = Math.sin(t * 0.55) * 0.04

        // Shadow follows the book — softens & shrinks as book tilts away
        const shadowScale = 1 - Math.abs(eased.rotY) * 0.18
        shadowMesh.scale.set(shadowScale, 1, shadowScale)
        shadowMat.opacity = 0.85 - Math.abs(eased.rotY) * 0.15

        renderer.render(scene, camera)
      }
      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        ro.disconnect()
        canvasRef.current?.removeEventListener('pointerenter', onPointerEnter)
        canvasRef.current?.removeEventListener('pointerleave', onPointerLeave)
        geometry.dispose()
        ;[matRight, matLeft, matTop, matBottom, matFront, matBack].forEach(m => m.dispose())
        coverTex.dispose()
        backTex.dispose()
        edgeTex.dispose()
        shadowTex.dispose()
        shadowMat.dispose()
        shadowMesh.geometry.dispose()
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
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 5',
        maxWidth: 480,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="From Strategy to Execution — course preview"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  )
}
