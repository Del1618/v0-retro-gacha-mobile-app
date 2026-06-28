"use client"

import { useState, useCallback, useRef, useEffect } from "react"

// ==========================================
// 1. 카오스 위상 수학 엔진 및 국면별 테마 데이터
// ==========================================
type MineTheme = "GOLD_VEIN" | "IRON_MINE" | "CRYSTAL_CAVE" | "LAVA_ERUPTION"
type Phase = "idle" | "striking" | "results"

interface ThemeConfig {
  key: string
  label: string
  caveBg: string
  caveDeep: string
  accent: string
  accentDeep: string
  accentText: string
  stoneBase: string 
  stoneGlow: string
  description: string
  poolSize: number
}

const THEME_MAP: Record<MineTheme, ThemeConfig> = {
  GOLD_VEIN: {
    key: "GOLD_VEIN",
    label: "노다지 황금 광맥 주간",
    caveBg: "#0f1f15",
    caveDeep: "#090f0b",
    accent: "#2ecc71", 
    accentDeep: "#0f3d21",
    accentText: "#2ecc71",
    stoneBase: "#f1c40f", 
    stoneGlow: "#fff3a8",
    description: "비선형 카오스 수렴 구역. 정예 압축 영역을 채굴합니다.",
    poolSize: 2194578,
  },
  IRON_MINE: {
    key: "IRON_MINE",
    label: "일반 무쇠 철광산 주간",
    caveBg: "#1f1d0f",
    caveDeep: "#14130d",
    accent: "#f1c40f",
    accentDeep: "#4d3e05",
    accentText: "#f1c40f",
    stoneBase: "#e67e22",
    stoneGlow: "#f5cba7",
    description: "표준 정규분포 안정화 구역. 균등 조사를 시행합니다.",
    poolSize: 5204120,
  },
  CRYSTAL_CAVE: {
    key: "CRYSTAL_CAVE",
    label: "심해 크리스탈 동굴 주간",
    caveBg: "#0f171f",
    caveDeep: "#091014",
    accent: "#3498db",
    accentDeep: "#0f2d42",
    accentText: "#3498db",
    stoneBase: "#9b59b6",
    stoneGlow: "#ebdef0",
    description: "시공간 요동 크레바스 구역. 헷지된 틈새를 저격 타격합니다.",
    poolSize: 3410560,
  },
  LAVA_ERUPTION: {
    key: "LAVA_ERUPTION",
    label: "마그마 용암 폭발 주간",
    caveBg: "#1f0f0f",
    caveDeep: "#140909",
    accent: "#e74c3c",
    accentDeep: "#42120f",
    accentText: "#e74c3c",
    stoneBase: "#c0392b",
    stoneGlow: "#fadbd8",
    description: "위기 방어 대격변 모드. 극단적 표준편차 필터가 작동합니다.",
    poolSize: 7854010,
  }
}

function getThemeByRound(round: number): MineTheme {
  const phaseNum = (round - 1) % 300
  if (phaseNum < 45) return "GOLD_VEIN"
  if (phaseNum < 165) return "IRON_MINE"
  if (phaseNum < 240) return "CRYSTAL_CAVE"
  return "LAVA_ERUPTION"
}

// ==========================================
// 2. 제공된 오리지널 이미지 기반 정밀 도트 매트릭스 (1.5배 업사이징 대응)
// ==========================================
const ORE_PIXEL_MAP = [
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,1,1,1,2,2,2,2,1,1,1,0,0,0],
  [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
  [0,1,1,2,2,2,2,3,3,2,2,2,2,1,1,0],
  [0,1,2,2,2,3,3,3,3,3,3,2,2,2,1,0],
  [1,1,2,2,3,3,3,3,3,3,3,3,2,2,1,1],
  [1,2,2,3,3,3,3,3,3,3,3,3,3,2,2,1],
  [1,2,2,3,3,3,3,3,3,3,3,3,3,2,2,1],
  [1,2,2,3,3,3,3,3,3,3,3,3,3,2,2,1],
  [1,1,2,2,3,3,3,3,3,3,3,3,2,2,1,1],
  [0,1,2,2,2,3,3,3,3,3,3,2,2,2,1,0],
  [0,1,1,2,2,2,2,3,3,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,2,2,2,2,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]

const GEM_PIXEL_MAP = [
  [3,0,0,0,0,0,0,3,3,0,0,0,0,0,0,3],
  [0,3,0,0,0,0,0,0,0,0,0,0,0,0,3,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,1,2,2,3,3,3,3,2,2,1,0,0,0],
  [0,0,1,2,2,3,3,3,3,3,3,2,2,1,0,0],
  [0,0,1,2,3,3,3,3,3,3,3,3,2,1,0,0],
  [3,0,1,2,3,3,3,3,3,3,3,3,2,1,0,3],
  [3,0,1,2,3,3,3,3,3,3,3,3,2,1,0,3],
  [0,0,1,2,3,3,3,3,3,3,3,3,2,1,0,0],
  [0,0,1,2,2,3,3,3,3,3,3,2,2,1,0,0],
  [0,0,0,1,2,2,3,3,3,3,2,2,1,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,3,0,0,0,0,0,0,0,0,0,0,0,0,3,0],
  [3,0,0,0,0,0,0,3,3,0,0,0,0,0,0,3]
]

// 1.5배 규격 최적화 반영 (w-16 h-16 -> w-24 h-24 변경)
function PurePixelMatrixOre({ config, crackLevel }: { config: ThemeConfig; crackLevel: number }) {
  const activeMap = crackLevel === 3 ? GEM_PIXEL_MAP : ORE_PIXEL_MAP

  return (
    <div 
      style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(16, minmax(0, 1fr))", 
        gridTemplateRows: "repeat(16, minmax(0, 1fr))", 
        imageRendering: "pixelated" 
      }} 
      className="w-24 h-24 bg-transparent select-none p-0.5 transition-all duration-300"
    >
      {activeMap.flatMap((row, rIdx) => row.map((pixel, cIdx) => {
        let bgColor = "transparent"
        if (pixel === 1) bgColor = config.stoneBase
        if (pixel === 2) bgColor = config.stoneGlow
        if (pixel === 3) bgColor = "#ffffff"
        return (
          <div 
            key={`${rIdx}-${cIdx}`} 
            style={{ backgroundColor: bgColor }} 
            className="w-full h-full" 
          />
        )
      }))}
    </div>
  )
}

// ==========================================
// 3. 백엔드 수학 연산 및 인터페이스 데이터 정의
// ==========================================
interface LootRowData {
  id: string
  numbers: number[]
  bonus: number
}

function generateChaosStandardLottoRows(round: number, count: number): LootRowData[] {
  const results: LootRowData[] = []
  let baseSeed = Date.now() + Math.floor(Math.random() * 50000)
  let r_param = 3.86 + (baseSeed % 80) * 0.001

  while (results.length < count) {
    const mainNumbers: number[] = []
    let x = (baseSeed % 79) * 0.0123
    if (x === 0 || x === 1) x = 0.456

    let safetyCounter = 0
    while (mainNumbers.length < 6 && safetyCounter < 100) {
      safetyCounter++
      x = r_param * x * (1 - x)
      const cand = Math.floor(x * 45) + 1
      if (!mainNumbers.includes(cand) && cand >= 1 && cand <= 45) {
        mainNumbers.push(cand)
      }
    }

    if (safetyCounter >= 100) {
      baseSeed += 31
      r_param = 3.86 + (baseSeed % 80) * 0.001
      continue
    }

    mainNumbers.sort((a, b) => a - b)
    const sum = mainNumbers.reduce((acc, curr) => acc + curr, 0)
    if (sum < 105 || sum > 175) {
      baseSeed += 17
      continue
    }

    let bonusNumber = Math.floor((Math.abs(Math.sin(x + sum)) * 100000) % 45) + 1
    while (mainNumbers.includes(bonusNumber)) {
      bonusNumber = (bonusNumber % 45) + 1
    }

    results.push({
      id: `${round}-${baseSeed}-${results.length}`,
      numbers: mainNumbers,
      bonus: bonusNumber,
    })
    baseSeed += 997
  }
  return results
}

class BuiltInRetroAudio {
  private ctx: AudioContext | null = null

  initOnDemand() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume()
    }
  }

  playClang() {
    this.initOnDemand()
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
  }

  playShatter() {
    this.initOnDemand()
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

function EmbeddedPixelBall({ value, variant, config }: { value: number; variant: "main" | "bonus"; config: ThemeConfig }) {
  const pad = String(value).padStart(2, "0")
  const style = variant === "bonus" 
    ? { borderColor: config.accent, background: config.accentDeep, color: config.accentText, boxShadow: `0 0 12px ${config.accent}aa` } 
    : { borderColor: "rgba(255,255,255,0.15)", background: config.caveDeep, color: "#f4f4f4" }

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
      className="flex items-center gap-2 rounded border-2 px-2.5 py-1.5 bg-[#11121d]" 
      style={{ borderColor: config.accent, background: `${config.caveDeep}ee` }}
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

const SPECK_POS = [
  { top: "12%", left: "8%" }, { top: "22%", left: "85%" },
  { top: "65%", left: "14%" }, { top: "78%", left: "76%" },
  { top: "40%", left: "92%" }, { top: "85%", left: "25%" }
]

// ==========================================
// 4. 메인 어플리케이션 컴포넌트 뷰어컨테이너
// ==========================================
export default function LotteryMatrixApp() {
  const [currentRound, setCurrentRound] = useState<number>(1215)
  const [phase, setPhase] = useState<Phase>("idle")
  const [crackLevel, setCrackLevel] = useState<number>(0)
  const [rows, setRows] = useState<LootRowData[]>([])
  const [isShock, setIsShock] = useState<boolean>(false)

  const audioRef = useRef<BuiltInRetroAudio | null>(null)

  useEffect(() => {
    audioRef.current = new BuiltInRetroAudio()
    
    const baseDate = new Date("2002-12-07T21:00:00+09:00").getTime()
    const now = Date.now()
    const diffWeeks = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24 * 7)) + 1
    if (diffWeeks > 0) {
      setCurrentRound(diffWeeks)
    }
  }, [])

  const currentThemeKey = getThemeByRound(currentRound)
  const theme = THEME_MAP[currentThemeKey]

  const handleStrike = useCallback(() => {
    if (phase === "results" || !audioRef.current) return

    if (phase === "idle") {
      setPhase("striking")
    }

    setIsShock(true)
    setTimeout(() => setIsShock(false), 80)

    const nextCrack = crackLevel + 1
    if (nextCrack >= 3) {
      audioRef.current.playShatter()
      setCrackLevel(3)
      const generated = generateChaosStandardLottoRows(currentRound, 10)
      setRows(generated)
      setPhase("results")
    } else {
      audioRef.current.playClang()
      setCrackLevel(nextCrack)
    }
  }, [phase, crackLevel, currentRound])

  const handleReset = useCallback(() => {
    setPhase("idle")
    setCrackLevel(0)
    setRows([])
    setIsShock(false)
  }, [])

  const isIdle = phase === "idle"
  const isStriking = phase === "striking"
  const isResults = phase === "results"

  return (
    <main 
      style={{ backgroundColor: "#040508" }} 
      className="flex min-h-screen w-full items-center justify-center p-4 antialiased font-sans"
    >
      <div 
        style={{ 
          borderColor: "#181a26", 
          backgroundColor: theme.caveBg,
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.02) 0%, transparent 70%)`
        }}
        className={`relative w-full max-w-[360px] overflow-hidden rounded-xl border-4 shadow-2xl transition-all duration-500 ease-in-out ${
          isResults ? "h-[85dvh]" : "h-[62dvh]"
        }`}
      >
        {SPECK_POS.map((pos, idx) => (
          <div 
            key={idx}
            style={{ 
              top: pos.top, 
              left: pos.left, 
              backgroundColor: theme.stoneBase,
              boxShadow: `0 0 6px ${theme.stoneBase}77`
            }}
            className="absolute h-0.5 w-0.5 rounded-full opacity-20 animate-pulse"
          />
        ))}

        <div className="flex flex-col h-full justify-between">
          
          <header className="bg-[#05060a]/90 p-3 text-center border-b border-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              <h1 className="text-[10px] font-mono font-black tracking-[0.2em] text-gray-400">LOTTERY MATRIX V2</h1>
            </div>
            <div className="mt-1 text-xs font-mono font-bold tracking-tight text-white">
              제 {currentRound} 회차 위상 분기점
            </div>
            <div 
              style={{ color: theme.accent }} 
              className="mt-0.5 text-[9px] font-sans font-bold tracking-tight transition-colors duration-300"
            >
              {theme.label}
            </div>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <button
              type="button"
              disabled={isResults}
              onClick={handleStrike}
              style={{ 
                outline: "none",
                transform: isShock ? "scale(0.88)" : "scale(1.0)",
                boxShadow: isShock ? `0 0 40px #ffffff44` : "none"
              }}
              className={`group relative flex items-center justify-center rounded-2xl border border-white/5 bg-black/20 p-8 transition-all duration-75 ${
                isResults ? "cursor-default" : "cursor-pointer hover:bg-black/40"
              }`}
            >
              {isShock && (
                <div 
                  style={{ borderColor: theme.stoneGlow }}
                  className="absolute inset-0 rounded-2xl border-4 opacity-70 animate-ping" 
                />
              )}
              <div className="relative z-10">
                <PurePixelMatrixOre config={theme} crackLevel={crackLevel} />
              </div>
            </button>
          </div>

          <div className="bg-[#0c0d16] p-2.5 text-center border-t border-b border-black/40">
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed tracking-tight">
              {isResults ? "🎉 위상 동기화 및 정제 프로세스 완수!" : theme.description}
            </p>
            <div className="mt-1 text-[7px] text-gray-600 font-mono tracking-widest">
              CHAOS POOL DENSITY: {theme.poolSize.toLocaleString()} UNITS
            </div>
          </div>

          {isResults && (
            <div className="flex flex-col bg-[#05060a] border-t-4 animate-fadeIn" style={{ borderColor: theme.accent }}>
              <div className="flex items-center justify-between px-3 py-1.5 font-mono text-[8px] text-gray-500">
                <span>CHAOS MATRIX HAUL (10 ROWS)</span>
                <span style={{ color: theme.accent }}>2ND TARGET INJECTED</span>
              </div>
              <ul className="flex max-h-[160px] flex-col gap-1 overflow-y-auto px-2 pb-2">
                {rows.map((row, i) => (
                  <EmbeddedLootRow key={row.id} row={row} index={i} config={theme} />
                ))}
              </ul>
              <button 
                type="button" 
                onClick={handleReset} 
                className="m-2 cursor-pointer rounded font-bold text-[10px] py-2 text-center text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
              >
                CORE MATRIX RE-INITIALIZE
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
