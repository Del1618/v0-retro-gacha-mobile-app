"use client"

import { useState, useCallback, useRef, useEffect } from "react"

// ==========================================
// 1. 카오스 위상 수학 엔진 및 국면별 테마 프로필
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
  oreColor: string
  oreCore: string
  description: string
  poolSize: number
}

const THEME_MAP: Record<MineTheme, ThemeConfig> = {
  GOLD_VEIN: {
    key: "GOLD_VEIN",
    label: "GOLD VEIN PHASE",
    caveBg: "#0c1810",
    caveDeep: "#050a06",
    accent: "#2ecc71", // 청정 녹색 네온
    accentDeep: "#061a0e",
    accentText: "#2ecc71",
    oreColor: "#f1c40f", // 황금색 광석
    oreCore: "#f9e79f",
    description: "순도 100% 황금 광맥 구역. 압축된 정예 조합 영역을 조사합니다.",
    poolSize: 2194578,
  },
  IRON_MINE: {
    key: "IRON_MINE",
    label: "IRON MINE PHASE",
    caveBg: "#18160c",
    caveDeep: "#0a0905",
    accent: "#f1c40f", // 평온한 황색 네온
    accentDeep: "#1a1505",
    accentText: "#f1c40f",
    oreColor: "#e67e22", // 철광석 색상
    oreCore: "#edbb99",
    description: "표준 무쇠 구역입니다. 완만하게 필터링된 전체 레이어를 채굴합니다.",
    poolSize: 5204120,
  },
  CRYSTAL_CAVE: {
    key: "CRYSTAL_CAVE",
    label: "CRYSTAL CAVE PHASE",
    caveBg: "#0c1218",
    caveDeep: "#05080a",
    accent: "#3498db", // 디펜스 청색 네온
    accentDeep: "#05141f",
    accentText: "#3498db",
    oreColor: "#9b59b6", // 신비로운 자수정 색상
    oreCore: "#d2b4de",
    description: "시공간이 요동치는 동굴, 리스크가 헷지된 크리스탈 틈새를 타격합니다.",
    poolSize: 3410560,
  },
  LAVA_ERUPTION: {
    key: "LAVA_ERUPTION",
    label: "MAGMA ERUPTION PHASE",
    caveBg: "#180c0c",
    caveDeep: "#0a0505",
    accent: "#e74c3c", // 위기방어 적색 네온
    accentDeep: "#1f0505",
    accentText: "#e74c3c",
    oreColor: "#c0392b", // 마그마 용암석
    oreCore: "#f5b7b1",
    description: "카오스 대격변 타이밍. 위기 방어 모드로 난수 위험도를 제어합니다.",
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
// 2. 유저 고유 타임스탬프 중복 배제 분산 난수 엔진
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
// 3. 브라우저 내장형 웹 오디오 API 이펙트 사운드 신디사이저
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
// 4. [완벽 내장형] 순수 CSS 코드 렌더링 방식의 16비트 도트 광석 디바이스
// ==========================================
function EmbeddedVectorOre({ config, crackLevel }: { config: ThemeConfig; crackLevel: number }) {
  if (crackLevel === 3) {
    return (
      <div className="w-24 h-24 flex items-center justify-center animate-ping pointer-events-none">
        <span className="text-sm font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
          DISCOVERED
        </span>
      </div>
    )
  }

  return (
    <div 
      className="relative w-24 h-24 flex items-center justify-center transition-transform duration-100"
      style={{ imageRendering: "pixelated" }}
    >
      {/* 8비트 정석 보석 마름모 외곽 껍질 */}
      <div 
        className="absolute w-16 h-16 rotate-45 border-[6px] transition-all"
        style={{ 
          backgroundColor: config.accentDeep, 
          borderColor: config.oreColor,
          boxShadow: `0 0 25px ${config.oreColor}88, inset 0 0 15px rgba(0,0,0,0.6)`
        }}
      />
      {/* 내부 핵심 핵 야광 파티클 코어 */}
      <div 
        className="absolute w-7 h-7 rotate-45 animate-pulse"
        style={{ backgroundColor: config.oreCore }}
      />
      
      {/* 1타 타격 균열선 오버레이 (실시간 마스킹) */}
      {crackLevel >= 1 && (
        <div className="absolute w-full h-1.5 bg-black/90 rotate-12 top-1/2 left-0 pointer-events-none shadow-md" />
      )}
      {/* 2타 임계 균열선 오버레이 */}
      {crackLevel >= 2 && (
        <div className="absolute w-1.5 h-full bg-black/90 -rotate-45 top-0 left-1/2 pointer-events-none shadow-md" />
      )}
    </div>
  )
}

function EmbeddedPixelBall({ value, variant, config }: { value: number; variant: "main" | "bonus"; config: ThemeConfig }) {
  const pad = String(value).padStart(2, "0")
  const style = variant === "bonus"
    ? {
        borderColor: config.accent,
        background: config.accentDeep,
        color: config.accentText,
        boxShadow: `0 0 12px ${config.accent}bb`,
      }
    : {
        borderColor: "rgba(255,255,255,0.15)",
        background: "#1c1e24",
        color: "#ffffff",
      }

  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-mono font-black shadow-inner"
      style={style}
    >
      {pad}
    </span>
  )
}

function EmbeddedLootRow({ row, index, config }: { row: LootRowData; index: number; config: ThemeConfig }) {
  return (
    <li
      className="flex items-center gap-3 rounded-xl border px-3.5 py-2 bg-[#12141a] border-white/5 shadow-md"
    >
      <span className="w-5 shrink-0 text-center font-mono font-bold text-[10px] text-white/30">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex flex-1 items-center justify-between gap-1.5 font-mono">
        <div className="flex items-center gap-1.5">
          {row.numbers.map((n, i) => (
            <EmbeddedPixelBall key={i} value={n} variant="main" config={config} />
          ))}
        </div>
        <div className="flex items-center gap-1 border-l border-white/10 pl-3">
          <span className="font-mono text-[11px] font-black mr-1" style={{ color: config.accent }}>+</span>
          <EmbeddedPixelBall value={row.bonus} variant="bonus" config={config} />
        </div>
      </div>
    </li>
  )
}

// ==========================================
// 6. 메인 현대식 프리미엄 가챠 프레임 무대
// ==========================================
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

    // 3타 수직 타격 정밀 동기화
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

  const minerTransformStyle = {
    ready: "translate(0, 0) scale(1)",
    hit: "translate(-25px, 15px) scale(1.04)", 
    return: "translate(4px, -4px) scale(0.99)" 
  }[strikeMotion]

  return (
    <main className="min-h-[100dvh] w-full bg-[#090a0f] flex items-center justify-center overflow-hidden font-sans select-none antialiased">
      {/* 1. Base Mobile Container: 다크 프리미엄 스마트폰 베زل 종결 */}
      <div className="relative h-[100dvh] w-full max-w-[430px] overflow-hidden bg-black flex flex-col border-x border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        
        {/* 상단 럭셔리 대시보드 헤더 */}
        <header className="p-6 flex justify-between items-end bg-gradient-to-b from-[#11131a] to-black border-b border-white/5">
          <div>
            <h1 className="text-white/30 text-[10px] font-black tracking-[0.25em] mb-1">MATRIX ENGINE ONLINE</h1>
            <div className="flex items-center gap-2
