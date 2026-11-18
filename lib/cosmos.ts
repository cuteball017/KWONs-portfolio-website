/**
 * Cosmos — a small, dependency-free deep-space renderer for the site background.
 *
 * It drives two canvases:
 *
 *   sky    Painted once per size: nebula haze, a Milky-Way band with dark dust lanes and
 *          thousands of faint, unresolved stars. Afterwards it only moves by a CSS transform.
 *
 *   stars  Redrawn every frame: depth-layered stars (parallax, slow drift, gentle twinkle),
 *          motion-blur streaks while the page scrolls, the occasional meteor, and the stardust
 *          the pointer stirs up inside `dustZone`.
 *
 * Everything is derived from one seed, so every visit gets its own sky while a resize
 * re-creates exactly the same one.
 */

export interface CosmosOptions {
  /** Element both canvases fill — its size is the viewport the sky is composed for. */
  root: HTMLElement
  sky: HTMLCanvasElement
  stars: HTMLCanvasElement
  /** Same seed, same sky. Defaults to a fresh one per visit. */
  seed?: number
  /** Freeze drift, twinkle and meteors (for prefers-reduced-motion). */
  still?: boolean
  /**
   * CSS selector of the area in which a moving mouse stirs up stardust.
   * Left out, the pointer only tilts the sky.
   */
  dustZone?: string
}

/* ---------------------------------------------------------------- tuning -- */

/** Extra sky height (fraction of the viewport) that scrolling slowly reveals. */
const SKY_OVERSCAN = 0.16
/** How far the sky travels per scrolled pixel before it eases out. */
const SKY_PARALLAX = 0.04

/** One animated star per this many CSS px². */
const STAR_AREA = 3900
const MIN_STARS = 130
const STAR_POOL = 900
/** Off-screen margin stars wrap around in, so they never pop at the edges. */
const WRAP_PAD = 28
/** Direction the whole field drifts in (unit vector, y points down). */
const DRIFT_X = -0.94
const DRIFT_Y = 0.34

/** Heading meteors share — one radiant, like a real shower (degrees, 90 = straight down). */
const METEOR_HEADING = 153

/** Cursor stardust: one mote per this many px the pointer travels, and how many may glow at once. */
const DUST_STEP = 3.2
const DUST_LIMIT = 560
/** Seconds a mote lives (shortest, plus a random extra) — it fades in, lingers and goes out on its own. */
const DUST_LIFE = 1.1
const DUST_LIFE_EXTRA = 1.7
/** A puff of haze every this many px ties the motes into one cloud; 0 turns the haze off. */
const MIST_STEP = 30
const MIST_ALPHA = 0.21

/** Milky-Way band: half-width, and where its core sits relative to the screen centre. */
const BAND_WIDTH = 0.068
const BAND_ALONG = 0.1
const BAND_OFFSET = 0.14

/** Star colours by temperature: white, blue-white, blue, cream, amber, orange. */
const TINTS = ["255,255,255", "218,230,255", "186,208,255", "255,243,226", "255,224,190", "255,200,164"]
const TINT_WEIGHTS = [0.32, 0.27, 0.17, 0.12, 0.08, 0.04]
const TINT_CSS = TINTS.map((tint) => `rgb(${tint})`)

/* --------------------------------------------------------------- helpers -- */

const TAU = Math.PI * 2
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

type Rand = () => number

function mulberry32(seed: number): Rand {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rand: Rand) {
  let u = 0
  while (u === 0) u = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rand())
}

function pickTint(roll: number) {
  let acc = 0
  for (let i = 0; i < TINT_WEIGHTS.length; i++) {
    acc += TINT_WEIGHTS[i]
    if (roll < acc) return i
  }
  return 0
}

/** Seeded 2D value noise with fractal (fbm) layering. */
function createNoise(rand: Rand) {
  const perm = new Uint8Array(512)
  const values = new Float32Array(256)
  for (let i = 0; i < 256; i++) {
    perm[i] = i
    values[i] = rand()
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const swap = perm[i]
    perm[i] = perm[j]
    perm[j] = swap
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i]

  const noise = (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const X = xi & 255
    const Y = yi & 255
    const a = values[perm[perm[X] + Y]]
    const b = values[perm[perm[X + 1] + Y]]
    const c = values[perm[perm[X] + Y + 1]]
    const d = values[perm[perm[X + 1] + Y + 1]]
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }

  const fbm = (x: number, y: number, octaves: number) => {
    let amplitude = 0.5
    let frequency = 1
    let sum = 0
    let norm = 0
    for (let i = 0; i < octaves; i++) {
      sum += amplitude * noise(x * frequency, y * frequency)
      norm += amplitude
      amplitude *= 0.5
      frequency *= 2.03
    }
    return sum / norm
  }

  return fbm
}

/* ------------------------------------------------------------------- sky -- */

interface Band {
  cx: number
  cy: number
  cos: number
  sin: number
  unit: number
}

/** The band climbs toward the upper right, roughly along the screen diagonal. */
function bandFor(width: number, viewHeight: number): Band {
  const unit = Math.max(width, viewHeight)
  const angle = -Math.atan2(viewHeight, width) * 0.9
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  // Push the core up and away from the centre so the hero title rests on the band's quiet edge.
  return {
    cx: width / 2 + (cos * BAND_ALONG + sin * BAND_OFFSET) * unit,
    cy: viewHeight / 2 + (sin * BAND_ALONG - cos * BAND_OFFSET) * unit,
    cos,
    sin,
    unit,
  }
}

/** The band swells around its core and thins out toward the ends. */
const bandWidthAt = (s: number) => BAND_WIDTH * (1 + 0.9 * Math.exp(-((s / 0.27) ** 2)))

/**
 * Paints the static deep-sky layer. The expensive part (nebula noise) runs at low resolution
 * in small time slices so it never blocks a frame; the result is blitted in one go at the end.
 * Returns a cancel function.
 */
function paintSky(
  target: HTMLCanvasElement,
  width: number,
  height: number,
  viewHeight: number,
  ratio: number,
  seed: number,
  done: () => void,
) {
  const rand = mulberry32(seed)
  const fbm = createNoise(rand)
  const band = bandFor(width, viewHeight)
  const unit = band.unit

  const scale = 340 / Math.max(width, height)
  const lw = Math.max(2, Math.round(width * scale))
  const lh = Math.max(2, Math.round(height * scale))
  const low = document.createElement("canvas")
  low.width = lw
  low.height = lh
  const lowCtx = low.getContext("2d")
  if (!lowCtx) return () => {}
  const image = lowCtx.createImageData(lw, lh)
  const px = image.data

  // Darkness of the dust lanes that split the band (0 = clear, 1 = opaque).
  const laneAt = (s: number, d: number, wobble: number, bandWidth: number) =>
    smoothstep(0.5, 0.74, fbm(s * 5.5 + 31.7, d * 13 + wobble * 1.5 + 5.3, 4)) *
    Math.exp(-((d / (bandWidth * 0.55)) ** 2))

  let row = 0
  let timer = 0
  let cancelled = false

  const shadeRow = (y: number) => {
    const Y = ((y + 0.5) / lh) * height
    for (let x = 0; x < lw; x++) {
      const X = ((x + 0.5) / lw) * width
      const wx = X / unit
      const wy = Y / unit

      // Domain-warped noise gives wispy filaments instead of round blobs.
      const qx = fbm(wx * 2.1 + 5.2, wy * 2.1 + 1.3, 3)
      const qy = fbm(wx * 2.1 + 9.7, wy * 2.1 + 6.1, 3)
      const wisps = fbm(wx * 3.1 + qx * 2.2, wy * 3.1 + qy * 2.2, 5)

      // Position in band space: s runs along the band, d across it.
      const dx = X - band.cx
      const dy = Y - band.cy
      const s = (dx * band.cos + dy * band.sin) / unit
      const d = (-dx * band.sin + dy * band.cos) / unit + (qx - 0.5) * 0.07
      const bandWidth = bandWidthAt(s)

      const body = Math.exp(-((d / bandWidth) ** 2)) * Math.exp(-((s / 0.95) ** 2))
      const core = Math.exp(-((s / 0.25) ** 2) - (d / (BAND_WIDTH * 1.3)) ** 2)
      const lane = laneAt(s, d, qy, bandWidth)

      let glow = body * (0.18 + 0.82 * smoothstep(0.32, 0.72, wisps)) + core * 0.55
      glow *= 1 - 0.72 * lane
      const haze = smoothstep(0.5, 0.85, fbm(wx * 1.6 + 40.1, wy * 1.6 + 80.6, 3)) * (1 - body)

      // Blue is the base; indigo and teal drift in and out, only the core turns to pale white.
      const indigo = smoothstep(0.44, 0.72, fbm(wx * 1.4 + 120.3, wy * 1.4 + 210.9, 2))
      const teal = smoothstep(0.56, 0.8, fbm(wx * 2.2 + 300.5, wy * 2.2 + 410.2, 2)) * 0.5
      const pale = clamp(core * 0.8 + glow * 0.08, 0, 0.85)

      const o = (y * lw + x) * 4
      px[o] = mix(mix(mix(40, 84, indigo), 30, teal), 196, pale)
      px[o + 1] = mix(mix(mix(98, 96, indigo), 160, teal), 214, pale)
      px[o + 2] = mix(mix(mix(224, 232, indigo), 212, teal), 255, pale)
      px[o + 3] = clamp(glow * 0.38 + haze * 0.085, 0, 0.7) * 255
    }
  }

  const finish = () => {
    lowCtx.putImageData(image, 0, 0)

    target.width = Math.round(width * ratio)
    target.height = Math.round(height * ratio)
    const ctx = target.getContext("2d")
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(low, 0, 0, width, height)

    // Unresolved stars crowding the band — the grain of the Milky Way. Dust lanes stay emptier.
    const dust = Math.round((width * height) / 280)
    for (let i = 0; i < dust; i++) {
      const s = (rand() * 2 - 1) * 0.95
      const bandWidth = bandWidthAt(s)
      const d = gaussian(rand) * bandWidth * 0.66
      const x = band.cx + (s * band.cos - d * band.sin) * unit
      const y = band.cy + (s * band.sin + d * band.cos) * unit
      const m = rand() ** 2.4
      const tint = pickTint(rand())
      if (x < 0 || x > width || y < 0 || y > height) continue
      if (rand() < laneAt(s, d, 0.5, bandWidth) * 0.85) continue
      const size = 0.6 + m * 0.85
      ctx.globalAlpha = 0.16 + m * 0.6
      ctx.fillStyle = TINT_CSS[tint]
      ctx.fillRect(x, y, size, size)
    }

    // Faint field stars everywhere else — the far backdrop that never moves on its own.
    const field = Math.round((width * height) / 1500)
    for (let i = 0; i < field; i++) {
      const m = rand() ** 2.2
      const size = 0.5 + m * 0.8
      ctx.globalAlpha = 0.12 + m * 0.45
      ctx.fillStyle = TINT_CSS[pickTint(rand())]
      ctx.fillRect(rand() * width, rand() * height, size, size)
    }

    // A whisper of film grain: dithers the gradients so they never band.
    const grain = document.createElement("canvas")
    grain.width = grain.height = 128
    const grainCtx = grain.getContext("2d")
    if (grainCtx) {
      const speckle = grainCtx.createImageData(128, 128)
      for (let i = 0; i < speckle.data.length; i += 4) {
        const v = rand() < 0.5 ? 0 : 255
        speckle.data[i] = speckle.data[i + 1] = speckle.data[i + 2] = v
        speckle.data[i + 3] = rand() * 9
      }
      grainCtx.putImageData(speckle, 0, 0)
      const pattern = ctx.createPattern(grain, "repeat")
      if (pattern) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalAlpha = 1
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, target.width, target.height)
      }
    }

    done()
  }

  const step = () => {
    if (cancelled) return
    const until = performance.now() + 7
    while (row < lh && performance.now() < until) shadeRow(row++)
    if (row < lh) timer = window.setTimeout(step, 0)
    else finish()
  }
  timer = window.setTimeout(step, 0)

  return () => {
    cancelled = true
    window.clearTimeout(timer)
  }
}

/* ----------------------------------------------------------------- stars -- */

interface Star {
  u: number
  v: number
  /** 0 = far away, 1 = close. Drives size, parallax and drift speed. */
  depth: number
  radius: number
  alpha: number
  tint: number
  twinkle: number
  rate: number
  phase: number
  /** 0 = plain point, 1 = soft halo, 2 = halo with diffraction spikes. */
  flare: 0 | 1 | 2
}

interface Meteor {
  x: number
  y: number
  dx: number
  dy: number
  speed: number
  length: number
  width: number
  age: number
  life: number
}

/** A grain of the stardust that trails the pointer. Lives in screen space, not in the star field. */
interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  tint: number
  age: number
  life: number
  rate: number
  phase: number
  flare: 0 | 1 | 2
}

/** A breath of faint haze left along the trail. */
interface Puff {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  age: number
  life: number
}

function createStars(rand: Rand): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < STAR_POOL; i++) {
    const depth = rand()
    // Magnitudes follow a steep curve: a sky full of faint stars and only a handful of bright ones.
    const magnitude = rand() ** 3.4
    stars.push({
      u: rand(),
      v: rand(),
      depth,
      radius: 0.45 + magnitude * 1.25 + depth * 0.25,
      alpha: 0.34 + magnitude * 0.56 + depth * 0.1,
      tint: pickTint(rand()),
      twinkle: 0.1 + rand() * 0.26,
      rate: 0.5 + rand() * 1.1,
      phase: rand() * TAU,
      flare: magnitude > 0.93 ? 2 : magnitude > 0.8 ? 1 : 0,
    })
  }
  return stars
}

function createFlare(tint: string, spikes: boolean) {
  const size = 96
  const half = size / 2
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const halo = ctx.createRadialGradient(half, half, 0, half, half, half)
  halo.addColorStop(0, `rgba(${tint},0.85)`)
  halo.addColorStop(0.07, `rgba(${tint},0.4)`)
  halo.addColorStop(0.3, `rgba(${tint},0.09)`)
  halo.addColorStop(1, `rgba(${tint},0)`)
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, size, size)

  if (spikes) {
    const across = ctx.createLinearGradient(0, 0, size, 0)
    const down = ctx.createLinearGradient(0, 0, 0, size)
    for (const ray of [across, down]) {
      ray.addColorStop(0, `rgba(${tint},0)`)
      ray.addColorStop(0.5, `rgba(${tint},0.5)`)
      ray.addColorStop(1, `rgba(${tint},0)`)
    }
    ctx.fillStyle = across
    ctx.fillRect(0, half - 0.6, size, 1.2)
    ctx.fillStyle = down
    ctx.fillRect(half - 0.6, 0, 1.2, size)
  }
  return canvas
}

/** Soft, structureless glow used for the haze of the stardust trail. */
function createMist() {
  const size = 128
  const half = size / 2
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const glow = ctx.createRadialGradient(half, half, 0, half, half, half)
  glow.addColorStop(0, "rgba(168,198,255,0.55)")
  glow.addColorStop(0.35, "rgba(126,164,255,0.24)")
  glow.addColorStop(0.7, "rgba(96,140,255,0.07)")
  glow.addColorStop(1, "rgba(96,140,255,0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
  return canvas
}

/* ---------------------------------------------------------------- engine -- */

/** Starts the renderer and returns a function that stops it and releases every listener. */
export function createCosmos({ root, sky, stars, seed, still = false, dustZone }: CosmosOptions): () => void {
  const ctx = stars.getContext("2d")
  if (!ctx) return () => {}

  const skySeed = seed ?? (Math.random() * 0xffffffff) >>> 0
  const pool = createStars(mulberry32(skySeed ^ 0x9e3779b9))
  const halos = TINTS.map((tint) => createFlare(tint, false))
  const spiked = TINTS.map((tint) => createFlare(tint, true))
  const meteorHead = createFlare("226,238,255", false)
  const meteors: Meteor[] = []
  const motes: Mote[] = []
  const mist: Puff[] = []
  const mistSprite = createMist()

  let width = 0
  let height = 0
  let dpr = 1
  let count = 0
  let skyDrop = 0
  let skyShift = -1

  let frame = 0
  let last = 0
  let born = 0
  let time = 0
  let nextMeteor = 2.4 + Math.random() * 2

  let scrollTarget = window.scrollY
  let scroll = scrollTarget
  let pointerTargetX = 0
  let pointerTargetY = 0
  let pointerX = 0
  let pointerY = 0

  // Stardust trail: where the mouse is now, and where the last batch of motes ended.
  let zone: Element | null = null
  let trailX = 0
  let trailY = 0
  let trailFromX = 0
  let trailFromY = 0
  let trailMoved = false
  let trailing = false
  let trailCarry = 0
  let mistCarry = 0

  let cancelPaint = () => {}
  let paintTimer = 0
  let painted = false

  const paint = () => {
    cancelPaint()
    const skyHeight = height + skyDrop
    // Cap the backing store so very large screens don't pay for pixels nobody can tell apart.
    const ratio = Math.min(dpr, Math.sqrt(4.5e6 / (width * skyHeight)))
    cancelPaint = paintSky(sky, width, skyHeight, height, ratio, skySeed, () => {
      painted = true
      sky.dataset.ready = "true"
    })
  }

  const resize = () => {
    const rect = root.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    if (w === width && h === height) return
    width = w
    height = h
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    stars.width = Math.round(width * dpr)
    stars.height = Math.round(height * dpr)
    count = clamp(Math.round((width * height) / STAR_AREA), MIN_STARS, pool.length)
    skyDrop = Math.round(height * SKY_OVERSCAN)
    skyShift = -1
    sky.style.height = `${height + skyDrop}px`

    // The first sky is painted right away; while a window is being dragged we wait for it to settle.
    window.clearTimeout(paintTimer)
    if (painted) paintTimer = window.setTimeout(paint, 180)
    else paint()
  }

  const spawnMeteor = (leader?: Meteor) => {
    const heading = ((METEOR_HEADING + (Math.random() - 0.5) * 16) * Math.PI) / 180
    const size = clamp(Math.max(width, height) / 1440, 0.6, 1.3)
    const meteor: Meteor = {
      x: leader ? leader.x + (Math.random() - 0.3) * 260 : width * (0.3 + Math.random() * 0.8),
      y: leader ? leader.y - 40 - Math.random() * 120 : height * (-0.05 + Math.random() * 0.4),
      dx: Math.cos(heading),
      dy: Math.sin(heading),
      speed: (560 + Math.random() * 380) * size,
      length: (120 + Math.random() * 160) * size,
      width: 1.1 + Math.random() * 0.7,
      age: 0,
      life: 0.9 + Math.random() * 0.8,
    }
    meteors.push(meteor)
    return meteor
  }

  const drawMeteors = (dt: number) => {
    ctx.lineCap = "round"
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]
      m.age += dt
      const p = m.age / m.life
      if (p >= 1) {
        meteors.splice(i, 1)
        continue
      }
      m.x += m.dx * m.speed * dt
      m.y += m.dy * m.speed * dt

      // Brightens quickly, lingers, then burns out — never a hard start or stop.
      const glow = smoothstep(0, 0.18, p) * (1 - smoothstep(0.5, 1, p))
      const tail = m.length * smoothstep(0, 0.3, p)
      const tx = m.x - m.dx * tail
      const ty = m.y - m.dy * tail

      const trail = ctx.createLinearGradient(tx, ty, m.x, m.y)
      trail.addColorStop(0, "rgba(147,197,253,0)")
      trail.addColorStop(0.55, `rgba(147,197,253,${0.22 * glow})`)
      trail.addColorStop(1, `rgba(236,244,255,${0.95 * glow})`)
      ctx.globalAlpha = 1
      ctx.strokeStyle = trail
      ctx.lineWidth = m.width
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(m.x, m.y)
      ctx.stroke()

      const head = 16 + m.width * 6
      ctx.globalAlpha = glow * 0.9
      ctx.drawImage(meteorHead, m.x - head / 2, m.y - head / 2, head, head)
    }
  }

  const inDustZone = (x: number, y: number) => {
    if (!dustZone) return false
    // The zone may mount after the engine starts (the hero waits for the loader), so look it up lazily.
    if (!zone?.isConnected) zone = document.querySelector(dustZone)
    if (!zone) return false
    const rect = zone.getBoundingClientRect()
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  /** Scatters motes along the stretch the mouse covered since the last frame. */
  const stirDust = (dt: number) => {
    if (!trailMoved) return
    trailMoved = false
    if (!inDustZone(trailX, trailY)) {
      trailing = false
      return
    }

    const dx = trailX - trailFromX
    const dy = trailY - trailFromY
    const distance = Math.hypot(dx, dy)
    // Entering the zone, or a jump too long to be one stroke: start a fresh trail from here.
    if (!trailing || distance > 260) {
      trailing = true
      trailFromX = trailX
      trailFromY = trailY
      trailCarry = 0
      mistCarry = 0
      return
    }
    if (distance < 0.5) return

    trailCarry += distance
    const batch = Math.min(Math.floor(trailCarry / DUST_STEP), 22)
    trailCarry = Math.min(trailCarry - batch * DUST_STEP, DUST_STEP)

    const ux = dx / distance
    const uy = dy / distance
    const speed = Math.min(distance / dt, 1800)
    for (let i = 0; i < batch; i++) {
      const t = (i + Math.random()) / batch
      const magnitude = Math.random() ** 2.6
      // A loose cloud around the path: most motes hug it, a few stray further out.
      const across = (Math.random() + Math.random() + Math.random() - 1.5) * (18 + speed * 0.014)
      const along = (Math.random() - 0.5) * DUST_STEP * 3
      // Each keeps a little of the mouse's momentum, so the cloud seems to follow before it settles.
      const carry = speed * (0.05 + Math.random() * 0.17)
      const wander = Math.random() * TAU
      const stray = 3 + Math.random() * 11

      if (motes.length >= DUST_LIMIT) motes.shift()
      motes.push({
        x: trailFromX + dx * t + ux * along - uy * across,
        y: trailFromY + dy * t + uy * along + ux * across,
        vx: ux * carry + Math.cos(wander) * stray,
        vy: uy * carry + Math.sin(wander) * stray,
        radius: 0.55 + magnitude * 1.25,
        alpha: 0.55 + magnitude * 0.45,
        tint: pickTint(Math.random() * 0.9),
        age: 0,
        life: DUST_LIFE + Math.random() * DUST_LIFE_EXTRA,
        rate: 3 + Math.random() * 6,
        phase: Math.random() * TAU,
        flare: magnitude > 0.84 ? 2 : magnitude > 0.42 ? 1 : 0,
      })
    }

    if (MIST_STEP) {
      mistCarry += distance
      while (mistCarry >= MIST_STEP) {
        mistCarry -= MIST_STEP
        const carry = speed * (0.04 + Math.random() * 0.06)
        if (mist.length >= 48) mist.shift()
        mist.push({
          x: trailX + (Math.random() - 0.5) * 18,
          y: trailY + (Math.random() - 0.5) * 18,
          vx: ux * carry,
          vy: uy * carry,
          size: 90 + Math.random() * 70,
          age: 0,
          life: 1.4 + Math.random() * 1.1,
        })
      }
    }

    trailFromX = trailX
    trailFromY = trailY
  }

  const drawDust = (dt: number, lift: number) => {
    const drag = Math.exp(-dt * 2.6)

    for (let i = mist.length - 1; i >= 0; i--) {
      const puff = mist[i]
      puff.age += dt
      const p = puff.age / puff.life
      if (p >= 1) {
        mist.splice(i, 1)
        continue
      }
      puff.vx *= drag
      puff.vy *= drag
      puff.x += puff.vx * dt
      puff.y += puff.vy * dt - lift
      // The haze swells a little as it thins out.
      const size = puff.size * (0.8 + 0.4 * p)
      ctx.globalAlpha = MIST_ALPHA * smoothstep(0, 0.3, p) * (1 - smoothstep(0.3, 1, p))
      ctx.drawImage(mistSprite, puff.x - size / 2, puff.y - size / 2, size, size)
    }

    for (let i = motes.length - 1; i >= 0; i--) {
      const mote = motes[i]
      mote.age += dt
      const p = mote.age / mote.life
      if (p >= 1) {
        motes.splice(i, 1)
        continue
      }
      mote.vx *= drag
      mote.vy *= drag
      mote.x += mote.vx * dt
      mote.y += mote.vy * dt - lift

      // Kindles softly, glows for a moment, then goes out by itself.
      const glow = smoothstep(0, 0.22, p) * (1 - smoothstep(0.34, 1, p))
      const alpha = mote.alpha * glow * (0.8 + 0.2 * Math.sin(time * mote.rate + mote.phase))
      ctx.globalAlpha = alpha
      ctx.fillStyle = TINT_CSS[mote.tint]
      ctx.beginPath()
      ctx.arc(mote.x, mote.y, mote.radius, 0, TAU)
      ctx.fill()

      if (mote.flare) {
        const size = mote.radius * (mote.flare === 2 ? 21 : 13)
        ctx.globalAlpha = alpha * 0.65
        ctx.drawImage((mote.flare === 2 ? spiked : halos)[mote.tint], mote.x - size / 2, mote.y - size / 2, size, size)
      }
    }
  }

  const render = (now: number) => {
    frame = requestAnimationFrame(render)
    if (!born) born = last = now
    const dt = clamp((now - last) / 1000, 0.001, 0.05)
    last = now
    if (!still) time += dt

    // Inputs glide toward their targets so the sky always trails the page a little.
    const before = scroll
    scroll += (scrollTarget - scroll) * (1 - Math.exp(-dt * 10))
    if (Math.abs(scrollTarget - scroll) < 0.02) scroll = scrollTarget
    const velocity = still ? 0 : (scroll - before) / dt
    const follow = 1 - Math.exp(-dt * 3)
    pointerX += (pointerTargetX - pointerX) * follow
    pointerY += (pointerTargetY - pointerY) * follow

    // The far sky barely moves, and eases to a stop instead of running out of canvas.
    const shift = Math.round(skyDrop * (1 - Math.exp((-scroll * SKY_PARALLAX) / Math.max(1, skyDrop))) * 10) / 10
    if (shift !== skyShift) {
      skyShift = shift
      sky.style.transform = `translate3d(0, ${-shift}px, 0)`
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const fieldW = width + WRAP_PAD * 2
    const fieldH = height + WRAP_PAD * 2
    const intro = smoothstep(0, 1, (now - born) / 2400)
    ctx.lineCap = "round"

    for (let i = 0; i < count; i++) {
      const star = pool[i]
      const parallax = 0.03 + star.depth * 0.13
      const sway = 4 + star.depth * 15
      const drift = (0.5 + star.depth * 2.4) * time

      let x = star.u * fieldW + DRIFT_X * drift - pointerX * sway
      let y = star.v * fieldH + DRIFT_Y * drift - pointerY * sway - scroll * parallax
      x = (((x % fieldW) + fieldW) % fieldW) - WRAP_PAD
      y = (((y % fieldH) + fieldH) % fieldH) - WRAP_PAD

      const pulse = 1 - star.twinkle * (0.5 + 0.5 * Math.sin(time * star.rate + star.phase))
      const alpha = star.alpha * pulse * intro

      // Scrolling smears stars along their path of travel, nearer ones further. As in real motion
      // blur the same light is spread over a longer trace, so a streak is fainter than the point.
      const smear = clamp(velocity * parallax * 0.015, -14, 14)
      if (smear > 0.8 || smear < -0.8) {
        const spread = star.radius * 2
        ctx.globalAlpha = alpha * Math.sqrt(spread / (spread + Math.abs(smear)))
        ctx.strokeStyle = TINT_CSS[star.tint]
        ctx.lineWidth = star.radius * 1.7
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + smear)
        ctx.stroke()
      } else {
        ctx.globalAlpha = alpha
        ctx.fillStyle = TINT_CSS[star.tint]
        ctx.beginPath()
        ctx.arc(x, y, star.radius, 0, TAU)
        ctx.fill()
      }

      if (star.flare) {
        const size = star.radius * (star.flare === 2 ? 20 : 13) * (0.85 + 0.15 * pulse)
        ctx.globalAlpha = alpha * 0.6
        ctx.drawImage((star.flare === 2 ? spiked : halos)[star.tint], x - size / 2, y - size / 2, size, size)
      }
    }

    if (!still) {
      stirDust(dt)
      // Stardust belongs to the foreground: while the page scrolls it rides along with it a little.
      drawDust(dt, (scroll - before) * 0.3)

      if (time >= nextMeteor) {
        const leader = spawnMeteor()
        // Now and then a second one follows close behind.
        if (Math.random() < 0.14) window.setTimeout(() => frame && spawnMeteor(leader), 280 + Math.random() * 320)
        nextMeteor = time + 4 + Math.random() * 6.5
      }
      drawMeteors(dt)
    }
    ctx.globalAlpha = 1
  }

  const onScroll = () => {
    // The mobile menu pins <body> to lock scrolling, which reports scrollY as 0 — ignore that jump.
    if (document.body.style.position === "fixed") return
    scrollTarget = window.scrollY
  }
  const onPointer = (event: PointerEvent) => {
    if (still || event.pointerType !== "mouse") return
    pointerTargetX = (event.clientX / width) * 2 - 1
    pointerTargetY = (event.clientY / height) * 2 - 1
    trailX = event.clientX
    trailY = event.clientY
    trailMoved = true
  }

  const observer = new ResizeObserver(resize)
  observer.observe(root)
  resize()
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("pointermove", onPointer, { passive: true })
  frame = requestAnimationFrame(render)

  return () => {
    cancelAnimationFrame(frame)
    frame = 0
    cancelPaint()
    window.clearTimeout(paintTimer)
    observer.disconnect()
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("pointermove", onPointer)
  }
}
