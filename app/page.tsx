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
    description: "순도 100% 황금 구역! 압축된 정예 조합 영역을 정밀 채굴합니다.",
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
    description: "표준 무쇠 구역입니다. 완만하게 필터링된 전체 레이어를 균등 조사합니다.",
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
    description: "시공간이 요동치는 동굴, 리스크가 헷지된 크리스탈 틈새를 저격 타격합니다.",
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
    description: "카오스 대격변 타이밍! 위기 방어 모드로 번호 위험도를 최대치로 밀어냅니다.",
    poolSize: 7854010,
  },
}

function getThemeByRound(round: number): MineTheme {
  const phaseNum = (round - 1) % 300
  if (phaseNum < 45) return "GOLD_VEIN"
  if (phaseNum < 165) return "IRON_MINE"
  if (phaseNum < 240) return "CRYSTAL_CAVE"
  return "LAVA_ERUPTION"
}

// ==========================================
// 2. 가변형 16x16 도트 광석 매트릭스 맵 데이터
// ==========================================
const ORE_PIXEL_MAP = [
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,2,2,2,2,1,1,1,1,1,0],
  [0,1,1,1,1,2,2,2,2,2,2,1,1,1,1,0],
  [1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1],
  [1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1],
  [1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1],
  [1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1],
  [1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1],
  [0,1,1,1,1,1,2,2,2,2,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

function PurePixelMatrixOre({ config, crackLevel }: { config: ThemeConfig; crackLevel: number }) {
  if (crackLevel === 3) {
    return (
      <div className="w-16 h-16 flex items-center justify-center animate-ping pointer-events-none">
        <span className="text-[10px] font-black tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          PULVERIZED
        </span>
      </div>
    )
  }

  return (
    <div 
      className="grid grid-cols-16 grid-rows-16 w-16 h-16 bg-transparent select-none p-0.5"
      style={{ imageRendering: "pixelated" }}
    >
      {ORE_PIXEL_MAP.flatMap((row, rIdx) => 
        row.map((pixel, cIdx) => {
          let bgColor = "transparent"
          if (pixel === 1) bgColor = config.stoneBase
          if (pixel === 2) bgColor = config.stoneGlow

          return (
            <div 
              key={`${rIdx}-${cIdx}`} 
              style={{ backgroundColor: bgColor }}
              className="w-full h-full"
            />
          )
        })
      )}
    </div>
  )
}

// ==========================================
// 3. 난수 분산 생성 모듈
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
// 4. 웹 오디오 API 신디사이저
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
// 5. 초기 버전 UI 규격 복원형 컴포넌트
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
        borderColor: "rgba(255,255,255,0.15)",
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
      className="flex items-center gap-2 rounded border-2 px-2.5 py-1.5 bg-[#11121d]"
      style={{
        borderColor: config.accent,
        background: `${config.caveDeep}ee`,
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
// 6. [오리지널 뼈대 복원] 메인 뷰어 무대
// ==========================================
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
  const [phase, setPhase] = useState<Phase>("idle")
  const [crackLevel, setCrackLevel] = useState(0)
  const [rows, setRows] = useState<LootRowData[]>([])
  const [strikeMotion, setStrikeMotion] = useState<"ready" | "hit" | "return">("ready")

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

  const handleStrike = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    setPhase("striking")

    const audio = audioRef.current
    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms))
    }

    // 3타 정석 타격 모션 드라이버
    at(0, () => { setStrikeMotion("hit"); setCrackLevel(1); audio?.playClang(); })
    at(120, () => { setStrikeMotion("return"); })
    
    at(240, () => { setStrikeMotion("hit"); setCrackLevel(2); audio?.playClang(); })
    at(360, () => { setStrikeMotion("return"); })
    
    at(480, () => { setStrikeMotion("hit"); setCrackLevel(3); audio?.playShatter(); })
    
    at(750, () => {
      const uniqueData = generateUniqueLottoRows(round, 10)
      setRows(uniqueData)
      setPhase("results")
      setStrikeMotion("ready")
      lockRef.current = false
    })
  }, [round])

  const handleReset = useCallback(() => {
    clearTimers()
    lockRef.current = false
    setRows([])
    setCrackLevel(0)
    setStrikeMotion("ready")
    setPhase("idle")
  }, [clearTimers])

  // 오리지널 황금 비율 수직 타격 물리 CSS 트랜스폼
  const minerTransformStyle = {
    ready: "translate(0, 0) scale(1)",
    hit: "translate(-22px, 14px) scale(1.02)", 
    return: "translate(3px, -3px) scale(0.99)" 
  }[strikeMotion]

  const rockTransformStyle = strikeMotion === "hit" ? "scale(0.90) translate(-2px, 2px)" : "scale(1)"

  return (
    <main className="min-h-[100dvh] w-full bg-[#1e202c] flex items-center justify-center overflow-hidden font-mono select-none">
      {/* 초기 버전의 완벽한 오리지널 스마트폰 모바일 컨테이너 복원 */}
      <div className="relative h-[100dvh] w-full max-w-[440px] overflow-hidden bg-[#0c0d14] flex items-center justify-center p-4">
        
        {/* 초기 가챠 머신 완벽 규격 복원 팝업 바디 */}
        <div
          className="relative border-4 flex w-full max-w-[360px] flex-col overflow-hidden rounded-md transition-all duration-150"
          style={{
            background: theme.caveBg,
            borderColor: theme.accent,
            boxShadow: `0 0 24px 4px ${theme.accent}33`,
            imageRendering: "pixelated"
          }}
        >
          {/* 초기형 대시보드 탑 바 */}
          <div
            className="flex items-center justify-between border-b-4 px-3 py-2 text-[10px] text-white"
            style={{ background: theme.caveDeep, borderColor: theme.accent }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: theme.accent }}>⛏️</span>
              <span className="font-bold">제 {round} 회차</span>
              {phase === "idle" && (
                <div className="flex gap-1 ml-1 scale-90">
                  <button
                    onClick={() => setRound((r) => Math.max(1, r - 1))}
                    className="bg-[#212435] px-1.5 py-0.5 rounded text-gray-400 active:bg-gray-600 font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setRound((r) => r + 1)}
                    className="bg-[#212435] px-1.5 py-0.5 rounded text
