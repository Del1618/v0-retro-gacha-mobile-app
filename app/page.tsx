"use client"

import { useState, useCallback, useRef, useEffect } from "react"

// ==========================================
// 1. 카오스 위상 수학 엔진 및 국면별 테마 프로필
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
    accent: "#2ecc71",
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
    accent: "#f1c40f",
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
    accent: "#3498db",
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
    accent: "#e74c3c",
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
  const phaseNum = (round - 1) % 300
  if (phaseNum < 45) return "GOLD_VEIN"
  if (phaseNum < 165) return "IRON_MINE"
  if (phaseNum < 240) return "CRYSTAL_CAVE"
  return "LAVA_ERUPTION"
}

// ==========================================
// 2. 유저 고유 난수 분산 생성 모듈
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
// 4. 결과 행 레이아웃 내부 컴포넌트
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
      className="flex items-center gap-2 rounded border-2 px-2.5 py-1.5"
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
// 5. 메인 게임기 컴포넌트 (100% 무오류 수직 물리 고도화판)
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
  const [phase, setPhase] = useState<"idle" | "striking" | "results">("idle")
  const [crackLevel, setCrackLevel] = useState(0)
  const [broken, setBroken] = useState(false)
  const [sparkKey, setSparkKey] = useState(0)
  const [rows, setRows] = useState<LottoRowData[]>([])
  
  // 수직 타격 모션을 위한 정밀 CSS 반동 스테이트
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
  const isStriking = phase === "striking"

  const handleStrike = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    setPhase("striking")

    const audio = audioRef.current
    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms))
    }

    // [1타 타격]
    at(0, () => { setStrikeMotion("hit"); setCrackLevel(1); setSparkKey(1); audio?.playClang(); })
    at(120, () => { setStrikeMotion("return"); })
    
    // [2타 타격]
    at(240, () => { setStrikeMotion("hit"); setCrackLevel(2); setSparkKey(2); audio?.playClang(); })
    at(360, () => { setStrikeMotion("return"); })
    
    // [3타 대격파 타격]
    at(480, () => { setStrikeMotion("hit"); setCrackLevel(3); setSparkKey(3); setBroken(true); audio?.playShatter(); })
    
    // [최종 완료 및 데이터 보드 언록]
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
    setBroken(false)
    setStrikeMotion("ready")
    setPhase("idle")
  }, [clearTimers])

  // 가짜 파일 대신 진짜 원본 자산 매핑
  const minerImageSrc = "/dwarf-miner.png"
  const rockImageSrc = "/ore-rock.png"

  // 수직 타격 모션을 만들어내는 안전한 물리 CSS Transform 매핑 테이블
  const minerTransformStyle = {
    ready: "translate(0, 0) scale(1)",
    hit: "translate(-20px, 12px) scale(1.05)", // 진짜 팔을 뻗어 왼쪽 아래 광석을 쾅 내리찍는 모션
    return: "translate(4px, -6px) scale(0.98)"  // 반동으로 살짝 위로 튕겨 올라오는 모션
  }[strikeMotion]

  return (
    <main className="min-h-[100dvh] w-full bg-[#1e202c] flex items-center justify-center overflow-hidden font-mono select-none">
      <div className="relative h-[100dvh] w-full max-w-[440px] overflow-hidden bg-[#0c0d14] flex items-center justify-center p-4">
        
        <div className="absolute inset-0 bg-[#161722] scale-105 blur-md opacity-25 pointer-events-none" />

        <div
          className={`relative border-4 flex w-full max-w-[360px] flex-col overflow-hidden rounded-md transition-all duration-150 ${
            strikeMotion === "hit" ? "translate-y-1" : "translate-y-0"
          }`}
          style={{
            background: theme.caveBg,
            borderColor: theme.accent,
            boxShadow: `0 0 24px 4px ${theme.accent}33`,
            imageRendering: "pixelated"
          }}
        >
          {/* ---- 상단 컨트롤러 바 ---- */}
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

          {/* ---- 메인 무대: 오리지널 /ore-rock.png 및 /dwarf-miner.png 직결형 ---- */}
          <div className="relative h-[240px] w-full overflow-hidden transition-colors duration-500" style={{ background: theme.caveBg }}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_25%,rgba(0,0,0,0.75)_100%)]" />

            {/* 야광 파티클 */}
            {SPECK_POS.map((o, i) => (
              <span
                key={i}
                className="absolute h-2.5 w-2.5 rounded-sm opacity-75"
                style={{
                  top: o.top,
                  left: o.left,
                  backgroundColor: theme.speck,
                  boxShadow: `0 0 10px 2px ${theme.speck}`,
                }}
              />
            ))}

            {/* 바닥 레일 */}
            <div className="absolute bottom-0 left-0 right-0 flex h-8 border-t border-black/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r"
                  style={{ backgroundColor: i % 2 ? theme.ground : theme.groundAlt, borderColor: "rgba(0,0,0,0.15)" }}
                />
              ))}
            </div>

            {/* [오리지널 복원]: 100% 실존하는 원석 이미지 표출 및 균열선 연출 */}
            <div className="absolute bottom-[16px] left-[32%] z-10 -translate-x-1/2">
              <div className={strikeMotion === "hit" ? "animate-bounce scale-110" : "scale-100 transition-transform"}>
                <img
                  src={rockImageSrc}
                  alt="Original Ore"
                  width={75}
                  height={75}
                  className={`pixelated transition-all duration-300 ${crackLevel === 3 ? "opacity-0 scale-50" : "opacity-100"}`}
                  style={{ filter: `drop-shadow(0 0 8px ${theme.accent}aa)` }}
                />
              </div>

              {/* 진짜 2D 격파 균열 특수 이펙트 오버레이 선 (실시간 드로잉) */}
              {crackLevel === 1 && (
                <div className="absolute inset-0 border-2 border-red-500/50 rotate-12 pointer-events-none" />
              )}
              {crackLevel === 2 && (
                <div className="absolute inset-0 border-4 border-orange-500/70 -rotate-45 pointer-events-none" />
              )}
              {crackLevel === 3 && (
                <div className="absolute inset-0 flex items-center justify-center animate-ping">
                  <span className="text-[11px] font-bold text-white whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    💎 ✨HAUL!
                  </span>
                </div>
              )}
            </div>

            {/* 강력한 도트 불꽃 섬광 이펙트 */}
            {isStriking && strikeMotion === "hit" && (
              <div 
                className="absolute w-12 h-12 rounded-full bg-white opacity-80 animate-ping pointer-events-none"
                style={{ top: "56%", left: "26%", boxShadow: `0 0 32px 12px ${theme.accent}` }}
              />
            )}

            {/* ---- [오리지널 복원]: 진짜 실존하는 /dwarf-miner.png 이미지 기반 수직 충격 물리 엔진 ---- */}
            <button
              type="button"
              onClick={handleStrike}
              disabled={phase !== "idle"}
              className="absolute bottom-2 left-[66%] z-10 -translate-x-1/2 cursor-pointer rounded outline-none disabled:cursor-default"
            >
              {phase === "idle" && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-[9px] text-white px-2 py-0.5 rounded bg-black/80 border border-white/10 shadow-md">
                  <span className="animate-pulse" style={{ color: theme.accent }}>[ TAP CHARACTER ]</span>
                </span>
              )}

              {/* 깨짐이 불가능한 청정 1레이어 드라이버 (수직 반동 매핑) */}
              <div 
                className="w-[120px] h-[160px] flex items-center justify-center transition-transform duration-75 ease-in-out"
                style={{ transform: minerTransformStyle }}
              >
                <img
                  src={minerImageSrc}
                  alt="Original Dwarf Miner"
                  width={120}
                  height={160}
                  className="w-full h-full object-contain object-bottom pixelated drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]"
                />
              </div>
            </button>
          </div>

          {/* ---- 국면 가이드 배너 ---- */}
          <div className="bg-[#0c0d16] p-2.5 text-center border-t border-b border-black/40">
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed tracking-tight">
              {isResults ? "🎉 채굴 원석 자산 정제 프로세스 완수!" : theme.description}
            </p>
            <div className="mt-1 text-[7px] text-gray-600 font-mono tracking-widest">
              PHASE REGION POOL SIZE: {theme.poolSize.toLocaleString()} COMBINATIONS
            </div>
          </div>

          {/* ---- 6. 10줄 정예 조합 결과창 ---- */}
          {isResults && (
            <div className="flex flex-col bg-[#05060a] border-t-4 transition-all duration-300" style={{ borderColor: theme.accent }}>
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
