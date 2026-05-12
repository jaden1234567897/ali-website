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
const SHEET_Z_GAP = 0.012 // visual gap between stacked sheets — wide enough that the stack reads as a real book block
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
  { kind: 'photo', src: '/aboutme-2.webp' },
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
  { kind: 'photo', src: '/aboutme-3.webp' },
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
  { kind: 'photo', src: '/aboutme-4.webp' },
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
  { kind: 'photo', src: '/aboutme-5.webp' },
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
  // Proper back cover at 2× resolution — author quote, course summary,
  // CTA, gold border. Reads like a real magazine back cover.
  const SCALE = 2
  const canvas = makeCanvas(600 * SCALE, 800 * SCALE)
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)
  const grad = ctx.createLinearGradient(0, 0, 600, 800)
  grad.addColorStop(0, '#1f1f1f')
  grad.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 800)
  // Gold border
  ctx.strokeStyle = 'rgba(196,151,58,0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(40, 40, 520, 720)
  // Eyebrow
  ctx.fillStyle = '#c4973a'
  ctx.font = '700 16px "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('A COURSE BY ALI', 300, 130)
  // Pull-quote
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = '600 28px Georgia, serif'
  ctx.textBaseline = 'top'
  const quoteLines = [
    '"Strategy fails',
    'where execution',
    'has no owner."',
  ]
  quoteLines.forEach((line, i) => ctx.fillText(line, 300, 200 + i * 38))
  // Author tag
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '500 15px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('— Ali Al-Ali', 300, 340)
  // Divider
  ctx.strokeStyle = 'rgba(196,151,58,0.4)'
  ctx.beginPath()
  ctx.moveTo(220, 400)
  ctx.lineTo(380, 400)
  ctx.stroke()
  // What's inside
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '600 14px "Helvetica Neue", Arial, sans-serif'
  const inside = [
    '6 video modules · frameworks',
    'AI prompts · diagnostics',
    'Lifetime access + updates',
  ]
  inside.forEach((line, i) => ctx.fillText(line, 300, 440 + i * 26))
  // CTA box
  ctx.strokeStyle = 'rgba(196,151,58,0.6)'
  ctx.lineWidth = 1
  ctx.strokeRect(180, 600, 240, 56)
  ctx.fillStyle = '#c4973a'
  ctx.font = '700 14px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('JOIN THE WAITLIST →', 300, 632)
  // URL
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '600 12px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('aliiweb.vercel.app', 300, 730)
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
  // 2× resolution + larger fonts so text actually reads at the displayed
  // canvas size. Was rendering at fonts that became near-illegible once
  // the BoxGeometry's mipmap chain kicked in at moderate render size.
  const SCALE = 2
  const canvas = makeCanvas(600 * SCALE, 800 * SCALE)
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)
  const bg = ctx.createLinearGradient(0, 0, 0, 800)
  bg.addColorStop(0, '#f0e6cf')
  bg.addColorStop(1, '#e6dab8')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 800)
  // Spine shadow
  const sp = ctx.createLinearGradient(0, 0, 36, 0)
  sp.addColorStop(0, 'rgba(13,13,13,0.22)')
  sp.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sp
  ctx.fillRect(0, 0, 36, 800)
  // Eyebrow
  ctx.fillStyle = '#a47a25'
  ctx.font = '700 20px "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(content.eyebrow, 60, 110)
  // Title
  ctx.fillStyle = '#0d0d0d'
  ctx.font = '700 48px Georgia, serif'
  ctx.textBaseline = 'top'
  const titleLines = wrapText(ctx, content.title, 480)
  titleLines.forEach((line, i) => ctx.fillText(line, 60, 150 + i * 56))
  // Divider
  ctx.strokeStyle = 'rgba(164, 122, 37, 0.35)'
  ctx.lineWidth = 1
  const dividerY = 180 + titleLines.length * 56
  ctx.beginPath()
  ctx.moveTo(60, dividerY)
  ctx.lineTo(540, dividerY)
  ctx.stroke()
  // Bullets — pure black at 700 weight reads as confident black through
  // the PBR shading. Was 600 weight, which read soft-grey on a phone.
  let y = dividerY + 30
  ctx.font = '700 24px "Helvetica Neue", Arial, sans-serif'
  content.bullets.forEach(bullet => {
    ctx.fillStyle = '#a47a25'
    ctx.beginPath()
    ctx.arc(70, y + 15, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000000'
    const bulletLines = wrapText(ctx, bullet, 450)
    bulletLines.forEach((line, j) => ctx.fillText(line, 92, y + j * 32))
    y += bulletLines.length * 32 + 22
  })
  // Footer module mark in the corner
  ctx.fillStyle = 'rgba(110, 80, 30, 0.4)'
  ctx.font = '700 13px "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(content.eyebrow, 540, 740)
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
  const [indicator, setIndicator] = useState(0)

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
      // Camera pulled closer so the spread fills the canvas — the previous
      // 6.4 distance left ~30% of the canvas width as whitespace, which
      // shrunk page text below readable size.
      const camera = new THREE.PerspectiveCamera(34, w0 / h0, 0.1, 50)
      camera.position.set(0, 0, 4.6)
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
      // Lower exposure so cream pages don't blow out when the book opens.
      renderer.toneMappingExposure = 0.85

      // Studio lighting — gentler than before. The earlier values were
      // tuned for the closed dark cover; cream pages were getting hammered
      // and the text/photos read washed-out when the book opened.
      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()
      // Tone down the IBL contribution if the Three runtime supports it
      // (r163+). Older versions silently ignore the assignment.
      ;(scene as { environmentIntensity?: number }).environmentIntensity = 0.55
      scene.add(new THREE.AmbientLight(0xeae3d2, 0.35))
      const key = new THREE.DirectionalLight(0xffffff, 1.2)
      key.position.set(3, 4, 4)
      scene.add(key)
      const rim = new THREE.DirectionalLight(0xfff2d8, 0.5)
      rim.position.set(-3, 2, -2)
      scene.add(rim)
      const top = new THREE.DirectionalLight(0xd8e2ee, 0.35)
      top.position.set(0, 5, 1)
      scene.add(top)

      // ── Texture builders ────────────────────────────────────────
      const loader = new THREE.TextureLoader()
      // Each canvas is serialised to a PNG data URL and loaded as an
      // HTMLImageElement before becoming a texture. This guarantees each
      // page texture has its own independent, fully-materialised bitmap —
      // previously, Three.js was mis-sampling when multiple in-memory
      // canvases of the same size were uploaded back-to-back, which is
      // why Module 04's content was overlapping with Module 01's.
      const makeCanvasTex = (canvas: HTMLCanvasElement) => {
        const tex = new THREE.Texture()
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        const img = new Image()
        img.onload = () => {
          tex.image = img
          tex.needsUpdate = true
        }
        img.src = canvas.toDataURL('image/png')
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
        // Higher roughness + zero metalness = matte paper, no specular
        // highlights blowing out the cream pages.
        const matFront = new THREE.MeshStandardMaterial({
          map: frontTex,
          roughness: 0.9,
          metalness: 0,
        })
        const matBack = new THREE.MeshStandardMaterial({
          map: backTex,
          roughness: 0.9,
          metalness: 0,
        })
        attachPhotoTarget(frontPage, matFront)
        attachPhotoTarget(backPage, matBack)
        const materials = [matRight, matLeft, matTop, matBottom, matFront, matBack]

        const mesh = new THREE.SkinnedMesh(geometry, materials)
        mesh.add(bones[0])
        mesh.bind(skeleton)

        // Pivot — sits on the spine (book centre). Z-position is now
        // computed per-frame in the render loop based on flip state, so
        // each sheet ends up on the correct side of the spine stack.
        const pivot = new THREE.Group()
        pivot.position.x = -SHEET_WIDTH / 2 // spine on left of book
        pivot.position.z = -sheetIndex * SHEET_Z_GAP // initial: right stack
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
      // Click anywhere advances; wraps back to closed at the end. Previous
      // "left half = back, right half = forward" was confusing — users
      // clicked the visible page (left after first flip) and went back
      // every time, so they kept seeing Module 01 over and over and
      // assumed every page was the same.
      let currentSpread = 0
      const setSpread = (n: number) => {
        // Wrap: clicking past the last spread closes the book.
        if (n > SHEET_COUNT) n = 0
        if (n < 0) n = 0
        currentSpread = n
        sheets.forEach((sheet, i) => {
          sheet.targetFlip = i < currentSpread ? 1 : 0
        })
        setHint(false)
        setIndicator(currentSpread)
      }

      const onClick = () => setSpread(currentSpread + 1)
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
      const eased = { rotY: 0.25, rotX: -0.05, posX: 0 }

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

        // Re-centre the book when it's open. Each sheet's spine sits at
        // bookGroup-local x = -W/2; when a sheet flips, its outer edge
        // swings out to bookGroup-local x = -3W/2 (W to the left of the
        // spine). To keep the open spread centred in the canvas, slide
        // the whole bookGroup right by W/2 as flipping progresses. Driven
        // by the max currentFlip across sheets so the slide tracks the
        // animation, not the discrete spread index.
        let maxFlip = 0
        for (const s of sheets) maxFlip = Math.max(maxFlip, s.currentFlip)
        const targetPosX = (SHEET_WIDTH / 2) * maxFlip
        eased.posX += (targetPosX - eased.posX) * 0.08
        bookGroup.position.x = eased.posX

        // Per-sheet flip + per-bone fold + dynamic z-stacking
        sheets.forEach((sheet, sheetIdx) => {
          sheet.currentFlip += (sheet.targetFlip - sheet.currentFlip) * EASE_FLIP
          sheet.pivot.rotation.y = -sheet.currentFlip * Math.PI

          // Z stacking — the missing piece that was making every spread
          // show Module 01. When a sheet is mostly UNFLIPPED (currentFlip
          // < 0.5) it lives on the RIGHT stack at z = -i * gap (so sheet
          // 0 is closest to the camera and visible on top). When mostly
          // FLIPPED, it lives on the LEFT stack at z = +i * gap (so the
          // most recently flipped sheet is closest to the camera, with
          // earlier-flipped sheets behind it). The transition happens
          // when the page is rotated 90° edge-on (currentFlip = 0.5),
          // so the snap is invisible — the rotated page is geometrically
          // perpendicular to the camera at that moment.
          const onLeftStack = sheet.currentFlip > 0.5
          sheet.pivot.position.z = sheetIdx * SHEET_Z_GAP * (onLeftStack ? 1 : -1)

          // Per-bone curl — peaks at mid-flip, returns to flat at the
          // ends. Per-bone phase scaling propagates the wave from spine
          // outward.
          for (let j = 0; j < sheet.bones.length; j++) {
            const phase = j / (sheet.bones.length - 1)
            const flipShape = Math.sin(sheet.currentFlip * Math.PI)
            const boneShape = Math.sin(phase * Math.PI)
            const curl = MAX_CURL * flipShape * boneShape
            sheet.bones[j].rotation.y +=
              (curl - sheet.bones[j].rotation.y) * EASE_FOLD * (1 + j * 0.2)
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
      className="ali-course-book-3d"
      style={{
        position: 'relative',
        width: '100%',
        // Aspect ratio favours width because the open spread is ~2× as wide
        // as the closed cover. 5/4 gives us enough horizontal room for the
        // open spread without the closed cover looking squashed vertically.
        aspectRatio: '5 / 4',
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
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {hint
          ? 'Click anywhere to turn the page'
          : indicator === 0
            ? 'Click to open · 5 spreads'
            : indicator > SHEET_COUNT - 1
              ? 'Back cover · click to restart'
              : `Spread ${indicator} of ${SHEET_COUNT - 1}`}
      </div>
    </div>
  )
}
