"use client"

import { useState, useCallback, useRef, useEffect } from "react"

// ==========================================
// 1. [초기 UI 복원] 300회 카오스 위상 수학 엔진 및 테마 데이터
// ==========================================
type MineTheme = "GOLD_VEIN" | "IRON_MINE" | "CRYSTAL_CAVE" | "LAVA_ERUPTION"

interface ThemeConfig {
  key: string
  label: string
  caveBg: string
  caveDeep: string
  accent: string
  accentDeep: string
  accentText: string
  oreLight: string
  speck: string
  ground: string
  groundAlt: string
  description: string
  poolSize: number
}

const THEME_MAP: Record<MineTheme, ThemeConfig> = {
  GOLD_VEIN: {
    key: "GOLD_VEIN",
    label: "노다지 황금 광맥 주간",
    caveBg: "#0f1f15",
    caveDeep: "#090f0b",
    accent: "#2ecc71", // 녹색 네온
    accentDeep: "#0f3d21",
    accentText: "#2ecc71",
    oreLight: "#a2f4c4",
    speck: "#2ecc71",
    ground: "#1d2b20",
    groundAlt: "#141f17",
    description: "순도 100% 황금 구역! 압축된 정예 조합 영역을 정밀 채굴합니다.",
    poolSize: 2194578,
  },
  IRON_MINE: {
    key: "IRON_MINE",
    label: "일반 무쇠 철광산 주간",
    caveBg: "#1f1d0f",
    caveDeep: "#14130d",
    accent: "#f1c40f", // 황색 네온
    accentDeep: "#4d3e05",
    accentText: "#f1c40f",
    oreLight: "#f9e79f",
    speck: "#f1c40f",
    ground: "#2d2a17",
    groundAlt: "#211f11",
    description: "표준 무쇠 구역입니다. 완만하게 필터링된 전체 레이어를 균등 조사합니다.",
    poolSize: 5204120,
  },
  CRYSTAL_CAVE: {
    key: "CRYSTAL_CAVE",
    label: "심해 크리스탈 동굴 주간",
    caveBg: "#0f171f",
    caveDeep: "#091014",
    accent: "#3498db", // 청색 네온
    accentDeep: "#0f2d42",
    accentText: "#3498db",
    oreLight: "#aed6f1",
    speck: "#3498db",
    ground: "#172533",
    groundAlt: "#111b26",
    description: "시공간이 요동치는 동굴, 리스크가 헷지된 크리스탈 틈새를 저격 타격합니다.",
    poolSize: 3410560,
  },
  LAVA_ERUPTION: {
    key: "LAVA_ERUPTION",
    label: "마그마 용암 폭발 주간",
    caveBg: "#1f0f0f",
    caveDeep: "#140909",
    accent: "#e74c3c", // 적색 네온
    accentDeep: "#42120f",
    accentText: "#e74c3c",
    oreLight: "#f5b7b1",
    speck: "#e74c3c",
    ground: "#331717",
    groundAlt: "#261111",
    description: "카오스 대격변 타이밍! 위기 방어 모드로 번호 위험도를 최대치로 밀어냅니다.",
    poolSize: 7854010,
  },
}

function getThemeByRound(round: number): MineTheme {
  const phase = (round - 1) % 300
  if (phase < 45) return "GOLD_VEIN"
  if (phase < 165) return "IRON_MINE"
  if (phase < 240) return "CRYSTAL_CAVE"
  return "LAVA_ERUPTION"
}

// ==========================================
// 2. [중복 배제] 고유 타임스탬프 결합 분산 난수 엔진
// ==========================================
interface LootRowData {
  id: string
  numbers: number[]
  bonus: number
}

function generateUniqueLottoRows(round: number, count: number): LootRowData[] {
  const themeKey = getThemeByRound(round)
  const config = THEME_MAP[themeKey]
  const results: LootRowData[] = []
  
  const cryptoSeed = Date.now() + Math.floor(Math.random() * 100000)
  let pointer = (cryptoSeed % config.poolSize) + 1

  for (let s = 0; s < count; s++) {
    const mainNumbers: number[] = []
    let stepSeed = pointer + s * 1009

    while (mainNumbers.length < 6) {
      const randVal = (Math.abs(Math.sin(stepSeed + mainNumbers.length)) * 100000 % 45) + 1
      const num = Math.floor(randVal)
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num)
      }
      stepSeed += 23
    }
    mainNumbers.sort((a, b) => a - b)

    let bonusNumber = Math.floor((Math.abs(Math.cos(stepSeed)) * 100000 % 45)) + 1
    while (mainNumbers.includes(bonusNumber)) {
      bonusNumber = (bonusNumber % 45) + 1
    }

    results.push({
      id: `${round}-${cryptoSeed}-${s}`,
      numbers: mainNumbers,
      bonus: bonusNumber,
    })
  }
  return results
}

// ==========================================
// 3. [오락실 사운드] 브라우저 내장형 웹 오디오 API 신디사이저
// ==========================================
class BuiltInRetroAudio {
  private ctx: AudioContext | null = null

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume()
    }
  }

  playClang() {
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12)
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.12)

    const noise = this.ctx.createOscillator()
    const noiseGain = this.ctx.createGain()
    noise.type = "sawtooth"
    noise.frequency.setValueAtTime(900, now)
    noiseGain.gain.setValueAtTime(0.08, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04)
    noise.connect(noiseGain)
    noiseGain.connect(this.ctx.destination)
    noise.start(now)
    noise.stop(now + 0.04)
  }

  playShatter() {
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime

    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51]
    melody.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const trigger = now + idx * 0.05
      osc.type = "square"
      osc.frequency.setValueAtTime(freq, trigger)
      gain.gain.setValueAtTime(0.12, trigger)
      gain.gain.exponentialRampToValueAtTime(0.004, trigger + 0.1)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(trigger)
      osc.stop(trigger + 0.1)
    })
  }
}

// ==========================================
// 4. 결과 리스트 출력용 도트 공 및 행 UI 컴포넌트
// ==========================================
function EmbeddedPixelBall({ value, variant, config }: { value: number; variant: "main" | "bonus"; config: ThemeConfig }) {
  const pad = String(value).padStart(2, "0")
  const style = variant === "bonus"
    ? {
        borderColor: config.accent,
        background: config.accentDeep,
        color: config.accentText,
        boxShadow: `0 0 12px ${config.accent}aa`,
      }
    : {
        borderColor: config.accent,
        background: config.caveDeep,
        color: "#f4f4f4",
      }

  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-mono font-bold shadow-inner"
      style={style}
    >
      {pad}
    </span>
  )
}

function EmbeddedLootRow({ row, index, config }: { row: LootRowData; index: number; config: ThemeConfig }) {
  return (
    <li
      className="flex items-center gap-2 rounded border-2 px-2.5 py-1.5 transition-all duration-300"
      style={{
        borderColor: config.accent,
        background: `${config.caveDeep}dd`,
      }}
    >
      <span className="w-4 shrink-0 text-center font-mono font-bold text-[9px]" style={{ color: config.accent }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex flex-1 items-center justify-between gap-1.5 font-mono">
        <div className="flex items-center gap-1.5">
          {row.numbers.map((n, i) => (
            <EmbeddedPixelBall key={i} value={n} variant="main" config={config} />
          ))}
        </div>
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <span className="font-mono text-[10px] font-bold mr-0.5" style={{ color: config.accent }}>+</span>
          <EmbeddedPixelBall value={row.bonus} variant="bonus" config={config} />
        </div>
      </div>
    </li>
  )
}

// ==========================================
// 5. 메인 게임기 무대 컴포넌트 (초기 UI 복원 완성판)
// ==========================================
const STRIKES = 3
const STRIKE_MS = 120 * 3
const T_WINDUP = 0
const T_IMPACT = 120
const T_RECOVERY = 120 * 2
const T_RESET = 120 * 3

const SPECK_POS = [
  { top: "10%", left: "14%" },
  { top: "18%", left: "82%" },
  { top: "44%", left: "8%" },
  { top: "30%", left: "78%" },
  { top: "58%", left: "90%" },
  { top: "8%", left: "52%" },
]

export default function Page() {
  const [round, setRound] = useState(1227)
  const [phase, setPhase] = useState<"idle" | "striking" | "results">("idle")
  const [anim, setAnim] = useState<"idle" | "windup" | "impact" | "recovery">("idle")
  const [crackLevel, setCrackLevel] = useState(0)
  const [broken, setBroken] = useState(false)
  const [sparkKey, setSparkKey] = useState(0)
  const [rows, setRows] = useState<LottoRowData[]>([])

  const lockRef = useRef(false)
  const timers = useRef<number[]>([])
  const audioRef = useRef<BuiltInRetroAudio | null>(null)

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => {
    audioRef.current = new BuiltInRetroAudio()
    return () => clearTimers()
  }, [clearTimers])

  const theme = THEME_MAP[getThemeByRound(round)]
  const isResults = phase === "results"
  const isStriking = phase === "striking"

  const handleStrike = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    setPhase("striking")

    const audio = audioRef.current
    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms))
    }

    // 3타 연속 수직 타격 정석 프레임 시퀀서 구동
    for (let i = 0; i < STRIKES; i++) {
      const base = 60 + i * STRIKE_MS
      const last = i === STRIKES - 1
      
      at(base + T_WINDUP, () => setAnim("windup"))
      
      at(base + T_IMPACT, () => {
        setAnim("impact")
        setCrackLevel(i + 1)
        setSparkKey((k) => k + 1)
        
        if (last) {
          setBroken(true)
          audio?.playShatter()
        } else {
          audio?.playClang()
        }
      })
      
      at(base + T_RECOVERY, () => setAnim("recovery"))
      if (!last) at(base + T_RESET, () => setAnim("idle"))
    }

    at(60 + STRIKES * STRIKE_MS + 180, () => {
      const uniqueData = generateUniqueLottoRows(round, 10)
      setRows(uniqueData)
      setPhase("results")
      setAnim("idle")
      lockRef.current = false
    })
  }, [round])

  const handleReset = useCallback(() => {
    clearTimers()
    lockRef.current = false
    setRows([])
    setCrackLevel(0)
    setBroken(false)
    setAnim("idle")
    setPhase("idle
