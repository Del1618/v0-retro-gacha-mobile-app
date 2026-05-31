"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { SparkBurst } from "@/components/spark-burst"
import { LootRow } from "@/components/loot-row"
import { OreRock } from "@/components/ore-rock"
import { generateRows, type LottoRow } from "@/lib/lottery"
import { randomTheme, THEMES, type Theme } from "@/lib/themes"
import { primeAudio, playClang, playShatter } from "@/lib/sfx"

/* ----------------------------------------------------------------------------
 * Clean, state-driven Mining Gacha.
 *
 * Phase:  idle -> striking -> results
 * AnimState (discrete frames):  idle -> windup -> impact -> recovery
 *
 * One activation runs THREE strikes. Each strike steps through the 4 frames;
 * the impact frame degrades the ore (crack 1 -> crack 2 -> shatter), fires a
 * theme-colored particle burst and a screen shake. After the 3rd shatter the
 * 10 result rows slide up from the bottom.
 * -------------------------------------------------------------------------- */

type Phase = "idle" | "striking" | "results"
type AnimState = "idle" | "windup" | "impact" | "recovery"

// Discrete sprite frames (already drawn facing LEFT) — pure frame swapping,
// no CSS rotation, the dwarf's structural position stays locked.
const FRAME_SRC: Record<AnimState, string> = {
  idle: "/dwarf_idle.png",
  windup: "/dwarf_up.png",
  impact: "/dwarf_down.png",
  recovery: "/dwarf_strike.png",
}

const STRIKES = 3
const FRAME_MS = 120 // fast sequential frame switching
const T_WINDUP = 0
const T_IMPACT = FRAME_MS // 120
const T_RECOVERY = FRAME_MS * 2 // 240
const STRIKE_MS = FRAME_MS * 3 // 360 — full windup->impact->recovery cycle
const T_RESET = FRAME_MS * 3

// Ambient ore specks scattered on the cave walls (colored per theme).
const SPECK_POS = [
  { top: "10%", left: "14%" },
  { top: "18%", left: "82%" },
  { top: "44%", left: "8%" },
  { top: "30%", left: "78%" },
  { top: "58%", left: "90%" },
  { top: "8%", left: "52%" },
]

export function GachaGame() {
  // Deterministic on the server (avoids hydration mismatch); randomized after mount.
  const [theme, setTheme] = useState<Theme>(THEMES.GOLD)
  const [phase, setPhase] = useState<Phase>("idle")
  const [anim, setAnim] = useState<AnimState>("idle")
  const [crackLevel, setCrackLevel] = useState(0)
  const [broken, setBroken] = useState(false)
  const [sparkKey, setSparkKey] = useState(0)
  const [rows, setRows] = useState<LottoRow[]>([])

  const lockRef = useRef(false)
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  // Pick a random theme on the client after hydration.
  useEffect(() => {
    setTheme((prev) => randomTheme(prev.key))
  }, [])

  const handleStrike = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    primeAudio() // unlock the audio context on this user gesture
    setPhase("striking")

    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms))
    }

    for (let i = 0; i < STRIKES; i++) {
      const base = 60 + i * STRIKE_MS
      const last = i === STRIKES - 1
      at(base + T_WINDUP, () => setAnim("windup"))
      at(base + T_IMPACT, () => {
        setAnim("impact")
        setCrackLevel(i + 1) // 1: small crack, 2: large crack, 3: shatter
        setSparkKey((k) => k + 1)
        if (last) {
          setBroken(true)
          playShatter() // ore breaks -> glassy shatter + shiny loot chime
        } else {
          playClang() // steel pickaxe bites the rock
        }
      })
      at(base + T_RECOVERY, () => setAnim("recovery"))
      if (!last) at(base + T_RESET, () => setAnim("idle"))
    }

    // Reveal loot only AFTER the 3rd strike has shattered the ore.
    at(60 + STRIKES * STRIKE_MS + 200, () => {
      setRows(generateRows(10))
      setPhase("results")
      lockRef.current = false
    })
  }, [])

  const handleReset = useCallback(() => {
    clearTimers()
    lockRef.current = false
    setRows([])
    setCrackLevel(0)
    setBroken(false)
    setAnim("idle")
    setPhase("idle")
    setTheme((prev) => randomTheme(prev.key)) // fresh theme each round
  }, [clearTimers])

  const isResults = phase === "results"
  const isStriking = phase === "striking"

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 [image-rendering:pixelated]">
      <div
        className={`animate-modal-expand pixel-frame flex w-full max-w-[360px] flex-col overflow-hidden rounded-md [image-rendering:pixelated] ${
          anim === "impact" ? "animate-shake-short" : ""
        }`}
        style={{ background: theme.caveBg }}
      >
        {/* ---- Title bar ---- */}
        <div
          className="flex items-center justify-between border-b-4 px-3 py-2 font-pixel"
          style={{ background: theme.caveDeep, borderColor: theme.accent }}
        >
          <span className="text-[9px]" style={{ color: theme.accent }}>
            {"\u2692"} {theme.label}
          </span>
          <span className="text-[8px]" style={{ color: theme.oreLight }}>
            {isResults ? "x10 HAUL" : `STRIKE ${Math.min(crackLevel, STRIKES)}/${STRIKES}`}
          </span>
        </div>

        {/* ---- Cave (upper region) ---- */}
        <div
          className="relative h-[260px] w-full overflow-hidden [image-rendering:pixelated]"
          style={{ background: theme.caveBg }}
        >
          {/* vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_30%,rgba(0,0,0,0.55)_100%)]" />

          {/* ambient ore specks */}
          {SPECK_POS.map((o, i) => (
            <span
              key={i}
              className="animate-ore-pulse absolute h-2.5 w-2.5 rounded-[1px]"
              style={{
                top: o.top,
                left: o.left,
                backgroundColor: theme.speck,
                boxShadow: `0 0 8px 2px ${theme.speck}`,
                animationDelay: `${i * 0.3}s`,
              }}
              aria-hidden="true"
            />
          ))}

          {/* ground tiles */}
          <div className="absolute bottom-0 left-0 right-0 flex h-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r-2 border-t-2 border-black/40"
                style={{ backgroundColor: i % 2 ? theme.ground : theme.groundAlt }}
              />
            ))}
          </div>

          {/* ---- Ore (left side, faces the dwarf) ---- */}
          <div className="absolute bottom-[18px] left-[34%] z-10 -translate-x-1/2">
            <div className={sparkKey > 0 && !broken ? "animate-ore-hit" : ""} key={sparkKey}>
              <OreRock theme={theme} crackLevel={crackLevel} broken={broken} />
            </div>
          </div>

          {/* impact particle burst, themed, where the blade meets the ore */}
          {sparkKey > 0 && isStriking && (
            <SparkBurst key={sparkKey} theme={theme} top="56%" left="36%" />
          )}

          {/* ---- Dwarf (always faces LEFT toward the ore) ---- */}
          <button
            type="button"
            onClick={handleStrike}
            disabled={phase !== "idle"}
            aria-label="Strike the ore to mine your numbers"
            className="absolute bottom-4 left-[64%] z-10 -translate-x-1/2 cursor-pointer rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-retro-cyan disabled:cursor-default"
          >
            {phase === "idle" && (
              <span className="animate-float-tip absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-[9px] text-retro-red [text-shadow:0_0_8px_rgba(255,51,85,0.9)]">
                <span className="animate-neon-blink">[ TOUCH ! ]</span>
              </span>
            )}

            {/* frame-by-frame sprite swap — structural position locked */}
            <span className={`block ${phase === "idle" ? "animate-breathe" : ""}`}>
              <img
                src={FRAME_SRC[phase === "idle" ? "idle" : anim] || "/placeholder.svg"}
                alt="Pixel dwarf miner swinging a pickaxe"
                width={120}
                height={180}
                className="pixelated h-[180px] w-[120px] object-contain object-bottom drop-shadow-[0_6px_0_rgba(0,0,0,0.5)]"
              />
            </span>
          </button>
        </div>

        {/* ---- Results region (slides up only after the 3rd strike) ---- */}
        {isResults && (
          <div
            className="animate-results-rise flex flex-col border-t-4"
            style={{ background: theme.caveDeep, borderColor: theme.accent }}
          >
            <div className="flex items-center justify-between px-3 py-2 font-pixel">
              <span className="text-[8px]" style={{ color: theme.accent }}>
                MINED NUMBERS
              </span>
              <span className="text-[8px]" style={{ color: theme.oreLight }}>
                6 + BONUS
              </span>
            </div>

            <ul className="flex max-h-[42dvh] flex-col gap-1.5 overflow-y-auto px-2 pb-2">
              {rows.map((row, i) => (
                <LootRow key={row.id} row={row} index={i} theme={theme} />
              ))}
            </ul>

            <button
              type="button"
              onClick={handleReset}
              className="m-2 cursor-pointer rounded-sm border-2 py-3 font-pixel text-[9px] transition-transform active:translate-y-0.5 [text-shadow:0_1px_0_rgba(255,255,255,0.3)]"
              style={{ borderColor: theme.accent, background: theme.accentDeep, color: theme.accentText }}
            >
              {"\u2692"} STRIKE AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
