"use client"

import { useState, useCallback, useRef, useEffect } from "react"

// ==========================================
// 1. 300회 카오스 위상 수학 엔진 및 국면별 테마 프로필
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
    accent: "#2ecc71", // 청정 녹색 네온
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
    accent: "#f1c40f", // 평온한 황색 네온
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
    accent: "#3498db", // 디펜스 청색 네온
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
    accent: "#e74c3c", // 위기방어 적색 네온
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
// 4. 결과 출력용 픽셀 공 및 행 UI 내부 컴포넌트
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
// 5. 메인 게임기 무대 컴포넌트 (UI 복원판)
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

    // 3타 연속 타격 정석 프레임 시퀀서 구동
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
    setPhase("idle")
  }, [clearTimers])

  const dwarfImageSrc = {
    idle: "/dwarf_idle.png",
    up: "/dwarf_up.png",
    down: "/dwarf_down.png",
    strike: "/dwarf_strike.png",
  }[phase === "idle" ? "idle" : anim]

  return (
    <main className="min-h-[100dvh] w-full bg-[#1e202c] flex items-center justify-center overflow-hidden font-mono select-none">
      {/* 스마트폰 비율 격리형 모바일 컨테이너 */}
      <div className="relative h-[100dvh] w-full max-w-[440px] overflow-hidden bg-[#0c0d14] flex items-center justify-center p-4">
        
        {/* 중앙 집중식 메인 가챠 머신 팝업 */}
        <div
          className={`relative border-4 flex w-full max-w-[360px] flex-col overflow-hidden rounded-md transition-all duration-150 ${
            anim === "impact" ? "translate-y-1 scale-98" : "scale-100"
          }`}
          style={{
            background: theme.caveBg,
            borderColor: theme.accent,
            boxShadow: `0 0 24px 4px ${theme.accent}33`,
            imageRendering: "pixelated"
          }}
        >
          {/* ---- 상단 정보 통제 컨트롤러 바 ---- */}
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
                    className="bg-[#212435] px-1.5 py-0.5 rounded text-gray-400 active:bg-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold tracking-wider" style={{ color: theme.accent }}>
              {theme.label}
            </span>
          </div>

          {/* ---- 순수 도트 게임 연출 메인 무대 (흉측한 가이드 박스 전면 철폐) ---- */}
          <div className="relative h-[230px] w-full overflow-hidden" style={{ background: theme.caveBg }}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_25%,rgba(0,0,0,0.75)_100%)]" />

            {/* 환경 광석 파티클 야광 잔상 */}
            {SPECK_POS.map((o, i) => (
              <span
                key={i}
                className="absolute h-2.5 w-2.5 rounded-sm opacity-70"
                style={{
                  top: o.top,
                  left: o.left,
                  backgroundColor: theme.speck,
                  boxShadow: `0 0 10px 2px ${theme.speck}`,
                }}
              />
            ))}

            {/* 바닥 바위 타일 그리드 트랙 */}
            <div className="absolute bottom-0 left-0 right-0 flex h-7 border-t border-black/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r"
                  style={{ backgroundColor: i % 2 ? theme.ground : theme.groundAlt, borderColor: "rgba(0,0,0,0.15)" }}
                />
              ))}
            </div>

            {/* [광석 배치 개체]: 투명 배경 일체형 배치 */}
            <div className="absolute bottom-[14px] left-[32%] z-10 -translate-x-1/2">
              <div
                className={`w-[75px] h-[75px] flex flex-col items-center justify-center border-2 border-dashed rounded text-[9px] font-bold text-center p-1 transition-all ${
                  anim === "impact" ? "scale-90 brightness-120" : "scale-100"
                }`}
                style={{
                  backgroundColor: crackLevel === 3 ? "transparent" : `${theme.accent}12`,
                  borderColor: theme.accent,
                  color: theme.accent,
                }}
              >
                {crackLevel === 0 && <span>💎<br/>[원석 온전]</span>}
                {crackLevel === 1 && <span>💥<br/>[1차 균열]</span>}
                {crackLevel === 2 && <span>⚡<br/>[임계 파쇄]</span>}
                {crackLevel === 3 && <span className="text-white animate-bounce">✨HAUL!</span>}
              </div>
            </div>

            {/* 타격 순간 섬광 불꽃 이펙트 */}
            {sparkKey > 0 && isStriking && (
              <div 
                className="absolute w-8 h-8 rounded-full bg-white opacity-70 animate-ping pointer-events-none"
                style={{ top: "58%", left: "32%", boxShadow: `0 0 24px 8px ${theme.accent}` }}
              />
            )}

            {/* ---- 정방향 좌측 고정식 도트 광부 캐릭터 슬롯 (완벽 투명화) ---- */}
            <button
              type="button"
              onClick={handleStrike}
              disabled={phase !== "idle"}
              className="absolute bottom-2 left-[66%] z-10 -translate-x-1/2 cursor-pointer rounded outline-none disabled:cursor-default"
            >
              {/* [ TOUCH ! ] 플로팅 네온 텍스트 레이블 */}
              {phase === "idle" && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-[9px] text-white px-2 py-0.5 rounded bg-black/80 border border-white/10 shadow-md">
                  <span className="animate-pulse" style={{ color: theme.accent }}>[ TAP CHARACTER ]</span>
                </span>
              )}

              {/* 프레임 드라이버 웹 인터페이스 고정 스퀘어 */}
              <div className="relative w-[120px] h-[150px] flex flex-col items-center justify-center">
                <img
                  src={dwarfImageSrc}
                  alt="Miner"
                  className="w-full h-full object-contain object-bottom pixelated drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]"
                  onError={(e) => {
                    // 에셋 준비 단계용 실시간 폴백 렌더 대시보드
                    (e.target as HTMLElement).style.display = "none"
                  }}
                />
                {/* 텍스트 가이드는 마우스 호버 시에만 투명하게 나타나도록 비주얼 고도화 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center rounded opacity-0 hover:opacity-100 bg-black/40 transition-opacity font-mono text-[9px]">
                  <span className="text-white font-bold">[2D SPRITE]</span>
                  <span style={{ color: theme.accent }} className="font-bold text-[10px]">
                    {phase === "idle" ? "IDLE" : anim.toUpperCase()}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* ---- 300주기 수학 엔진 인포 내러티브 배너 ---- */}
          <div className="bg-[#0c0d16] p-2.5 text-center border-t border-b border-black/40">
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed tracking-tight">
              {isResults ? "🎉 채굴 원석 자산 정제 프로세스 완수!" : theme.description}
            </p>
            <div className="mt-1 text-[7px] text-gray-600 font-mono tracking-widest">
              PHASE REGION POOL SIZE: {theme.poolSize.toLocaleString()} COMBINATIONS
            </div>
          </div>

          {/* ---- 10줄 정예 조합 폭포수 결과 보드창 ---- */}
          {isResults && (
            <div className="flex flex-col bg-[#05060a] border-t-4" style={{ borderColor: theme.accent }}>
              <div className="flex items-center justify-between px-3 py-1.5 font-mono text-[8px] text-gray-500">
                <span>MINED MATRIX HAUL (10 ROWS)</span>
                <span style={{ color: theme.accent }}>6+BONUS SORTED</span>
              </div>

              <ul className="flex max-h-[160px] flex-col gap-1 overflow-y-auto px-2 pb-2">
                {rows.map((row, i) => (
                  <EmbeddedLootRow key={row.id} row={row} index={i} config={theme} />
                ))}
              </ul>

              <button
                type="button"
                onClick={handleReset}
                className="m-2 cursor-pointer rounded font-bold text-[10px] py-2.5 shadow-lg active:translate-y-0.5 text-black border border-white/10"
                style={{ backgroundColor: theme.accent }}
              >
                🔄 RESET & RE-MINE IN THIS PHASE
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
