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
// 2. 가변형 16x16 도트 데이터 (클러스터 기반 원석 및 보석 개화 맵)
// ==========================================
const ORE_PIXEL_MAP = [
  [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,2,2,1,1,1,0,0],
  [0,1,1,1,1,1,2,2,2,2,1,1,1,1,1,0],
  [1,1,1,1,1,2,2,2,2,2,1,1,1,0,0,0],
  [1,1,1,1,1,2,2,2,2,2,1,1,1,1,0,0],
  [1,1,1,1,1,1,2,2,2,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

const GEM_PIXEL_MAP = [
  [0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0],
  [0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0],
  [0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0],
  [0,0,2,2,2,2,2,2,2,2,2,2,0,0,0,0],
  [0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0],
  [0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,2,2,2,2,2,0,0,0,0],
  [0,0,0,2,2,2,1,1,2,2,2,0,0,0,0,0],
  [0,1,0,0,2,2,1,1,2,2,0,0,1,0,0],
  [1,1,1,0,0,2,2,2,2,0,0,1,1,1,0],
  [0,1,1,0,0,0,0,2,2,0,0,0,0,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

function PurePixelMatrixOre({ config, crackLevel }: { config: ThemeConfig; crackLevel: number }) {
  // 3타 도킹 완료 시 순수 보석 클러스터로 외형 동적 스위칭
  const activeMap = crackLevel === 3 ? GEM_PIXEL_MAP : ORE_PIXEL_MAP

  return (
    <div 
      style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
        gridTemplateRows: "repeat(16, minmax(0, 1fr))",
        imageRendering: "pixelated"
      }}
      className={`w-16 h-16 bg-transparent select-none p-0.5 transition-all duration-300 ${
        crackLevel === 3 ? "scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]" : "scale-100"
      }`}
    >
      {activeMap.flatMap((row, rIdx) => 
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
// 3. 카오스 분산 및 표준편차 필터링 기반 번호 세트 드라이버
// ==========================================
interface LootRowData {
  id: string
  numbers: number[]
  bonus: number
}

function generateChaosStandardLottoRows(round: number, count: number): LootRowData[] {
  const themeKey = getThemeByRound(round)
  const config = THEME_MAP[themeKey]
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

// ==========================================
// 4. 웹 오디오 API 신디사이저 
// ==========================================
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

// ==========================================
// 5. 초기 버전 UI 규격 복원형 컴포넌트
// ==========================================
function EmbeddedPixelBall({ value, variant, config }: { value: number; variant: "main" | "bonus"; config: ThemeConfig }) {
  const pad = String(value).padStart(2, "0")
  const style = variant === "bonus"
    ? { borderColor: config.accent, background: config.accentDeep, color: config.accentText, boxShadow: `0 0 12px ${config.accent}aa` }
    : { borderColor: "rgba(255,255,255,0.15)", background: config.caveDeep, color: "#f4f4f4" }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-mono font-bold shadow-inner" style={style}>
      {pad}
    </span>
  )
}

function EmbeddedLootRow({ row, index, config }: { row: LootRowData; index: number; config: ThemeConfig }) {
  return (
    <li className="flex items-center gap-2 rounded border-2 px-2.5 py-1.5 bg-[#11121d]" style={{ borderColor: config.accent, background: `${config.caveDeep}ee` }}>
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
// 6. 메인 코어 스테이지 가변 모바일 디바이스
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
    const baseDate = new Date("2002-12-07T21:00:00")
    const today = new Date()
    const diffMs = today.getTime() - baseDate.getTime()
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
    const calculatedRound = 1 + diffWeeks
    setRound(calculatedRound)
    
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
    const at = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)) }

    at(0, () => { setStrikeMotion("hit"); setCrackLevel(1); audio?.playClang(); })
    at(120, () => { setStrikeMotion("return"); })
    at(240, () => { setStrikeMotion("hit"); setCrackLevel(2); audio?.playClang(); })
    at(360, () => { setStrikeMotion("return"); })
    at(480, () => { setStrikeMotion("hit"); setCrackLevel(3); audio?.playShatter(); })
    
    at(750, () => {
      const uniqueData = generateChaosStandardLottoRows(round, 10)
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
    hit: "translate(-22px, 14px) scale(1.02)", 
    return: "translate(3px, -3px) scale(0.99)" 
  }[strikeMotion]

  const rockTransformStyle = strikeMotion === "hit" ? "scale(0.90) translate(-2px, 2px)" : "scale(1)"

  return (
    <main className="min-h-[100dvh] w-full bg-[#1e202c] flex items-center justify-center overflow-y-auto font-mono select-none py-6">
      {/* [주문 명세]: 숫자 표출 전(idle, striking) 상태일 때는 기존의 80% 스케일(h-[80dvh])로 자동 차단 및 압축 격리 */}
      <div 
        style={{ transition: "height 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        className={`relative w-full max-w-[440px] overflow-hidden bg-[#0c0d14] flex items-center justify-center p-4 transition-all ${
          isResults ? "h-[100dvh]" : "h-[78dvh]"
        }`}
      >
        
        <div className="relative border-4 flex w-full max-w-[360px] flex-col overflow-hidden rounded-md transition-all duration-150" style={{ background: theme.caveBg, borderColor: theme.accent, boxShadow: `0 0 24px 4px ${theme.accent}33`, imageRendering: "pixelated" }}>
          
          <div className="flex items-center justify-between border-b-4 px-3 py-2 text-[10px] text-white" style={{ background: theme.caveDeep, borderColor: theme.accent }}>
            <div className="flex items-center gap-2">
              <span style={{ color: theme.accent }}>⛏️</span>
              <span className="font-bold">제 {round} 회차</span>
              {phase === "idle" && (
                <div className="flex gap-1 ml-1 scale-90">
                  <button onClick={() => setRound((r) => Math.max(1, r - 1))} className="bg-[#212435] px-1.5 py-0.5 rounded text-gray-400 active:bg-gray-600 font-bold">-</button>
                  <button onClick={() => setRound((r) => r + 1)} className="bg-[#212435] px-1.5 py-0.5 rounded text-gray-400 active:bg-gray-600 font-bold">+</button>
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold tracking-wider" style={{ color: theme.accent }}>{theme.label}</span>
          </div>

          <div className="relative h-[230px] w-full overflow-hidden" style={{ background: theme.caveBg }}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_25%,rgba(0,0,0,0.75)_100%)]" />
            
            {SPECK_POS.map((o, i) => (
              <span key={i} className="absolute h-2.5 w-2.5 rounded-sm opacity-70 animate-pulse" style={{ top: o.top, left: o.left, backgroundColor: theme.accent, boxShadow: `0 0 10px 2px ${theme.accent}` }} />
            ))}

            <div className="absolute bottom-0 left-0 right-0 flex h-7 border-t border-black/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-1 border-r" style={{ backgroundColor: i % 2 ? theme.caveBg : theme.caveDeep, borderColor: "rgba(0,0,0,0.15)" }} />
              ))}
            </div>

            <div className="absolute left-[30%] bottom-[16px] -translate-x-1/2 z-10 transition-transform duration-75" style={{ transform: rockTransformStyle }}>
              <PurePixelMatrixOre config={theme} crackLevel={crackLevel} />
            </div>

            {strikeMotion === "hit" && (
              <div className="absolute w-12 h-12 rounded-full bg-white opacity-70 animate-ping pointer-events-none" style={{ top: "54%", left: "24%", boxShadow: `0 0 32px 12px ${theme.accent}` }} />
            )}

            <button type="button" onClick={handleStrike} disabled={phase !== "idle"} className="absolute bottom-2 left-[66%] z-10 -translate-x-1/2 cursor-pointer rounded outline-none disabled:cursor-default">
              {phase === "idle" && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-[9px] text-white px-2 py-0.5 rounded bg-black/80 border border-white/10 shadow-md animate-bounce">
                  <span style={{ color: theme.accent }}>[ TAP CHARACTER ]</span>
                </span>
              )}
              <div className="w-[120px] h-[150px] flex items-center justify-center transition-transform duration-75 ease-in-out" style={{ transform: minerTransformStyle }}>
                <img src="/dwarf-miner.png" alt="Dwarf Miner" className="w-full h-full object-contain object-bottom pixelated drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]" />
              </div>
            </button>
          </div>

          <div className="bg-[#0c0d16] p-2.5 text-center border-t border-b border-black/40">
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed tracking-tight">{isResults ? "🎉 위상 동기화 및 정제 프로세스 완수!" : theme.description}</p>
            <div className="mt-1 text-[7px] text-gray-600 font-mono tracking-widest">CHAOS POOL DENSITY: {theme.poolSize.toLocaleString()} UNITS</div>
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
              <button type="button" onClick={handleReset} className="m-2 cursor-pointer rounded font-bold text-[10px] py-2.5 shadow-lg active:translate-y-0.5 text-black border border-white/10" style={{ backgroundColor: theme.accent }}>🔄 RESET & RE-MINE</button>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
