"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { SparkBurst } from "@/components/spark-burst"
import { LootRow } from "@/components/loot-row"
import { OreRock } from "@/components/ore-rock"
import { generateRows, type LottoRow } from "@/lib/lottery"

type Phase = "idle" | "striking" | "results"

// Background ambient ore specks scattered on the cave walls.
const SPECKS = [
  { top: "10%", left: "14%", color: "#ffcd75" },
  { top: "18%", left: "82%", color: "#ffcd75" },
  { top: "44%", left: "8%", color: "#38b764" },
  { top: "30%", left: "78%", color: "#38b764" },
  { top: "58%", left: "90%", color: "#ffcd75" },
  { top: "8%", left: "52%", color: "#38b764" },
]

// Impact timings (ms) lined up with the 3 pickaxe swings (0.36s each).
const IMPACTS = [200, 560, 920]

export function GachaGame() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [rows, setRows] = useState<LottoRow[]>([])
  const [hits, setHits] = useState(0)
  const [broken, setBroken] = useState(false)
  const [sparkKey, setSparkKey] = useState(0)
  const lockRef = useRef(false)

  const handleStrike = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true

    setPhase("striking")

    // Three pickaxe swings: each impact shakes the ore, sparks, and adds a crack.
    IMPACTS.forEach((t, idx) => {
      window.setTimeout(() => {
        setHits(idx + 1)
        setSparkKey((k) => k + 1)
        if (idx === IMPACTS.length - 1) setBroken(true)
      }, t)
    })

    // Reveal loot after the ore shatters.
    window.setTimeout(() => {
      setRows(generateRows(10))
      setPhase("results")
      lockRef.current = false
    }, 1350)
  }, [])

  const handleReset = useCallback(() => {
    setRows([])
    setHits(0)
    setBroken(false)
    setPhase("idle")
  }, [])

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

          {/* ---- The target green ore ---- */}
          <div className="absolute bottom-[26px] left-[64%] z-10 -translate-x-1/2">
            <div key={sparkKey} className={sparkKey > 0 && !broken ? "animate-ore-hit" : ""}>
              <OreRock hits={hits} broken={broken} />
            </div>
          </div>

          {/* spark burst lands on the ore each swing */}
          {sparkKey > 0 && phase === "striking" && (
            <SparkBurst key={sparkKey} top="74%" left="64%" />
          )}

          {/* ---- The dwarf ---- */}
          <button
            type="button"
            onClick={handleStrike}
            disabled={phase !== "idle"}
            aria-label="Strike the rock to mine your numbers"
            className="absolute bottom-6 left-[34%] z-10 -translate-x-1/2 cursor-pointer rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-retro-cyan disabled:cursor-default"
          >
            {/* floating tooltip */}
            {phase === "idle" && (
              <span className="animate-float-tip absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-[9px] text-retro-red [text-shadow:0_0_8px_rgba(255,51,85,0.9)]">
                <span className="animate-neon-blink">[ TOUCH ! ]</span>
              </span>
            )}

            <span
              className={`block origin-bottom ${phase === "idle" ? "animate-breathe" : ""} ${
                phase === "striking" ? "animate-mine" : ""
              }`}
            >
              <Image
                src="/dwarf-miner.png"
                alt="Pixel dwarf miner holding a pickaxe"
                width={132}
                height={132}
                priority
                className="pixelated h-[132px] w-[132px] drop-shadow-[0_6px_0_rgba(0,0,0,0.5)]"
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
