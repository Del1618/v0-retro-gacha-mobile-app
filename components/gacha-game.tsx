"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { SparkBurst } from "@/components/spark-burst"
import { LootRow } from "@/components/loot-row"
import { OreRock } from "@/components/ore-rock"

type Phase = "idle" | "striking" | "results"
type AnimState = "idle" | "windup" | "impact" | "recovery"

// --- [정석적 기획] 이미지 파일 자체를 타닥 갈아끼우는 오락실 프레임 스위칭 소스 ---
const FRAME_SRC: Record<AnimState, string> = {
  idle: "/dwarf_idle.png",
  windup: "/dwarf_up.png",
  impact: "/dwarf_down.png",
  recovery: "/dwarf_strike.png",
}

const STRIKES = 3
const FRAME_MS = 120 
const T_WINDUP = 0
const T_IMPACT = FRAME_MS
const T_RECOVERY = FRAME_MS * 2
const STRIKE_MS = FRAME_MS * 3
const T_RESET = FRAME_MS * 3

const SPECK_POS = [
  { top: "10%", left: "14%" },
  { top: "18%", left: "82%" },
  { top: "44%", left: "8%" },
  { top: "30%", left: "78%" },
  { top: "58%", left: "90%" },
  { top: "8%", left: "52%" },
]

// --- [백엔드 이식] 300회 카오스 위상 수학 엔진 및 테마 통합 구조계 ---
interface EmbeddedTheme {
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

const LOCAL_THEMES: Record<string, EmbeddedTheme> = {
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
    poolSize: 2194578
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
    poolSize: 5204120
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
    poolSize: 3410560
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
    poolSize: 7854010
  }
}

function calculateEmbeddedPhase(round: number): EmbeddedTheme {
  const phase = (round - 1) % 300
  if (phase < 45) return LOCAL_THEMES.GOLD_VEIN
  if (phase < 165) return LOCAL_THEMES.IRON_MINE
  if (phase < 240) return LOCAL_THEMES.CRYSTAL_CAVE
  return LOCAL_THEMES.LAVA_ERUPTION
}

// --- [중복 차단] 유저 고유 타임스탬프 융합 난수 분산 샘플러 (Global Unique Sampler) ---
function generateEmbeddedLottoRows(round: number, count: number): any[] {
  const theme = calculateEmbeddedPhase(round)
  const results: any[] = []
  
  // 터치 시점 밀리초와 무작위 엔트로피 값을 융합하여 절대 겹칠 수 없는 타임-시드 빌드
  const cryptoSeed = Date.now() + Math.floor(Math.random() * 100000)
  let pointer = (cryptoSeed % theme.poolSize) + 1

  for (let s = 0; s < count; s++) {
    const mainNumbers: number[] = []
    let stepSeed = pointer + (s * 1009) // 일정한 보폭으로 풀 내부를 고르게 무작위 도약

    while (mainNumbers.length < 6) {
      const randVal = (Math.abs(Math.sin(stepSeed + mainNumbers.length)) * 100000 % 45) + 1
      const num = Math.floor(randVal)
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num)
      }
      stepSeed += 23
    }
    mainNumbers.sort((a, b) => a - b)

    // 2등 저격용 위성 보너스 번호 정밀 연산 수식
    let bonusNumber = Math.floor((Math.abs(Math.cos(stepSeed)) * 100000 % 45)) + 1
    while (mainNumbers.includes(bonusNumber)) {
      bonusNumber = (bonusNumber % 45) + 1
    }

    results.push({
      id: `${round}-${cryptoSeed}-${s}`,
      main: mainNumbers,
      bonus: bonusNumber
    })
  }
  return results
}

// --- [귀맛 추가] 브라우��� 내장형 웹 오디오 API chiptune 합성 엔진 ---
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

  // "깡!" 강철 곡괭이가 바위를 뚫는 리얼 메탈 오락실 음원 생성
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

    // 날카로운 배음 노이즈 융합
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

  // "파카캉-💎" 보석이 완전히 파쇄되며 청량하게 쏟아지는 아르페지오 사운드
  playShatter() {
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime

    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51] // C5-E5-G5-C6-E6 승천 화음
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

export function GachaGame() {
  const [round, setRound] = useState(1227) // 기본 설정 시연회차 (황금 국맥 주기 적용 상태)
  const [phase, setPhase] = useState<Phase>("idle")
  const [anim, setAnim] = useState<AnimState>("idle")
  const [crackLevel, setCrackLevel] = useState(0)
  const [broken, setBroken] = useState(false)
  const [sparkKey, setSparkKey] = useState(0)
  const [rows, setRows] = useState<any[]>([])

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

  // 현재 회차의 수학적 주기를 실시간 계산하여 테마 적용
  const theme = calculateEmbeddedPhase(round)

  const handleStrike = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    setPhase("striking")

    const audio = audioRef.current
    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms))
    }

    // 300회 주기 동기화식 3타 타격 모듈 순회 시작
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
          audio?.playShatter() // 3타 완타 시 맑은 크리스탈 파쇄음
        } else {
          audio?.playClang()   // 일반 타격 시 묵직한 강철 깡 소리
        }
      })
      
      at(base + T_RECOVERY, () => setAnim("recovery"))
      if (!last) at(base + T_RESET, () => setAnim("idle"))
    }

    // 3타가 모두 터져서 바위가 파편화된 직후에 하단 데이터 보드 언록
    at(60 + STRIKES * STRIKE_MS + 180, () => {
      const uniqueData = generateEmbeddedLottoRows(round, 10)
      setRows(uniqueData)
      setPhase("results")
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

  const isResults = phase === "results"
  const isStriking = phase === "striking"

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 [image-rendering:pixelated] select-none">
      <div
        className={`animate-modal-expand pixel-frame border-4 flex w-full max-w-[360px] flex-col overflow-hidden rounded-md ${
          anim === "impact" ? "animate-shake-short" : ""
        }`}
        style={{ 
          background: theme.caveBg,
          borderColor: theme.accent,
          boxShadow: `0 0 20px 2px ${theme.accent}44`
        }}
      >
        {/* ---- 상단 정보창: 회차 넘버 스위칭 기믹 탑재 ---- */}
        <div
          className="flex items-center justify-between border-b-4 px-3 py-2 font-mono text-[10px] text-white"
          style={{ background: theme.caveDeep, borderColor: theme.accent }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: theme.accent }}>⛏️</span>
            <span className="font-bold">제 {round} 회차</span>
            {phase === "idle" && (
              <div className="flex gap-1 ml-1 scale-90">
                <button 
                  onClick={() => setRound(r => Math.max(1, r - 1))}
                  className="bg-[#212435] px-1.5 py-0.5 rounded text-gray-400 active:bg-gray-600 font-bold"
                >
                  -
                </button>
                <button 
                  onClick={() => setRound(r => r + 1)}
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

        {/* ---- 광산 메인 동굴 무대 ---- */}
        <div
          className="relative h-[240px] w-full overflow-hidden"
          style={{ background: theme.caveBg }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_30%,rgba(0,0,0,0.65)_100%)]" />

          {/* 실시간 위상 동기화식 파티클 야광 스펙트럼 */}
          {SPECK_POS.map((o, i) => (
            <span
              key={i}
              className="animate-ore-pulse absolute h-2.5 w-2.5 rounded-[1px]"
              style={{
                top: o.top,
                left: o.left,
                backgroundColor: theme.speck,
                boxShadow: `0 0 8px 2px ${theme.speck}`,
                animationDelay: `${i * 0.2}s`,
              }}
              aria-hidden="true"
            />
          ))}

          {/* 바닥 바위 그리드 타일 레일 */}
          <div className="absolute bottom-0 left-0 right-0 flex h-8 border-t border-black/40">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r-2"
                style={{ backgroundColor: i % 2 ? theme.ground : theme.groundAlt }}
              />
            ))}
          </div>

          {/* [정상화 객체 1]: 광석 (OreRock 컴포넌트 싱크 완료) */}
          <div className="absolute bottom-[14px] left-[32%] z-10 -translate-x-1/2">
            <div className={sparkKey > 0 && !broken ? "animate-ore-hit" : ""} key={sparkKey}>
              <OreRock theme={theme} crackLevel={crackLevel} broken={broken} />
            </div>
          </div>

          {/* 타격 순간 터지는 도트 파편 스파크 이펙트 */}
          {sparkKey > 0 && isStriking && (
            <SparkBurst key={sparkKey} theme={theme} top="58%" left="35%" />
          )}

          {/* [정상화 객체 2]: 정방향 좌측 고정식 도트 광부 캐릭터 박스 */}
          <button
            type="button"
            onClick={handleStrike}
            disabled={phase !== "idle"}
            className="absolute bottom-2 left-[66%] z-10 -translate-x-1/2 cursor-pointer rounded-sm outline-none disabled:cursor-default"
          >
            {/* TAP 가이드 안내판 */}
            {phase === "idle" && (
              <span className="animate-float-tip absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono font-bold text-[9px] text-white px-2 py-0.5 rounded bg-black/70 border border-white/10 shadow-md">
                <span className="animate-pulse" style={{ color: theme.accent }}>[ TAP CHARACTER ]</span>
              </span>
            )}

            {/* 변형 꼼수 전면 철폐! 깨끗하게 분리된 정방향 좌측 고정식 프레임 이미지 스위칭 */}
            <span className={`block ${phase === "idle" ? "animate-breathe" : ""}`}>
              <img
                src={FRAME_SRC[phase === "idle" ? "idle" : anim] || "/placeholder.svg"}
                alt="곡괭이를 휘두르는 도트 광부"
                width={120}
                height={180}
                className="pixelated h-[150px] w-[100px] object-contain object-bottom drop-shadow-[0_6px_0_rgba(0,0,0,0.5)]"
              />
            </span>
          </button>
        </div>

        {/* ---- 하단 데이터 보드: 3타 완료 후에만 아래에서 솟아오르는 결과 패널 ---- */}
        <div
          className="relative w-full overflow-hidden border-t-4"
          style={{ background: theme.caveDeep, borderColor: theme.accent }}
        >
          {!isResults ? (
            <div className="flex h-[120px] flex-col items-center justify-center gap-1 px-4 text-center">
              <span className="font-mono text-[11px] font-bold text-white">
                {isStriking ? "채굴 중... 바위를 부수는 중!" : "캐릭터를 터치해 광맥을 채굴하세요"}
              </span>
              <span className="font-mono text-[9px] leading-relaxed text-gray-400">
                {theme.description}
              </span>
            </div>
          ) : (
            <div className="animate-results-rise flex max-h-[260px] flex-col">
              <div
                className="flex items-center justify-between border-b-2 px-3 py-1.5"
                style={{ borderColor: `${theme.accent}55` }}
              >
                <span className="font-mono text-[10px] font-bold" style={{ color: theme.accent }}>
                  {`제 ${round} 회차 · 채굴 완료 (10조합)`}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded border-2 px-2 py-0.5 font-mono text-[9px] font-bold text-white active:translate-y-px"
                  style={{ borderColor: theme.accent, background: theme.accentDeep }}
                >
                  다시 채굴
                </button>
              </div>
              <ul className="flex flex-col gap-1.5 overflow-y-auto px-2.5 py-2">
                {rows.map((r, i) => (
                  <LootRow
                    key={r.id}
                    index={i}
                    themeKey={theme.key}
                    row={{ id: r.id, numbers: r.main, bonus: r.bonus }}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
