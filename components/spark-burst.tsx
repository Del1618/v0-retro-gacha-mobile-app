"use client"

import type { Theme } from "@/lib/themes"

// 4 sharp impact rays forming a cross/star.
const RAYS = [0, 90, 45, 135]

// 12 chunky debris chips that fly out and drop.
const DEBRIS = Array.from({ length: 12 }, (_, i) => {
  const angle = -Math.PI / 2 + (i / 11 - 0.5) * Math.PI * 1.6
  const dist = 38 + (i % 3) * 18
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist + 12,
    size: i % 2 === 0 ? 8 : 5,
    idx: i,
    delay: (i % 3) * 16,
  }
})

/**
 * Massive pixel-particle burst, colored by the active theme. Square pixels
 * only (no rounded shapes) for a consistent 8-bit impact.
 */
export function SparkBurst({
  theme,
  top = "50%",
  left = "50%",
}: {
  theme: Theme
  top?: string
  left?: string
}) {
  return (
    <div
      className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 [image-rendering:pixelated]"
      style={{ top, left }}
      aria-hidden="true"
    >
      {/* central blocky flash */}
      <span
        className="animate-spark absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 18, height: 18, background: theme.sparkCore, ["--dx" as string]: "0px", ["--dy" as string]: "0px" }}
      />
      {/* themed pixel cross around the flash */}
      <span
        className="animate-spark absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 30, height: 8, background: theme.sparkRay, ["--dx" as string]: "0px", ["--dy" as string]: "0px" }}
      />
      <span
        className="animate-spark absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 8, height: 30, background: theme.sparkRay, ["--dx" as string]: "0px", ["--dy" as string]: "0px" }}
      />

      {/* sharp impact rays */}
      {RAYS.map((deg, i) => (
        <span
          key={`ray-${i}`}
          className="animate-spark absolute left-0 top-0 origin-center"
          style={{
            width: 4,
            height: 34,
            background: theme.sparkRay,
            transform: `translate(-50%, -50%) rotate(${deg}deg)`,
            ["--dx" as string]: "0px",
            ["--dy" as string]: "0px",
          }}
        />
      ))}

      {/* flying debris chips in theme palette */}
      {DEBRIS.map((d, i) => (
        <span
          key={i}
          className="animate-spark absolute left-0 top-0"
          style={{
            width: d.size,
            height: d.size,
            background: theme.sparkDebris[d.idx % theme.sparkDebris.length],
            animationDelay: `${d.delay}ms`,
            ["--dx" as string]: `${d.dx}px`,
            ["--dy" as string]: `${d.dy}px`,
          }}
        />
      ))}
    </div>
  )
}
