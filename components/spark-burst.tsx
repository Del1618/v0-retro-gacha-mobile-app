"use client"

const COLORS = ["#ffcd75", "#ef7d57", "#f4f4f4", "#41a6f6", "#38b764"]

// Pre-computed particle vectors radiating outward.
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2 + (i % 2 ? 0.2 : -0.2)
  const dist = 48 + (i % 3) * 22
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    size: i % 2 === 0 ? 8 : 6,
    color: COLORS[i % COLORS.length],
    delay: (i % 4) * 20,
  }
})

export function SparkBurst() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    >
      {/* central flash */}
      <span className="animate-spark absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-retro-cream" style={{ width: 26, height: 26, ["--dx" as string]: "0px", ["--dy" as string]: "0px" }} />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="animate-spark absolute left-0 top-0"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
          }}
        />
      ))}
    </div>
  )
}
