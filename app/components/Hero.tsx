'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

function DepthCounter({ value }: { value: MotionValue<number> }) {
  const ref = useRef<HTMLSpanElement>(null)
  useMotionValueEvent(value, 'change', v => {
    if (ref.current) ref.current.textContent = Math.round(v).toString().padStart(3, '0')
  })
  return <span ref={ref}>000</span>
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animId = 0
    let cleanup: (() => void) | undefined

    const boot = async () => {
      const THREE   = await import('three')
      const { Sky }   = await import('three/examples/jsm/objects/Sky.js')
      const { Water } = await import('three/examples/jsm/objects/Water.js')

      const canvas = canvasRef.current
      if (!canvas) return

      const W = window.innerWidth
      const H = window.innerHeight

      // ── Renderer ──────────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.toneMapping      = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.55
      renderer.shadowMap.enabled = false

      // ── Scene + Camera ───────────────────────────────────────────────────
      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.5, 20000)
      camera.position.set(0, 2.5, 60)
      camera.lookAt(0, 0, 0)

      // ── Sun ───────────────────────────────────────────────────────────────
      const sun = new THREE.Vector3()

      // ── Sky ───────────────────────────────────────────────────────────────
      const sky = new Sky()
      sky.scale.setScalar(10000)
      scene.add(sky)
      const skyU = sky.material.uniforms
      skyU['turbidity'].value        = 8
      skyU['rayleigh'].value         = 1.8
      skyU['mieCoefficient'].value   = 0.003
      skyU['mieDirectionalG'].value  = 0.92

      const updateSun = (elevation: number) => {
        const phi   = THREE.MathUtils.degToRad(90 - elevation)
        const theta = THREE.MathUtils.degToRad(185)
        sun.setFromSphericalCoords(1, phi, theta)
        skyU['sunPosition'].value.copy(sun)
        if (water) water.material.uniforms['sunDirection'].value.copy(sun.clone().normalize())
      }
      updateSun(4)          // low sun — cinematic golden/blue horizon

      // ── Water ─────────────────────────────────────────────────────────────
      const waterGeometry = new THREE.PlaneGeometry(12000, 12000)
      const water = new Water(waterGeometry, {
        textureWidth:   512,
        textureHeight:  512,
        waterNormals: new THREE.TextureLoader().load(
          'https://threejs.org/examples/textures/waternormals.jpg',
          tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping },
        ),
        sunDirection: sun.clone().normalize(),
        sunColor:     0xffffff,
        waterColor:   0x004466,
        distortionScale: 4.2,
        fog:          false,
      })
      water.rotation.x = -Math.PI / 2
      scene.add(water)

      // ── Underwater overlay quad (hides sky reflection below surface) ──────
      const uwGeo = new THREE.PlaneGeometry(2, 2)
      const uwMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x001428),
        transparent: true,
        opacity: 0,
        depthTest: false,
      })
      const uwQuad = new THREE.Mesh(uwGeo, uwMat)
      uwQuad.renderOrder = 999
      const uwCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
      const uwScene = new THREE.Scene()
      uwScene.add(uwQuad)

      // Caustic light overlay (shimmer lines underwater)
      const causticsScene = new THREE.Scene()
      const causticsGeo = new THREE.PlaneGeometry(2, 2)
      const causticsVert = `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `
      const causticsFrag = `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
        }
        void main() {
          vec2 uv = vUv * 4.0;
          float n = noise(uv + uTime * 0.4) * noise(uv * 1.3 - uTime * 0.3);
          float c = pow(n, 3.0) * 0.35;
          gl_FragColor = vec4(0.1, 0.55, 0.75, c * uOpacity);
        }
      `
      const causticsMat = new THREE.ShaderMaterial({
        vertexShader: causticsVert,
        fragmentShader: causticsFrag,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
        transparent: true,
        depthTest: false,
      })
      const causticsMesh = new THREE.Mesh(causticsGeo, causticsMat)
      causticsScene.add(causticsMesh)

      // ── Scroll state ─────────────────────────────────────────────────────
      const state = { progress: 0 }
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   1.5,
        onUpdate: self => { state.progress = self.progress },
      })

      // ── Render loop ────────────────────────────────────────────────────────
      const clock = new THREE.Clock()
      const render = () => {
        animId = requestAnimationFrame(render)
        const t = clock.getElapsedTime()
        const p = state.progress

        // Animate water
        water.material.uniforms['time'].value += 0.5 / 60

        causticsMat.uniforms.uTime.value = t

        // Camera dives from y=2.5 → y=-30 over the full scroll
        const camY = 2.5 - p * 32.5
        camera.position.y = camY

        // Tilt camera slightly downward as it descends
        const tiltX = p * 0.12
        camera.rotation.x = -tiltX

        // Overlay + caustics transition around the waterline
        const uwProgress = THREE.MathUtils.clamp(-camY / 3, 0, 1) // 0 above, 1 when 3m below

        uwMat.opacity            = uwProgress * 0.88
        causticsMat.uniforms.uOpacity.value = uwProgress

        // Sky: hide below waterline
        sky.visible  = camY > -1
        water.visible = camY > -8

        // Update sun elevation based on scroll (sun dips as you go deeper)
        updateSun(4 - p * 6)

        // Fog deepens underwater
        if (camY < 0) {
          scene.fog = new THREE.FogExp2(0x001020, 0.008 + (-camY) * 0.0015)
        } else {
          scene.fog = null
        }

        renderer.autoClear = true
        renderer.render(scene, camera)

        // Composite underwater overlays
        renderer.autoClear = false
        renderer.clearDepth()
        renderer.render(uwScene, uwCam)
        renderer.render(causticsScene, uwCam)
        renderer.autoClear = true
      }
      render()

      // ── Resize ────────────────────────────────────────────────────────────
      const onResize = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      cleanup = () => {
        cancelAnimationFrame(animId)
        st.kill()
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        waterGeometry.dispose()
        water.material.dispose()
        uwGeo.dispose()
        uwMat.dispose()
        causticsGeo.dispose()
        causticsMat.dispose()
      }
    }

    boot()
    return () => { cleanup?.() }
  }, [])

  // ── Framer Motion scroll transforms ──────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset:  ['start start', 'end end'],
  })

  const hintOp  = useTransform(scrollYProgress, [0, 0.06], [1, 0])
  const depthVis = useTransform(scrollYProgress, [0.0, 0.05], [0, 1])
  const depthVal = useTransform(scrollYProgress, [0, 1], [0, 280])

  // Phase 1 — STRATEGY (visible above water)
  const p1Op = useTransform(scrollYProgress, [0.04, 0.15, 0.26, 0.34], [0, 1, 1, 0])
  const p1Y  = useTransform(scrollYProgress, [0.04, 0.15], [30, 0])

  // Phase 2 — THE GAP (at the waterline)
  const p2Op = useTransform(scrollYProgress, [0.38, 0.46, 0.55, 0.62], [0, 1, 1, 0])

  // Phase 3 — EXECUTION (deep underwater)
  const p3Op = useTransform(scrollYProgress, [0.64, 0.72, 0.80, 0.86], [0, 1, 1, 0])
  const p3Y  = useTransform(scrollYProgress, [0.64, 0.72], [30, 0])

  // Phase 4 — Headline + CTAs
  const p4Op = useTransform(scrollYProgress, [0.88, 0.96], [0, 1])
  const p4Y  = useTransform(scrollYProgress, [0.88, 0.96], [24, 0])

  return (
    <section ref={containerRef} style={{ position: 'relative', height: '520vh' }}>
      <div style={{
        position: 'sticky', top: 0, width: '100%', height: '100dvh',
        overflow: 'hidden', background: '#001020',
      }}>

        {/* ── Three.js canvas ── */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        />

        {/* ── Vignette ── */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,10,20,0.5) 100%)',
        }} />

        {/* ── HUD: top-left ── */}
        <div style={{
          position: 'absolute', top: 28, left: 'var(--section-x)',
          pointerEvents: 'none', userSelect: 'none', zIndex: 10,
        }}>
          <div className="hud-label" style={{ marginBottom: 4 }}>Ali Al-Ali</div>
          <div className="hud-value">Strategy · Execution</div>
        </div>

        {/* ── HUD: top-right — depth ── */}
        <motion.div style={{
          opacity: depthVis,
          position: 'absolute', top: 28, right: 'var(--section-x)',
          textAlign: 'right', pointerEvents: 'none', userSelect: 'none', zIndex: 10,
        }}>
          <div className="hud-label" style={{ marginBottom: 4 }}>Execution Depth</div>
          <div className="hud-value"><DepthCounter value={depthVal} /> m</div>
        </motion.div>

        {/* ── Scroll hint ── */}
        <motion.div style={{
          opacity: hintOp,
          position: 'absolute', bottom: 36, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          pointerEvents: 'none', userSelect: 'none',
        }}>
          <span style={{
            fontSize: 9, letterSpacing: '0.55em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', fontFamily: "'Rajdhani', monospace",
          }}>
            Dive Deeper
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              width: 1, height: 44,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
            }}
          />
        </motion.div>

        {/* ── Phase 1: STRATEGY ── */}
        <motion.div style={{
          opacity: p1Op, y: p1Y,
          position: 'absolute', top: 'clamp(72px,15vh,120px)',
          left: 0, right: 0, textAlign: 'center',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 9,
            letterSpacing: '0.6em', textTransform: 'uppercase',
            fontFamily: "'Rajdhani', monospace", marginBottom: 12,
          }}>The visible part</p>
          <h2 style={{
            color: '#ffffff', fontWeight: 700,
            fontSize: 'var(--text-hero)', letterSpacing: '-0.03em', lineHeight: 1,
            textShadow: '0 2px 40px rgba(0,0,0,0.4)',
          }}>Strategy</h2>
        </motion.div>

        {/* ── Phase 2: THE EXECUTION GAP ── */}
        <motion.div style={{
          opacity: p2Op,
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          <div style={{
            width: 1, height: 52,
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))',
            marginBottom: 16,
          }} />
          <p style={{
            fontSize: 11, letterSpacing: '0.7em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.8)', fontFamily: "'Rajdhani', monospace",
            fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            The&ensp;Execution&ensp;Gap
          </p>
          <div style={{
            width: 1, height: 52,
            background: 'linear-gradient(to top, transparent, rgba(255,255,255,0.6))',
            marginTop: 16,
          }} />
        </motion.div>

        {/* ── Phase 3: EXECUTION ── */}
        <motion.div style={{
          opacity: p3Op, y: p3Y,
          position: 'absolute', bottom: 'clamp(72px,15vh,120px)',
          left: 0, right: 0, textAlign: 'center',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          <h2 style={{
            color: '#94E6FB', fontWeight: 700,
            fontSize: 'var(--text-hero)', letterSpacing: '-0.03em', lineHeight: 1,
            textShadow: '0 0 80px rgba(148,230,251,0.3)',
          }}>Execution</h2>
          <p style={{
            color: 'rgba(148,230,251,0.5)', fontSize: 9,
            letterSpacing: '0.6em', textTransform: 'uppercase',
            fontFamily: "'Rajdhani', monospace", marginTop: 14,
          }}>The hidden reality</p>
        </motion.div>

        {/* ── Phase 4: Headline + CTAs ── */}
        <motion.div style={{
          opacity: p4Op, y: p4Y,
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 var(--section-x)',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          <p style={{
            color: 'rgba(148,230,251,0.6)', fontSize: 9,
            letterSpacing: '0.5em', textTransform: 'uppercase',
            fontFamily: "'Rajdhani', monospace", marginBottom: 22,
          }}>Ali Al-Ali</p>
          <h1 style={{
            color: '#ffffff', fontWeight: 300, textAlign: 'center',
            lineHeight: 1.18, letterSpacing: '-0.025em',
            maxWidth: 760, fontSize: 'clamp(26px, 4.2vw, 56px)',
            textShadow: '0 2px 30px rgba(0,0,0,0.5)',
          }}>
            Bridging the{' '}
            <span style={{ fontWeight: 700 }}>Strategy&nbsp;to&nbsp;Execution</span>
            {' '}Gap
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.45)', textAlign: 'center',
            fontWeight: 300, lineHeight: 1.75, maxWidth: 420,
            marginTop: 20, fontSize: 'clamp(13px, 1.25vw, 15px)',
          }}>
            Executive advisory, coaching, and digital programs for leaders
            who want real results — not just plans.
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 12,
            marginTop: 40, pointerEvents: 'auto',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <a href="#book" style={{
              background: '#E5FAFF', color: '#04111f',
              fontWeight: 700, fontSize: 11, padding: '14px 36px',
              borderRadius: 2, textDecoration: 'none',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              fontFamily: "'Rajdhani', monospace",
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              Work With Ali
            </a>
            <a href="#about" style={{
              color: 'rgba(229,250,255,0.75)', fontWeight: 500, fontSize: 11,
              padding: '13px 34px', borderRadius: 2, textDecoration: 'none',
              border: '1px solid rgba(148,230,251,0.3)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              fontFamily: "'Rajdhani', monospace",
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(148,230,251,0.65)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148,230,251,0.3)' }}
            >
              Explore More ↓
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
