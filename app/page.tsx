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
  stoneBase: string // 순수 코딩 도트암석 베이스 색상
  stoneGlow: string // 보석 핵 야광 색상
  description: string
  poolSize: number
}

const THEME_MAP: Record<MineTheme, ThemeConfig> = {
  GOLD_VEIN: {
    key: "GOLD_VEIN",
    label: "GOLD VEIN PHASE",
    caveBg: "#0c1810",
    caveDeep: "#050a06",
    accent: "#2ecc71", 
    accentDeep: "#061a0e",
    accentText: "#2ecc71",
    stoneBase: "#d4af37", // 황금 바위
    stoneGlow: "#fff3a8",
    description: "순도 100% 황금 광맥 구역. 압축된 정예 조합 영역을 조사합니다.",
    poolSize: 2194578,
  },
  IRON_MINE: {
    key: "IRON_MINE",
    label: "IRON MINE PHASE",
    caveBg: "#18160c",
    caveDeep: "#0a0905",
    accent: "#f1c40f", 
    accentDeep: "#1a1505",
    accentText: "#f1c40f",
    stoneBase: "#ca6f1e", // 무쇠 철광석
    stoneGlow: "#f5cba7",
    description: "표준 무쇠 구역입니다. 완만하게 필터링된 전체 레이어를 채굴합니다.",
    poolSize: 5204120,
  },
  CRYSTAL_CAVE: {
    key: "CRYSTAL_CAVE",
    label: "CRYSTAL CAVE PHASE",
    caveBg: "#0c1218",
    caveDeep: "#05080a",
    accent: "#3498db", 
    accentDeep: "#05141f",
    accentText: "#3498db",
    stoneBase: "#8e44ad", // 신비로운 자수정 원석
    stoneGlow: "#ebdef0",
    description: "시공간이 요동치는 동굴, 리스크가 헷지된 크리스탈 틈새를 타격합니다.",
    poolSize: 3410560,
  },
  LAVA_ERUPTION: {
    key: "LAVA_ERUPTION",
    label: "MAGMA ERUPTION PHASE",
    caveBg: "#180c0c",
    caveDeep: "#0a0505",
    accent: "#e74c3c", 
    accentDeep: "#1f0505",
    accentText: "#e74c3c",
    stoneBase: "#a93226", // 붉은 용암암석
    stoneGlow: "#fadbd8",
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
// 2. 난수 분산 생성 모듈 (구조 100% 원상복구)
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
// 3. 브라우저 내장형 웹 오디오 API 신디사이저
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
// 4. [주문 명세]: 외부 파일 없이 100% 순수 CSS 도트로 코딩한 광석 디바이스
// ==========================================
function PurePixelCodingOre({ config, crackLevel }: { config: ThemeConfig; crackLevel: number }) {
  if (crackLevel === 3) {
    return (
      <div className="w-20 h-20 flex items-center justify-center animate-ping pointer-events-none">
        <span className="text-[10px] font-black tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          EXTRACTED
        </span>
      </div>
    )
  }

  return (
    <div 
      className="relative w-20 h-20 flex items-center justify-center select-none"
      style={{ imageRendering: "pixelated" }}
    >
      {/* 8비트 스타일 다층 레이어 입체 픽셀 바위 형상 조형 */}
      <div 
        className="absolute w-14 h-14 rotate-45 border-[5px] transition-transform duration-75"
        style={{ 
          backgroundColor: config.accentDeep, 
          borderColor: config.stoneBase,
          boxShadow: `0 0 20px ${config.stoneBase}77, inset 0 0 12px rgba(0,0,0,0.7)`
        }}
      />
      {/* 광석 중앙 내부의 영롱한 야광 크리스탈 핵 코어 */}
      <div 
        className="absolute w-6 h-6 rotate-45 animate-pulse"
        style={{ backgroundColor: config.stoneGlow }}
      />
      
      {/* 1타 타격 시 보석 표면을 가르는 정밀 크랙 오버레이 선 (글씨 100% 삭제) */}
      {crackLevel >= 1 && (
        <div className="absolute w-full h-1 bg-black/90 rotate-12 top-1/2 left-0 pointer-events-none shadow-md rounded" />
      )}
      {/* 2타 타격 시 교차하는 크로스 파쇄 선 */}
      {crackLevel >= 2 && (
        <div className="absolute w-1 h-full bg-black/90 -rotate-45 top-0 left-1/2 pointer-events-none shadow-md rounded" />
      )}
    </div>
  )
}

// ==========================================
// 5. 결과 행 릴 뷰어 컴포넌트 계통 (UI 완전 원상복구)
// ==========================================
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
        borderColor: "rgba(255,255,255,0.12)",
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
    <li className="flex items-center gap-3 rounded-xl border px-3.5 py-2 bg-[#12141a] border-white/5 shadow-md w-full">
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
// 6. 메인 통합 프레임 스테이지
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

    // 3타 프레임 시퀀서 구동
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

  const rockTransformStyle = strikeMotion === "hit" ? "scale(0.90) translate(-2px, 2px)" : "scale(1)"

  return (
    <main className="min-h-[100dvh] w-full bg-[#090a0f] flex items-center justify-center overflow-hidden font-sans select-none antialiased">
      <div className="relative h-[100dvh] w-full max-w-[430px] overflow-hidden bg-black flex flex-col border-x border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        
        {/* 상단 프리미엄 헤더 */}
        <header className="p-6 flex justify-between items-end bg-gradient-to-b from-[#11131a] to-black border-b border-white/5">
          <div>
            <h1 className="text-white/30 text-[10px] font-black tracking-[0.25em] mb-1">MATRIX ENGINE ONLINE</h1>
            <div className="flex items-center gap-2">
              <p className="text-white text-2xl font-black tracking-tight">ROUND {round}</p>
              {phase === "idle" && (
                <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                  <button
                    onClick={() => setRound((r) => Math.max(1, r - 1))}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-white/50 hover:text-white text-xs font-bold active:bg-white/10"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setRound((r) => r + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-white/50 hover:text-white text-xs font-bold active:bg-white/10"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span 
              className="text-[9px] font-black tracking-widest px-3 py-1 rounded-full border border-white/10 shadow-inner"
              style={{ color: theme.accent, borderColor: `${theme.accent}33`, backgroundColor: `${theme.accent}0a` }}
            >
              {theme.label}
            </span>
          </div>
        </header>

        {/* 중앙 채굴 베젤 무대 */}
        <div className="flex-1 flex flex-col justify-center p-6 gap-4">
          <div 
            className="relative w-full aspect-square rounded-[32px] border-[5px] overflow-hidden transition-all duration-500 shadow-2xl flex items-center justify-center"
            style={{ 
              backgroundColor: theme.caveBg, 
              borderColor: theme.accent,
              boxShadow: `inset 0 0 50px rgba(0,0,0,0.9), 0 0 30px ${theme.accent}15`
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_45%,transparent_20%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

            {/* 환경 야광 조명 파티클 */}
            {SPECK_POS.map((o, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-sm opacity-40 animate-pulse"
                style={{ top: o.top, left: o.left, backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }}
              />
            ))}

            {/* [복원 완료 명세]: 외부 파일을 완전히 배제하고, 순수 코딩으로 조형한 픽셀 광석 상시 고정 배치 */}
            <div 
              className="absolute left-[28%] top-[50%] -translate-y-1/2 -translate-x-1/2 z-10 transition-transform duration-75"
              style={{ transform: rockTransformStyle }}
            >
              <PurePixelCodingOre config={theme} crackLevel={crackLevel} />
            </div>

            {/* 타격 순간 터지는 강력한 네온 섬광 */}
            {strikeMotion === "hit" && (
              <div 
                className="absolute w-16 h-16 rounded-full bg-white opacity-40 animate-ping pointer-events-none"
                style={{ top: "45%", left: "22%", boxShadow: `0 0 40px 20px ${theme.accent}` }}
              />
            )}

            {/* 정방향 우측 고정식 광부 개체 */}
            <button
              type="button"
              onClick={handleStrike}
              disabled={phase !== "idle"}
              className="absolute right-4 bottom-6 z-10 cursor-pointer outline-none disabled:cursor-default"
            >
              {phase === "idle" && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-black text-[9px] text-white/80 px-2.5 py-1 rounded-full bg-black/90 border border-white/10 shadow-lg tracking-wider animate-bounce">
                  TAP TO EXTRACT
                </span>
              )}

              <div 
                className="w-[140px] h-[170px] flex items-center justify-center transition-transform duration-75 ease-in-out"
                style={{ transform: minerTransformStyle }}
              >
                <img
                  src="/dwarf-miner.png"
                  alt="Dwarf Miner"
                  className="w-full h-full object-contain object-bottom pixelated drop-shadow-[0_6px_0_rgba(0,0,0,0.7)]"
                />
              </div>
            </button>
          </div>

          {/* 안내 배너 */}
          <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-4 text-center shadow-md">
            <p className="text-[11px] text-white/50 leading-relaxed font-medium">
              {phase === "results" ? "원석 자산 분산 추출 및 정제 시퀀스 완료." : theme.description}
            </p>
          </div>
        </div>

        {/* 하단 10줄 조합 결과 보드창 (박살났던 UI 완전 원상복구) */}
        <section 
          className={`transition-all duration-500 ease-out overflow-hidden bg-[#07080c] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] rounded-t-[36px] ${
            isResults ? "h-[360px] opacity-100" : "h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-6 flex flex-col h-full gap-4 w-full">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 w-full">
              <h2 className="text-white font-black text-xs tracking-wider">EXTRACTED MATRICES</h2>
              <button 
                onClick={handleReset} 
                className="text-[9px] font-black tracking-widest text-white/40 hover:text-white bg-white/5 px-2.5 py-1 rounded-md border border-white/5 transition-colors"
              >
                REFRESH
              </button>
            </div>
            
            <ul className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1 w-full">
              {rows.map((row, i) => (
                <EmbeddedLootRow key={row.id} row={row} index={i} config={theme} />
              ))}
            </ul>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="p-4 text-center bg-black border-t border-white/5">
          <p className="text-[8px] text-white/20 font-mono tracking-[0.3em] uppercase">
            Entropy Boundary Pool: {theme.poolSize.toLocaleString()} Density Units
          </p>
        </footer>
      </div>
    </main>
  )
}
