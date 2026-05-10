'use client'

import { useEffect, useRef, useState } from 'react'

// Interactive 3D magazine — Framer-style page-flip book.
//
// Each sheet is a SkinnedMesh: a BoxGeometry with width-segments along the
// page width, skinned to a chain of bones running spine→outer-edge. Flipping
// a page rotates each bone with a per-bone delay (the "fold" easing factor),
// which propagates a curve from the spine outward — the wave that makes a
// flip read as paper, not a flat card spinning.
//
// Layout: 5 sheets / 10 pages, alternating module spreads with photos.
// Click anywhere on the right side → next spread. Click left side → previous.

const SHEET_WIDTH = 1.4
const SHEET_HEIGHT = 1.9
const SHEET_DEPTH = 0.006
const BONE_COUNT = 6
const SEGMENTS = 30
const SHEET_COUNT = 5

// Easing factors per the Framer source hint
const EASE_FLIP = 0.07
const EASE_FOLD = 0.05
const MAX_CURL = 0.18 // peak bone-fold rotation at mid-flip

// ── Page content ──────────────────────────────────────────────────
type PageContent =
  | { kind: 'cover-front' }
  | { kind: 'cover-back' }
  | { kind: 'module'; eyebrow: string; title: string; bullets: string[]; footer?: string }
  | { kind: 'photo'; src: string }

// 10 pages: cover + 4 module pages + 4 photos + back cover
const PAGES: PageContent[] = [
  { kind: 'cover-front' },
  {
    kind: 'module',
    eyebrow: 'MODULE 01',
    title: 'Strategy that survives contact with reality.',
    bullets: [
      'OGSM as a working tool, not slideware',
      'SWOT that earns its place in a plan',
      'Strategy prompts you can run weekly',
    ],
  },
  { kind: 'photo', src: '/aboutme%202.webp' },
  {
    kind: 'module',
    eyebrow: 'MODULE 02',
    title: 'Governance that enables, not controls.',
    bullets: [
      'Decision rights, owners, escalation forums',
      'Cascade & review templates',
      'Operating-model design under pressure',
    ],
  },
  { kind: 'photo', src: '/aboutme%203.webp' },
  {
    kind: 'module',
    eyebrow: 'MODULE 03',
    title: 'AI built into the strategy loop.',
    bullets: [
      'Prompt libraries for execution leaders',
      'AI-assisted diagnostics',
      'Prompts that survive board scrutiny',
    ],
  },
  { kind: 'photo', src: '/aboutme%204.webp' },
  {
    kind: 'module',
    eyebrow: 'MODULE 04',
    title: 'Operating models that work under pressure.',
    bullets: [
      'Aligning planning, budgeting, performance',
      'Forums that decide, not just discuss',
      'Systems that depend on institutions, not heroes',
    ],
  },
  { kind: 'photo', src: '/aboutme%205.webp' },
  { kind: 'cover-back' },
]

// ── Canvas page renderers ─────────────────────────────────────────
function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return canvas
}

function renderCoverFront() {
  const canvas = makeCanvas(600, 800)
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 600, 800)
  grad.addColorStop(0, '#1f1f1f')
  grad.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 800)
  // Spine darken
  const sp = ctx.createLinearGradient(0, 0, 30, 0)
  sp.addColorStop(0, 'rgba(0,0,0,0.55)')
  sp.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sp
  ctx.fillRect(0, 0, 30, 800)
  // Border
  ctx.strokeStyle = 'rgba(196,151,58,0.45)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(40, 40, 520, 720)
  // Eyebrow
  ctx.fillStyle = '#c4973a'
  ctx.font = '700 18px "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('A COURSE BY ALI', 300, 130)
  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = '600 64px Georgia, serif'
  ctx.textBaseline = 'middle'
  ;['From', 'Strategy', 'to Execution'].forEach((line, i) => {
    ctx.fillText(line, 300, 340 + (i - 1) * 80)
  })
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '600 14px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('6 MODULES · 2026', 300, 720)
  return canvas
}

function renderCoverBack() {
  const canvas = makeCanvas(600, 800)
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 600, 800)
  grad.addColorStop(0, '#1a1a1a')
  grad.addColorStop(1, '#080808')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 800)
  ctx.strokeStyle = 'rgba(196,151,58,0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(40, 40, 520, 720)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '600 13px "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('aliiweb.vercel.app', 300, 740)
  return canvas
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function renderModule(content: Extract<PageContent, { kind: 'module' }>) {
  const canvas = makeCanvas(600, 800)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fbf7ed'
  ctx.fillRect(0, 0, 600, 800)
  // Spine shadow
  const sp = ctx.createLinearGradient(0, 0, 28, 0)
  sp.addColorStop(0, 'rgba(13,13,13,0.10)')
  sp.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sp
  ctx.fillRect(0, 0, 28, 800)
  // Eyebrow
  ctx.fillStyle = '#c4973a'
  ctx.font = '700 14px "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(content.eyebrow, 60, 90)
  // Title
  ctx.fillStyle = '#1a1a1a'
  ctx.font = '600 34px Georgia, serif'
  ctx.textBaseline = 'top'
  const titleLines = wrapText(ctx, content.title, 480)
  titleLines.forEach((line, i) => ctx.fillText(line, 60, 120 + i * 42))
  // Bullets
  let y = 140 + titleLines.length * 42
  ctx.font = '500 17px "Helvetica Neue", Arial, sans-serif'
  content.bullets.forEach(bullet => {
    ctx.fillStyle = '#c4973a'
    ctx.beginPath()
    ctx.arc(70, y + 11, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#3a3a3a'
    const bulletLines = wrapText(ctx, bullet, 460)
    bulletLines.forEach((line, j) => ctx.fillText(line, 88, y + j * 24))
    y += bulletLines.length * 24 + 16
  })
  return canvas
}

function renderPhotoPlaceholder() {
  // Initial placeholder before image loads — cream tone
  const canvas = makeCanvas(600, 800)
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 600, 800)
  grad.addColorStop(0, '#ece2c8')
  grad.addColorStop(1, '#d6c9a6')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 800)
  return canvas
}

// ── Component ─────────────────────────────────────────────────────
export default function AliCourseBook3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hint, setHint] = useState(true)

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
      const w0 = container.clientWidth
      const h0 = container.clientHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(28, w0 / h0, 0.1, 50)
      camera.position.set(0, 0, 6.0)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.setSize(w0, h0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05

      // Studio lighting
      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()
      scene.add(new THREE.AmbientLight(0xeae3d2, 0.5))
      const key = new THREE.DirectionalLight(0xffffff, 2.2)
      key.position.set(3, 4, 4)
      scene.add(key)
      const rim = new THREE.DirectionalLight(0xfff2d8, 1.0)
      rim.position.set(-3, 2, -2)
      scene.add(rim)
      const top = new THREE.DirectionalLight(0xd8e2ee, 0.6)
      top.position.set(0, 5, 1)
      scene.add(top)

      // ── Texture builders ────────────────────────────────────────
      const loader = new THREE.TextureLoader()
      const makeCanvasTex = (canvas: HTMLCanvasElement) => {
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        tex.needsUpdate = true
        return tex
      }

      // Track materials that depend on a deferred photo load so we can
      // hot-swap their .map once the file decodes.
      const photoTargets = new Map<string, import('three').MeshStandardMaterial[]>()
      function textureFor(content: PageContent): import('three').Texture {
        if (content.kind === 'cover-front') return makeCanvasTex(renderCoverFront())
        if (content.kind === 'cover-back') return makeCanvasTex(renderCoverBack())
        if (content.kind === 'module') return makeCanvasTex(renderModule(content))
        // Photo — start with cream placeholder, swap to real image on load
        return makeCanvasTex(renderPhotoPlaceholder())
      }
      function attachPhotoTarget(content: PageContent, mat: import('three').MeshStandardMaterial) {
        if (content.kind !== 'photo') return
        const list = photoTargets.get(content.src) ?? []
        list.push(mat)
        photoTargets.set(content.src, list)
      }
      function loadPendingPhotos() {
        photoTargets.forEach((mats, src) => {
          loader.load(src, loaded => {
            loaded.colorSpace = THREE.SRGBColorSpace
            loaded.anisotropy = 8
            mats.forEach(m => {
              const old = m.map
              m.map = loaded
              m.needsUpdate = true
              if (old) old.dispose()
            })
          })
        })
      }

      // Page-edge texture (cream paper stripes) for the right/top/bottom faces
      const edgeCanvas = makeCanvas(256, 1024)
      const ectx = edgeCanvas.getContext('2d')!
      ectx.fillStyle = '#f1e9d3'
      ectx.fillRect(0, 0, 256, 1024)
      ectx.strokeStyle = 'rgba(110, 96, 66, 0.18)'
      ectx.lineWidth = 1
      for (let y = 2; y < 1024; y += 2) {
        ectx.beginPath()
        ectx.moveTo(0, y)
        ectx.lineTo(256, y)
        ectx.stroke()
      }
      const edgeTex = makeCanvasTex(edgeCanvas)

      // ── Build sheets ────────────────────────────────────────────
      // Each sheet: BoxGeometry with skin weights, bones along X, then a
      // SkinnedMesh with per-face materials.
      type Sheet = {
        pivot: import('three').Group // top-level pivot for whole-page rotation
        mesh: import('three').SkinnedMesh
        bones: import('three').Bone[]
        currentFlip: number
        targetFlip: number
        materials: import('three').Material[]
      }
      const sheets: Sheet[] = []
      const bookGroup = new THREE.Group()
      scene.add(bookGroup)

      function buildSheet(
        sheetIndex: number,
        frontPage: PageContent,
        backPage: PageContent,
      ): Sheet {
        // Geometry — box centred on origin, then translated so x=0 is on
        // the LEFT edge (so the pivot at sheet origin sits on the spine).
        const geometry = new THREE.BoxGeometry(
          SHEET_WIDTH,
          SHEET_HEIGHT,
          SHEET_DEPTH,
          SEGMENTS,
          2,
          1,
        )
        geometry.translate(SHEET_WIDTH / 2, 0, 0)

        // Compute skin indices/weights per vertex — vertices with x closer
        // to a given bone get higher influence from that bone.
        const positionAttr = geometry.attributes.position
        const skinIndices: number[] = []
        const skinWeights: number[] = []
        for (let i = 0; i < positionAttr.count; i++) {
          const x = positionAttr.getX(i)
          const t = Math.max(0, Math.min(1, x / SHEET_WIDTH))
          const segs = BONE_COUNT - 1
          const segIdx = Math.min(Math.floor(t * segs), segs - 1)
          const localT = t * segs - segIdx
          skinIndices.push(segIdx, segIdx + 1, 0, 0)
          skinWeights.push(1 - localT, localT, 0, 0)
        }
        geometry.setAttribute(
          'skinIndex',
          new THREE.Uint16BufferAttribute(skinIndices, 4),
        )
        geometry.setAttribute(
          'skinWeight',
          new THREE.Float32BufferAttribute(skinWeights, 4),
        )

        // Bones — chained, each at boneSpacing from its parent.
        const boneSpacing = SHEET_WIDTH / (BONE_COUNT - 1)
        const bones: import('three').Bone[] = []
        for (let i = 0; i < BONE_COUNT; i++) {
          const bone = new THREE.Bone()
          bone.position.x = i === 0 ? 0 : boneSpacing
          bones.push(bone)
        }
        for (let i = 1; i < BONE_COUNT; i++) bones[i - 1].add(bones[i])
        const skeleton = new THREE.Skeleton(bones)

        // Materials: BoxGeometry face order is +X, -X, +Y, -Y, +Z, -Z.
        // Map: right=+X (outer edge), left=-X (spine), top=+Y, bottom=-Y,
        // front=+Z (page-front), back=-Z (page-back).
        const frontTex = textureFor(frontPage)
        const backTex = textureFor(backPage)
        const matRight = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.7 })
        const matLeft = new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.65 })
        const matTop = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.7 })
        const matBottom = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.7 })
        const matFront = new THREE.MeshStandardMaterial({
          map: frontTex,
          roughness: 0.55,
          metalness: 0.04,
        })
        const matBack = new THREE.MeshStandardMaterial({
          map: backTex,
          roughness: 0.55,
          metalness: 0.04,
        })
        attachPhotoTarget(frontPage, matFront)
        attachPhotoTarget(backPage, matBack)
        const materials = [matRight, matLeft, matTop, matBottom, matFront, matBack]

        const mesh = new THREE.SkinnedMesh(geometry, materials)
        mesh.add(bones[0])
        mesh.bind(skeleton)

        // Pivot — sits on the spine (book centre), rotates the whole sheet
        // in addition to per-bone fold. Stack sheets along z so they don't
        // z-fight when closed.
        const pivot = new THREE.Group()
        pivot.position.x = -SHEET_WIDTH / 2 // spine on left of book
        pivot.position.z = -sheetIndex * SHEET_DEPTH * 1.6
        pivot.add(mesh)
        bookGroup.add(pivot)

        return { pivot, mesh, bones, currentFlip: 0, targetFlip: 0, materials }
      }

      // Pair pages into sheets:
      //  sheet 0: front=page 0 (cover), back=page 1 (module 01)
      //  sheet 1: front=page 2 (photo), back=page 3 (module 02)
      //  sheet 2: front=page 4 (photo), back=page 5 (module 03)
      //  sheet 3: front=page 6 (photo), back=page 7 (module 04)
      //  sheet 4: front=page 8 (photo), back=page 9 (back cover)
      for (let i = 0; i < SHEET_COUNT; i++) {
        sheets.push(buildSheet(i, PAGES[i * 2], PAGES[i * 2 + 1]))
      }
      // Now that all sheets and their materials exist, kick off the photo
      // file loads — each photo file is loaded once and shared across any
      // materials that referenced the same src.
      loadPendingPhotos()

      // Soft ground shadow
      const shadowCanvas = makeCanvas(256, 128)
      const sctx = shadowCanvas.getContext('2d')!
      const sgrad = sctx.createRadialGradient(128, 64, 0, 128, 64, 110)
      sgrad.addColorStop(0, 'rgba(20, 20, 30, 0.35)')
      sgrad.addColorStop(1, 'rgba(20, 20, 30, 0)')
      sctx.fillStyle = sgrad
      sctx.fillRect(0, 0, 256, 128)
      const shadowTex = makeCanvasTex(shadowCanvas)
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
      const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.0), shadowMat)
      shadowMesh.rotation.x = -Math.PI / 2
      shadowMesh.position.y = -1.18
      scene.add(shadowMesh)

      // ── Interaction ─────────────────────────────────────────────
      let currentSpread = 0 // 0 = closed, 1 = first spread shown, ... up to SHEET_COUNT
      const setSpread = (n: number) => {
        currentSpread = Math.max(0, Math.min(SHEET_COUNT, n))
        sheets.forEach((sheet, i) => {
          sheet.targetFlip = i < currentSpread ? 1 : 0
        })
        setHint(false)
      }

      const onClick = (e: MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        // Right half advances, left half goes back
        if (x > 0.5) setSpread(currentSpread + 1)
        else setSpread(currentSpread - 1)
      }
      canvasRef.current.addEventListener('click', onClick)

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

      // ── Render loop ─────────────────────────────────────────────
      const clock = new THREE.Clock()
      const eased = { rotY: 0.25, rotX: -0.05 }

      const render = () => {
        frame = requestAnimationFrame(render)
        const t = clock.elapsedTime

        // Idle rotation. When the book is open (any sheet flipped), settle
        // to a flatter angle so the spread is readable; when closed, sway
        // the cover to show off thickness.
        const isOpen = currentSpread > 0
        const baseY = isOpen ? 0 : 0.32
        const baseX = isOpen ? -0.08 : -0.06
        const targetY =
          baseY +
          Math.sin(t * 0.4) * (isOpen ? 0.04 : 0.16) +
          (bookGroup.userData.hovered && !isOpen ? -0.18 : 0)
        const targetX = baseX + Math.sin(t * 0.32) * 0.04
        eased.rotY += (targetY - eased.rotY) * 0.06
        eased.rotX += (targetX - eased.rotX) * 0.06
        bookGroup.rotation.y = eased.rotY
        bookGroup.rotation.x = eased.rotX
        bookGroup.position.y = Math.sin(t * 0.55) * 0.04

        // Per-sheet flip + per-bone fold
        sheets.forEach(sheet => {
          sheet.currentFlip += (sheet.targetFlip - sheet.currentFlip) * EASE_FLIP
          // Whole-page pivot rotation
          sheet.pivot.rotation.y = -sheet.currentFlip * Math.PI

          // Each bone gets a base "share" of the pivot rotation undone (so the
          // rotation distributes across the chain) plus a curl that peaks
          // mid-flip and returns to flat at start/end. Per-bone phase along
          // the spine creates the wave.
          for (let j = 0; j < sheet.bones.length; j++) {
            const phase = j / (sheet.bones.length - 1) // 0 at spine, 1 at outer
            // Curl: peaks at mid-flip, sin shape across the bones
            const flipShape = Math.sin(sheet.currentFlip * Math.PI)
            const boneShape = Math.sin(phase * Math.PI)
            const curl = MAX_CURL * flipShape * boneShape
            const target = curl
            sheet.bones[j].rotation.y +=
              (target - sheet.bones[j].rotation.y) * EASE_FOLD * (1 + j * 0.2)
          }
        })

        // Shadow follows the book pose subtly
        const shadowScale = 1 - Math.abs(eased.rotY) * 0.15
        shadowMesh.scale.set(shadowScale, 1, shadowScale)
        shadowMat.opacity = 0.85 - Math.abs(eased.rotY) * 0.12

        renderer.render(scene, camera)
      }
      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        ro.disconnect()
        canvasRef.current?.removeEventListener('click', onClick)
        canvasRef.current?.removeEventListener('pointerenter', onPointerEnter)
        canvasRef.current?.removeEventListener('pointerleave', onPointerLeave)
        sheets.forEach(s => {
          s.mesh.geometry.dispose()
          s.materials.forEach(m => m.dispose())
        })
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
        aria-label="From Strategy to Execution — interactive course preview"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          display: 'block',
        }}
      />
      {hint && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-display)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ali-muted, #888)',
            pointerEvents: 'none',
            opacity: 0.85,
          }}
        >
          Click the book to turn pages
        </div>
      )}
    </div>
  )
}
