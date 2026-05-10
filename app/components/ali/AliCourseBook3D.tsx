'use client'

import { useEffect, useRef, useState } from 'react'

// 3D Magazine — interactive Three.js book with paper-curve page flipping,
// floating idle animation, and studio-style lighting. Drop-in replacement
// for the static CoursePreviewBook in the course section.
//
// Click anywhere on the book → advances to the next page (paper curves as
// it turns). Hover → cover lifts ~6° toward the viewer.

type PageContent = {
  side: 'cover-front' | 'cover-back' | 'page'
  eyebrow?: string
  title?: string
  bullets?: string[]
  footer?: string
}

const COVER_FRONT: PageContent = {
  side: 'cover-front',
  eyebrow: 'A COURSE BY ALI',
  title: 'From\nStrategy\nto Execution',
  footer: '6 MODULES · 2026',
}

const COVER_BACK: PageContent = {
  side: 'cover-back',
}

const PAGES: PageContent[] = [
  {
    side: 'page',
    eyebrow: 'INSIDE',
    title: 'A practical system for closing the execution gap.',
    bullets: [
      '6 in-depth video modules',
      'Downloadable frameworks & templates',
      'AI-assisted exercises',
      'Lifetime access + updates',
    ],
  },
  {
    side: 'page',
    eyebrow: 'MODULE 01',
    title: 'Strategy that survives contact with reality.',
    bullets: [
      'OGSM as a working tool, not slideware',
      'SWOT that earns its place in a plan',
      'Strategy prompts you can run weekly',
    ],
  },
  {
    side: 'page',
    eyebrow: 'MODULE 02',
    title: 'Governance that enables, not controls.',
    bullets: [
      'Decision rights, owners, escalation forums',
      'Cascade & review templates',
      'Operating-model design under pressure',
    ],
  },
  {
    side: 'page',
    eyebrow: 'MODULE 03',
    title: 'AI built into the strategy loop.',
    bullets: [
      'Prompt libraries for execution leaders',
      'AI-assisted diagnostics',
      'Prompts that survive board scrutiny',
    ],
  },
  {
    side: 'page',
    eyebrow: 'PLUS',
    title: 'Free Strategy Execution Diagnostic.',
    bullets: [
      'Self-assess your team',
      'Pinpoint the breakage between intent and delivery',
      'Use it before, during, and after the course',
    ],
    footer: 'JOIN THE WAITLIST →',
  },
]

const ALL_PAGES: PageContent[] = [COVER_FRONT, ...PAGES, COVER_BACK]

const BOOK_WIDTH = 1.5
const BOOK_HEIGHT = 2.0
const PAGE_DEPTH = 0.004
const COVER_DEPTH = 0.025

// Render a page's content to a 2D canvas, then upload as a Three.js texture.
// Keeping the layout in canvas-space means we never have to deal with HTML
// in WebGL — and the texture is GPU-cheap once uploaded.
function renderPageCanvas(content: PageContent, isFrontCover: boolean) {
  const canvas = document.createElement('canvas')
  const SCALE = 2
  canvas.width = 600 * SCALE
  canvas.height = 800 * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.scale(SCALE, SCALE)

  if (isFrontCover) {
    // Dark cover with gold accent border + serif title
    const gradient = ctx.createLinearGradient(0, 0, 600, 800)
    gradient.addColorStop(0, '#1f1f1f')
    gradient.addColorStop(1, '#0a0a0a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, 800)
    // Spine darken
    const spineGrad = ctx.createLinearGradient(0, 0, 30, 0)
    spineGrad.addColorStop(0, 'rgba(0,0,0,0.5)')
    spineGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = spineGrad
    ctx.fillRect(0, 0, 30, 800)
    // Gold border
    ctx.strokeStyle = 'rgba(196,151,58,0.45)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(40, 40, 520, 720)
    // Eyebrow
    ctx.fillStyle = '#c4973a'
    ctx.font = '700 18px "Helvetica Neue", Arial'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '0.3em'
    ctx.fillText(content.eyebrow ?? '', 300, 130)
    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 60px "Playfair Display", Georgia, serif'
    ctx.textBaseline = 'middle'
    const titleLines = (content.title ?? '').split('\n')
    titleLines.forEach((line, i) => {
      ctx.fillText(line, 300, 360 + (i - (titleLines.length - 1) / 2) * 70)
    })
    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '600 14px "Helvetica Neue", Arial'
    ctx.fillText(content.footer ?? '', 300, 720)
  } else if (content.side === 'cover-back') {
    // Cream endpaper with gold border
    const grad = ctx.createLinearGradient(0, 0, 600, 800)
    grad.addColorStop(0, '#f7f1e3')
    grad.addColorStop(1, '#ece2c8')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 600, 800)
    ctx.strokeStyle = 'rgba(196,151,58,0.55)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(40, 40, 520, 720)
  } else {
    // Inside page — cream paper with serif/sans typography
    ctx.fillStyle = '#fbf7ed'
    ctx.fillRect(0, 0, 600, 800)
    // Subtle paper texture via noise dots (very light)
    ctx.globalAlpha = 0.03
    ctx.fillStyle = '#000'
    for (let i = 0; i < 220; i++) {
      ctx.fillRect(Math.random() * 600, Math.random() * 800, 1, 1)
    }
    ctx.globalAlpha = 1
    // Spine shadow
    const spineGrad = ctx.createLinearGradient(0, 0, 28, 0)
    spineGrad.addColorStop(0, 'rgba(13,13,13,0.12)')
    spineGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = spineGrad
    ctx.fillRect(0, 0, 28, 800)
    // Eyebrow
    ctx.fillStyle = '#c4973a'
    ctx.font = '700 14px "Helvetica Neue", Arial'
    ctx.textAlign = 'left'
    ctx.fillText(content.eyebrow ?? '', 60, 90)
    // Title
    ctx.fillStyle = '#1a1a1a'
    ctx.font = '600 36px "Playfair Display", Georgia, serif'
    ctx.textBaseline = 'top'
    const titleLines = wrapText(ctx, content.title ?? '', 480)
    titleLines.forEach((line, i) => {
      ctx.fillText(line, 60, 120 + i * 44)
    })
    // Bullets
    ctx.fillStyle = '#3a3a3a'
    ctx.font = '500 18px "Helvetica Neue", Arial'
    let y = 160 + titleLines.length * 44
    ;(content.bullets ?? []).forEach(bullet => {
      ctx.fillStyle = '#c4973a'
      ctx.beginPath()
      ctx.arc(70, y + 11, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#3a3a3a'
      const bulletLines = wrapText(ctx, bullet, 460)
      bulletLines.forEach((line, j) => {
        ctx.fillText(line, 88, y + j * 24)
      })
      y += bulletLines.length * 24 + 14
    })
    if (content.footer) {
      ctx.fillStyle = '#1a1a1a'
      ctx.font = '700 14px "Helvetica Neue", Arial'
      ctx.fillText(content.footer, 60, 740)
    }
  }
  return canvas
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

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
      const width = container.clientWidth
      const height = container.clientHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50)
      camera.position.set(0, 0.2, 5.2)
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

      // Environment + studio lighting
      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()
      scene.add(new THREE.AmbientLight(0xeae3d2, 0.55))
      const key = new THREE.DirectionalLight(0xffffff, 2.6)
      key.position.set(3, 4, 4)
      scene.add(key)
      const rim = new THREE.DirectionalLight(0xfff2d8, 1.2)
      rim.position.set(-3, 2, -2)
      scene.add(rim)
      const top = new THREE.DirectionalLight(0xd8e2ee, 0.8)
      top.position.set(0, 5, 1)
      scene.add(top)

      // Build textures from canvas content
      function makeTexture(content: PageContent, isFrontCover = false) {
        const canvas = renderPageCanvas(content, isFrontCover)
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        tex.needsUpdate = true
        return tex
      }

      const bookGroup = new THREE.Group()
      scene.add(bookGroup)

      // Each leaf is one rotating element representing one bound spread.
      // Front/back faces are textured separately so each side of the leaf
      // shows the right canvas.
      type Leaf = {
        pivot: import('three').Group
        mesh: import('three').Mesh
        material: import('three').ShaderMaterial
        frontPage: PageContent
        backPage: PageContent
      }
      const leaves: Leaf[] = []

      // Custom paper-curve shader: bends each leaf along its width while
      // it rotates. Curve peaks at half-rotation and returns to flat at
      // 0° and 180° — that's the trick that makes a flip read as paper
      // rather than a flat card spinning.
      const paperVertex = `
        uniform float uFlip;
        uniform float uCurve;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vec3 pos = position;
          // Normalised x along leaf width: 0 at spine, 1 at outer edge.
          float xn = (pos.x + ${(BOOK_WIDTH / 2).toFixed(3)}) / ${BOOK_WIDTH.toFixed(3)};
          float bend = sin(xn * 3.14159) * uCurve * sin(uFlip * 3.14159);
          pos.z += bend;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `
      const paperFragment = `
        uniform sampler2D uFront;
        uniform sampler2D uBack;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          // Choose which texture by which face the camera sees.
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float facing = dot(normalize(vNormal), viewDir);
          vec4 frontColor = texture2D(uFront, vUv);
          vec4 backColor = texture2D(uBack, vec2(1.0 - vUv.x, vUv.y));
          vec4 baseColor = facing > 0.0 ? frontColor : backColor;
          // Subtle directional shading from the leaf's normal so the
          // curvature reads visually during the flip.
          float shade = 0.85 + 0.15 * abs(facing);
          gl_FragColor = vec4(baseColor.rgb * shade, 1.0);
        }
      `

      function buildLeaf(
        frontPage: PageContent,
        backPage: PageContent,
        index: number,
        isCover: boolean,
      ) {
        const pivot = new THREE.Group()
        // Tiny z-stack so leaves don't z-fight before they're flipped.
        pivot.position.set(-BOOK_WIDTH / 2, 0, -index * PAGE_DEPTH)
        bookGroup.add(pivot)

        const segments = isCover ? 1 : 32
        const geometry = new THREE.PlaneGeometry(BOOK_WIDTH, BOOK_HEIGHT, segments, 1)
        // Shift geometry so left edge is at x=0 — matches the pivot offset.
        geometry.translate(BOOK_WIDTH / 2, 0, 0)

        const material = new THREE.ShaderMaterial({
          uniforms: {
            uFlip: { value: 0 },
            uCurve: { value: isCover ? 0 : 0.18 },
            uFront: { value: makeTexture(frontPage, frontPage.side === 'cover-front') },
            uBack: { value: makeTexture(backPage, backPage.side === 'cover-front') },
          },
          vertexShader: paperVertex,
          fragmentShader: paperFragment,
          side: THREE.DoubleSide,
        })

        const mesh = new THREE.Mesh(geometry, material)
        pivot.add(mesh)

        leaves.push({ pivot, mesh, material, frontPage, backPage })
      }

      // Pair pages into leaves (each leaf has front + back). Layout:
      //   leaf 0: cover-front | page 0
      //   leaf 1: page 1      | page 2
      //   leaf 2: page 3      | page 4
      //   leaf 3: cover-back  | <empty>
      const leafPairs: Array<[PageContent, PageContent, boolean]> = [
        [COVER_FRONT, PAGES[0], true],
        [PAGES[1], PAGES[2], false],
        [PAGES[3], PAGES[4], false],
        [COVER_BACK, COVER_BACK, true],
      ]
      leafPairs.forEach(([front, back, cover], i) => {
        buildLeaf(front, back, i, cover)
      })

      // Visible page-edge stack (gives the book physical thickness).
      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xf3ead4,
        roughness: 0.65,
        metalness: 0.05,
      })
      const edgeGeo = new THREE.BoxGeometry(
        BOOK_WIDTH * 0.99,
        BOOK_HEIGHT * 0.99,
        leafPairs.length * PAGE_DEPTH * 1.2,
      )
      const edgeBlock = new THREE.Mesh(edgeGeo, edgeMat)
      edgeBlock.position.z = (-leafPairs.length * PAGE_DEPTH) / 2
      bookGroup.add(edgeBlock)

      // Animation state
      let currentLeaf = 0 // index of next leaf to flip
      const flipState = leaves.map(() => 0) // 0 = closed, 1 = flipped
      const flipTarget = leaves.map(() => 0)

      const advance = () => {
        if (currentLeaf >= leaves.length - 1) {
          // wrap back to closed
          flipTarget.forEach((_, i) => (flipTarget[i] = 0))
          currentLeaf = 0
          return
        }
        flipTarget[currentLeaf] = 1
        currentLeaf += 1
      }

      const onClick = () => {
        setHint(false)
        advance()
      }

      const onPointerEnter = () => {
        bookGroup.userData.hovered = true
      }
      const onPointerLeave = () => {
        bookGroup.userData.hovered = false
      }

      canvasRef.current.addEventListener('click', onClick)
      canvasRef.current.addEventListener('pointerenter', onPointerEnter)
      canvasRef.current.addEventListener('pointerleave', onPointerLeave)

      // Resize handler
      const resize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      const ro = new ResizeObserver(resize)
      ro.observe(container)

      // Render loop
      const clock = new THREE.Clock()
      const render = () => {
        frame = requestAnimationFrame(render)
        const t = clock.elapsedTime
        const delta = clock.getDelta()

        // Floating idle: sway the whole book on Y and a touch on X
        const hovered = bookGroup.userData.hovered === true
        bookGroup.rotation.y = Math.sin(t * 0.4) * 0.18 + (hovered ? -0.1 : 0)
        bookGroup.rotation.x = Math.sin(t * 0.32) * 0.06 + (hovered ? -0.08 : 0)
        bookGroup.position.y = Math.sin(t * 0.55) * 0.04

        // Ease each leaf toward its target flip value
        leaves.forEach((leaf, i) => {
          flipState[i] += (flipTarget[i] - flipState[i]) * Math.min(1, delta * 4)
          leaf.pivot.rotation.y = -flipState[i] * Math.PI * 0.98
          leaf.material.uniforms.uFlip.value = flipState[i]
        })

        renderer.render(scene, camera)
      }
      render()

      cleanup = () => {
        cancelAnimationFrame(frame)
        ro.disconnect()
        canvasRef.current?.removeEventListener('click', onClick)
        canvasRef.current?.removeEventListener('pointerenter', onPointerEnter)
        canvasRef.current?.removeEventListener('pointerleave', onPointerLeave)
        leaves.forEach(l => {
          l.mesh.geometry.dispose()
          l.material.dispose()
          ;(l.material.uniforms.uFront.value as import('three').Texture).dispose()
          ;(l.material.uniforms.uBack.value as import('three').Texture).dispose()
        })
        edgeGeo.dispose()
        edgeMat.dispose()
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
          Click to turn the page
        </div>
      )}
    </div>
  )
}
