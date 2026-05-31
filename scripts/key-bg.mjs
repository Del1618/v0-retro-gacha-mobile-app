import { PNG } from "pngjs"
import { readFileSync, writeFileSync } from "node:fs"

// Flood-fill from the borders, turning near-black background pixels transparent.
// Interior black outlines are preserved because they are not connected to the edge.
const THRESHOLD = 60 // max R+G+B-ish darkness considered "background black"

function keyOut(path) {
  const png = PNG.sync.read(readFileSync(path))
  const { width, height, data } = png
  const idx = (x, y) => (y * width + x) * 4

  const isDark = (x, y) => {
    const i = idx(x, y)
    return data[i] <= THRESHOLD && data[i + 1] <= THRESHOLD && data[i + 2] <= THRESHOLD
  }

  const visited = new Uint8Array(width * height)
  const stack = []
  const pushIf = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const p = y * width + x
    if (visited[p]) return
    visited[p] = 1
    if (isDark(x, y)) stack.push(x, y)
  }

  // seed from all border pixels
  for (let x = 0; x < width; x++) {
    pushIf(x, 0)
    pushIf(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    pushIf(0, y)
    pushIf(width - 1, y)
  }

  while (stack.length) {
    const y = stack.pop()
    const x = stack.pop()
    data[idx(x, y) + 3] = 0 // transparent
    pushIf(x + 1, y)
    pushIf(x - 1, y)
    pushIf(x, y + 1)
    pushIf(x, y - 1)
  }

  writeFileSync(path, PNG.sync.write(png))
  console.log("keyed:", path)
}

for (const f of process.argv.slice(2)) keyOut(f)
