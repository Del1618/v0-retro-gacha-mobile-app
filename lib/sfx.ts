// Tiny zero-dependency 8-bit SFX engine built on the Web Audio API.
// The context is created/resumed on the first user gesture so impact sounds
// fire with no latency the instant a frame transition happens.

let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

export function primeAudio() {
  const c = ac()
  if (c && c.state === "suspended") c.resume()
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const out = buf.getChannelData(0)
  for (let i = 0; i < len; i++) out[i] = Math.random() * 2 - 1
  return buf
}

// Metallic, high-pitched "CLANG!" — a heavy steel pickaxe biting into ore.
export function playClang() {
  const c = ac()
  if (!c) return
  const t = c.currentTime
  const master = c.createGain()
  master.gain.value = 0.0001
  master.gain.setValueAtTime(0.5, t)
  master.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
  master.connect(c.destination)

  // inharmonic partials = clanging metal
  const partials = [1180, 1730, 2490, 3120]
  partials.forEach((f, i) => {
    const o = c.createOscillator()
    o.type = i % 2 ? "square" : "triangle"
    o.frequency.setValueAtTime(f, t)
    o.frequency.exponentialRampToValueAtTime(f * 0.82, t + 0.2)
    const g = c.createGain()
    g.gain.value = 0.5 / (i + 1)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.22)
  })

  // sharp noise "tick" at the moment of contact
  const n = c.createBufferSource()
  n.buffer = noiseBuffer(c, 0.05)
  const nf = c.createBiquadFilter()
  nf.type = "highpass"
  nf.frequency.value = 2600
  const ng = c.createGain()
  ng.gain.setValueAtTime(0.6, t)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  n.connect(nf).connect(ng).connect(c.destination)
  n.start(t)
  n.stop(t + 0.05)
}

// Crisp glassy "SHATTER" + shiny loot chime as the ore breaks and numbers drop.
export function playShatter() {
  const c = ac()
  if (!c) return
  const t = c.currentTime

  // glass-break noise burst with an upward highpass sweep
  const n = c.createBufferSource()
  n.buffer = noiseBuffer(c, 0.4)
  const nf = c.createBiquadFilter()
  nf.type = "highpass"
  nf.frequency.setValueAtTime(900, t)
  nf.frequency.exponentialRampToValueAtTime(6000, t + 0.3)
  const ng = c.createGain()
  ng.gain.setValueAtTime(0.45, t)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
  n.connect(nf).connect(ng).connect(c.destination)
  n.start(t)
  n.stop(t + 0.4)

  // ascending shiny chiptune arpeggio = "SHINY LOOT!"
  const notes = [1318, 1568, 1976, 2637]
  notes.forEach((f, i) => {
    const o = c.createOscillator()
    o.type = "square"
    o.frequency.value = f
    const g = c.createGain()
    const start = t + 0.04 + i * 0.06
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(0.28, start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)
    o.connect(g).connect(c.destination)
    o.start(start)
    o.stop(start + 0.2)
  })
}
