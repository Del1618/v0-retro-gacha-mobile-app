import { PNG } from "pngjs"
import { readFileSync, writeFileSync } from "node:fs"

const SRC = "public/dwarf-frames.png"
const OUT = ["dwarf_idle", "dwarf_up", "dwarf_down", "dwarf_strike"]
const THRESHOLD = 60
const MIN_GAP = 6 // empty-column run that separates two frames
const MIN_W = 40 // ignore stray specks narrower than this

const src = PNG.sync.read(readFileSync(SRC))
const { width: W, height: H, data } = src
const sidx = (x, y) => (y * W + x) * 4

// 1) Flood-fill the connected near-black background to transparent.
const isDark = (x, y) => {
  const i = sidx(x, y)
  return data[i] <= THRESHOLD && data[i + 1] <= THRESHOLD && data[i + 2] <= THRESHOLD
}
const visited = new Uint8Array(W * H)
const stack = []
const pushIf = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return
  const p = y * W + x
  if (visited[p]) return
  visited[p] = 1
  if (isDark(x, y)) stack.push(x, y)
}
for (let x = 0; x < W; x++) {
  pushIf(x, 0)
  pushIf(x, H - 1)
}
for (let y = 0; y < H; y++) {
  pushIf(0, y)
  pushIf(W - 1, y)
}
while (stack.length) {
  const y = stack.pop()
  const x = stack.pop()
  data[sidx(x, y) + 3] = 0
  pushIf(x + 1, y)
  pushIf(x - 1, y)
  pushIf(x, y + 1)
  pushIf(x, y - 1)
}

const opaque = (x, y) => data[sidx(x, y) + 3] > 16

// 2) Column occupancy -> segment frames by transparent gaps.
const colCount = new Array(W).fill(0)
for (let x = 0; x < W; x++) {
  let n = 0
  for (let y = 0; y < H; y++) if (opaque(x, y)) n++
  colCount[x] = n
}
const segments = []
let runStart = -1
let gap = 0
for (let x = 0; x < W; x++) {
  if (colCount[x] > 1) {
    if (runStart < 0) runStart = x
    gap = 0
  } else if (runStart >= 0) {
    gap++
    if (gap >= MIN_GAP) {
      segments.push([runStart, x - gap])
      runStart = -1
      gap = 0
    }
  }
}
if (runStart >= 0) segments.push([runStart, W - 1])

const wide = segments.filter(([a, b]) => b - a + 1 >= MIN_W)
console.log("segments:", wide.map(([a, b]) => `${a}-${b}`).join("  "))

// 3) Per-segment bbox + feet anchor (centroid of lowest 18% of content).
const frames = []
for (const [x0, x1] of wide) {
  let minX = Infinity,
    maxX = -1,
    minY = Infinity,
    maxY = -1
  for (let y = 0; y < H; y++) {
    for (let x = x0; x <= x1; x++) {
      if (opaque(x, y)) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  const footTop = Math.round(maxY - (maxY - minY) * 0.18)
  let sumX = 0,
    n = 0
  for (let y = footTop; y <= maxY; y++) {
    for (let x = x0; x <= x1; x++) {
      if (opaque(x, y)) {
        sumX += x
        n++
      }
    }
  }
  const anchorX = n ? Math.round(sumX / n) : Math.round((minX + maxX) / 2)
  frames.push({ x0, x1, minX, maxX, minY, maxY, anchorX })
}

// 4) Common canvas locked to the feet anchor so the body never drifts.
const PAD = 14
let maxLeft = 0,
  maxRight = 0,
  maxTop = 0
for (const f of frames) {
  maxLeft = Math.max(maxLeft, f.anchorX - f.minX)
  maxRight = Math.max(maxRight, f.maxX - f.anchorX)
  maxTop = Math.max(maxTop, f.maxY - f.minY)
}
const OW = maxLeft + maxRight + PAD * 2
const OH = maxTop + PAD * 2
const anchorCanvasX = maxLeft + PAD
const baseline = OH - PAD

for (let fi = 0; fi < frames.length && fi < OUT.length; fi++) {
  const f = frames[fi]
  const out = new PNG({ width: OW, height: OH })
  out.data.fill(0)
  for (let y = f.minY; y <= f.maxY; y++) {
    for (let x = f.x0; x <= f.x1; x++) {
      if (!opaque(x, y)) continue
      const ox = x - f.anchorX + anchorCanvasX
      const oy = y - f.maxY + baseline
      if (ox < 0 || oy < 0 || ox >= OW || oy >= OH) continue
      const si = sidx(x, y)
      const oi = (oy * OW + ox) * 4
      out.data[oi] = data[si]
      out.data[oi + 1] = data[si + 1]
      out.data[oi + 2] = data[si + 2]
      out.data[oi + 3] = data[si + 3]
    }
  }
  writeFileSync(`public/${OUT[fi]}.png`, PNG.sync.write(out))
  console.log(`wrote public/${OUT[fi]}.png  (${OW}x${OH})`)
}
