"use client"

// Mining impact: a bright white flash, a few sharp impact rays, and chunky
// debris in amethyst + rock colours that fly out and drop.
const DEBRIS_COLORS = ["#d9b8ff", "#9b5de5", "#5a2a9e", "#b08e5e", "#f4f4f4"]

const DEBRIS = Array.from({ length: 10 }, (_, i) => {
  // bias the spread upward & outward so it reads like chips knocked off the rock
  const angle = -Math.PI / 2 + ((i / 9) - 0.5) * Math.PI * 1.5
  const dist = 34 + (i % 3) * 16
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist + 10, // gravity pulls them down a touch
    size: i % 2 === 0 ? 7 : 5,
    color: DEBRIS_COLORS[i % DEBRIS_COLORS.length],
    delay: (i % 3) * 18,
  }
})

// 4 sharp impact rays forming a cross/star.
const RAYS = [0, 90, 45, 135]

export function SparkBurst({ top = "50%", left = "50%" }: { top?: string; left?: string }) {
  return (
    <div
      className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
      style={{ top, left }}
      aria-hidden="true"
    >
      {/* central white flash */}
      <span
        className="animate-spark absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-retro-cream"
        style={{ width: 22, height: 22, ["--dx" as string]: "0px", ["--dy" as string]: "0px" }}
      />

      {/* sharp impact rays */}
      {RAYS.map((deg, i) => (
        <span
          key={`ray-${i}`}
          className="animate-spark absolute left-0 top-0 origin-center bg-retro-gold"
          style={{
            width: 4,
            height: 30,
            transform: `translate(-50%, -50%) rotate(${deg}deg)`,
            ["--dx" as string]: "0px",
            ["--dy" as string]: "0px",
          }}
        />
      ))}

      {/* flying debris chips */}
      {DEBRIS.map((d, i) => (
        <span
          key={i}
          className="animate-spark absolute left-0 top-0"
          style={{
            width: d.size,
            height: d.size,
            backgroundColor: d.color,
            animationDelay: `${d.delay}ms`,
            ["--dx" as string]: `${d.dx}px`,
            ["--dy" as string]: `${d.dy}px`,
          }}
        />
      ))}
    </div>
  )
}
