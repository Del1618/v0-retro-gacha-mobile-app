"use client"

import { useState, useCallback, useRef } from "react"
import { SparkBurst } from "@/components/spark-burst"
import { LootRow } from "@/components/loot-row"
import { OreRock } from "@/components/ore-rock"
import { generateRows, type LottoRow } from "@/lib/lottery"

type Phase = "idle" | "striking" | "results"

// Six sequential mining frames built from the original (mirrored) dwarf sprite.
// `rot` swings the pickaxe, `hits`/`broken` shrink the ore so it visibly
// wears down to nothing as the dwarf chops it.
const FRAMES = [
  { rot: -10, hits: 0, broken: false, spark: false }, // ready, lean back
  { rot: -28, hits: 0, broken: false, spark: false }, // wind up high
  { rot: 22, hits: 1, broken: false, spark: true }, // first chop -> impact
  { rot: -24, hits: 1, broken: false, spark: false }, // lift again
  { rot: 22, hits: 2, broken: false, spark: true }, // second chop -> impact
  { rot: 8, hits: 3, broken: true, spark: true }, // final crush, ore breaks
] as const

const FRAME_MS = 220

// Background ambient ore specks scattered on the cave walls.
const SPECKS = [
  { top: "10%", left: "14%", color: "#ffcd75" },
  { top: "18%", left: "82%", color: "#ffcd75" },
  { top: "44%", left: "8%", color: "#38b764" },
  { top: "30%", left: "78%", color: "#38b764" },
  { top: "58%", left: "90%", color: "#ffcd75" },
  { top: "8%", left: "52%", color: "#38b764" },
]

export function GachaGame() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [frameIdx, setFrameIdx] = useState(0)
  const [rows, setRows] = useState<LottoRow[]>([])
  const [sparkKey, setSparkKey] = useState(0)
  const lockRef = useRef(false)

  const handleStrike = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true

    setPhase("striking")

    // Step through all six frames in order.
    FRAMES.forEach((f, i) => {
      window.setTimeout(() => {
        setFrameIdx(i)
        if (f.spark) setSparkKey((k) => k + 1)
      }, 80 + i * FRAME_MS)
    })

    // Reveal loot after the final frame plays out. Keep the last frame so the
    // ore stays mined-out (broken) in the results view instead of regrowing.
    window.setTimeout(() => {
      setRows(generateRows(10))
      setPhase("results")
      setFrameIdx(FRAMES.length - 1)
      lockRef.current = false
    }, 80 + FRAMES.length * FRAME_MS + 260)
  }, [])

  const handleReset = useCallback(() => {
    setRows([])
    setFrameIdx(0)
    setPhase("idle")
  }, [])

  const current = FRAMES[frameIdx]

  const isResults = phase === "results"

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
      <div
        className={`animate-modal-expand pixel-frame flex w-full max-w-[360px] flex-col overflow-hidden rounded-md bg-cave ${
          phase === "striking" ? "animate-shake" : ""
        }`}
      >
        {/* ---- Title bar ---- */}
        <div className="flex items-center justify-between border-b-4 border-retro-blue bg-cave-deep px-3 py-2 font-pixel">
          <span className="text-[9px] text-retro-gold">{"\u2692"} ORE STRIKE</span>
          <span className="text-[8px] text-retro-cyan">
            {isResults ? "x10 HAUL" : "GACHA"}
          </span>
        </div>

        {/* ---- Cave (upper region) ---- */}
        <div className="relative h-[260px] w-full overflow-hidden bg-cave [image-rendering:pixelated]">
          {/* subtle cave vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_30%,rgba(0,0,0,0.55)_100%)]" />

          {/* ambient ore specks on the cave walls */}
          {SPECKS.map((o, i) => (
            <span
              key={i}
              className="animate-ore-pulse absolute h-2.5 w-2.5 rounded-[1px]"
              style={{
                top: o.top,
                left: o.left,
                backgroundColor: o.color,
                boxShadow: `0 0 8px 2px ${o.color}`,
                animationDelay: `${i * 0.3}s`,
              }}
              aria-hidden="true"
            />
          ))}

          {/* ground rock tiles */}
          <div className="absolute bottom-0 left-0 right-0 flex h-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r-2 border-t-2 border-black/40 bg-[#2a2433]"
                style={{ backgroundColor: i % 2 ? "#2a2433" : "#322a3d" }}
              />
            ))}
          </div>

          {/* ---- The target amethyst ore (left side, wears down each frame) ---- */}
          <div className="absolute bottom-[18px] left-[36%] z-10 -translate-x-1/2">
            <div key={sparkKey} className={sparkKey > 0 && !current.broken ? "animate-ore-hit" : ""}>
              <OreRock hits={current.hits} broken={current.broken} />
            </div>
          </div>

          {/* impact burst lands where the pickaxe head meets the ore */}
          {sparkKey > 0 && phase === "striking" && (
            <SparkBurst key={sparkKey} top="64%" left="42%" />
          )}

          {/* ---- The dwarf (mirrored first design, 6-frame mining swing) ---- */}
          <button
            type="button"
            onClick={handleStrike}
            disabled={phase !== "idle"}
            aria-label="Strike the rock to mine your numbers"
            className="absolute bottom-4 left-[62%] z-10 -translate-x-1/2 cursor-pointer rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-retro-cyan disabled:cursor-default"
          >
            {/* floating tooltip */}
            {phase === "idle" && (
              <span className="animate-float-tip absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-[9px] text-retro-red [text-shadow:0_0_8px_rgba(255,51,85,0.9)]">
                <span className="animate-neon-blink">[ TOUCH ! ]</span>
              </span>
            )}

            <span className={`block ${phase === "idle" ? "animate-breathe" : ""}`}>
              <img
                src="/dwarf-miner.png"
                alt="Pixel dwarf miner swinging a pickaxe"
                width={150}
                height={150}
                className="pixelated h-[150px] w-[150px] object-contain object-bottom drop-shadow-[0_6px_0_rgba(0,0,0,0.5)]"
                style={{
                  transform: `scaleX(-1) rotate(${phase === "striking" ? current.rot : 0}deg)`,
                  transformOrigin: "50% 88%",
                  transition: "transform 0.12s ease-out",
                }}
              />
            </span>
          </button>
        </div>

        {/* ---- Results region ---- */}
        {isResults && (
          <div className="flex flex-col border-t-4 border-retro-blue bg-cave-deep">
            <div className="flex items-center justify-between px-3 py-2 font-pixel">
              <span className="text-[8px] text-retro-gold">MINED NUMBERS</span>
              <span className="text-[8px] text-retro-cyan">6 + BONUS</span>
            </div>

            <ul className="flex max-h-[42dvh] flex-col gap-1.5 overflow-y-auto px-2 pb-2">
              {rows.map((row, i) => (
                <LootRow key={row.id} row={row} index={i} />
              ))}
            </ul>

            <button
              type="button"
              onClick={handleReset}
              className="m-2 cursor-pointer rounded-sm border-2 border-retro-gold bg-retro-gold-deep py-3 font-pixel text-[9px] text-cave-deep transition-transform active:translate-y-0.5 [text-shadow:0_1px_0_rgba(255,255,255,0.3)]"
            >
              {"\u2692"} STRIKE AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
