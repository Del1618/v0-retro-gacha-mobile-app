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
// 2. 난수 분산 생성 모듈
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
// 4. 결과 출력용 로우 컴포넌트 장치계
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
    <li className="flex items-center gap-3 rounded-xl border px-3.5 py-2 bg-[#12141a] border-white/5 shadow-md">
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
// 5. 메인 마스터 프레임 엔지니어링 스테이지
// ==========================================
const SPECK_POS =
