"use client"

import type { Theme } from "@/lib/themes"

const GEM = "polygon(50% 0, 100% 30%, 82% 100%, 18% 100%, 0 30%)"
const FACET = "polygon(50% 0, 100% 30%, 50% 100%, 0 30%)"

// Three crystal points sprouting from a rocky base.
const CRYSTALS = [
  { left: 16, bottom: 30, w: 26, h: 50, rot: -13, z: 1 },
  { left: 38, bottom: 34, w: 34, h: 66, rot: 3, z: 3 },
  { left: 60, bottom: 30, w: 24, h: 46, rot: 17, z: 2 },
]

/**
 * Procedurally drawn, theme-colored ore deposit.
 * crackLevel 0 = pristine, 1 = small crack, 2 = large crack, broken = shattered.
 */
export function OreRock({
  theme,
  crackLevel,
  broken,
}: {
  theme: Theme
  crackLevel: number
  broken: boolean
}) {
  return (
    <div
      className="relative h-[112px] w-[112px] [image-rendering:pixelated]"
      style={{
        opacity: broken ? 0 : 1,
        transform: broken ? "scale(0.55)" : "scale(1)",
        transformOrigin: "bottom center",
        transition: "opacity 0.35s ease-out, transform 0.35s ease-out",
        filter: `brightness(${1 + crackLevel * 0.08})`,
      }}
      aria-hidden="true"
    >
      {/* theme glow */}
      <div
        className="animate-ore-pulse pointer-events-none absolute inset-0 -z-10"
        style={{ background: `radial-gradient(circle at 50% 46%, ${theme.oreGlow}, transparent 66%)` }}
      />

      {/* rock base */}
      <div
        className="absolute bottom-2 left-1/2 h-7 w-[94px] -translate-x-1/2 rounded-md border-2 border-black/60"
        style={{ background: theme.rock }}
      />
      <div
        className="absolute bottom-[18px] left-[12px] h-5 w-9 rounded-md border-2 border-black/60"
        style={{ background: theme.rockLight }}
      />
      <div
        className="absolute bottom-[16px] right-[10px] h-4 w-8 rounded-md border-2 border-black/60"
        style={{ background: theme.rockDark }}
      />

      {/* crystals */}
      {CRYSTALS.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: c.left,
            bottom: c.bottom,
            width: c.w,
            height: c.h,
            transform: `rotate(${c.rot}deg)`,
            zIndex: c.z,
          }}
        >
          <div
            className="h-full w-full"
            style={{ background: theme.oreMain, clipPath: GEM, boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.55)" }}
          />
          {/* bright facet highlight */}
          <div
            className="absolute left-[16%] top-[10%] h-[52%] w-[30%]"
            style={{ background: theme.oreLight, clipPath: FACET }}
          />
        </div>
      ))}

      {/* crack overlays */}
      {crackLevel >= 1 && (
        <div className="absolute left-[46%] top-[32%] h-9 w-[3px] -rotate-12 bg-black/80" />
      )}
      {crackLevel >= 2 && (
        <>
          <div className="absolute left-[39%] top-[40%] h-7 w-[3px] rotate-[22deg] bg-black/80" />
          <div className="absolute left-[53%] top-[46%] h-6 w-[3px] -rotate-[28deg] bg-black/80" />
        </>
      )}
    </div>
  )
}
