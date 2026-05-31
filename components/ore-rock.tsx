"use client"

const GREEN = "#38b764"
const GREEN_LIGHT = "#a7f070"
const GREEN_DARK = "#1f6b3e"

// Scatter vectors for the shatter fragments.
const FRAGMENTS = [
  { dx: -32, dy: -26, rot: "-120deg", size: 10 },
  { dx: 30, dy: -30, rot: "140deg", size: 12 },
  { dx: -22, dy: -10, rot: "80deg", size: 8 },
  { dx: 24, dy: -8, rot: "-60deg", size: 9 },
  { dx: 0, dy: -34, rot: "200deg", size: 11 },
]

function Crystal({
  className,
  size,
}: {
  className: string
  size: number
}) {
  return (
    <span
      className={`absolute rotate-45 border-2 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: GREEN,
        borderColor: GREEN_DARK,
        boxShadow: `inset 2px 2px 0 ${GREEN_LIGHT}`,
      }}
      aria-hidden="true"
    />
  )
}

export function OreRock({
  hits,
  broken,
}: {
  hits: number
  broken: boolean
}) {
  return (
    <div className="relative h-[56px] w-[74px] [image-rendering:pixelated]" aria-hidden="true">
      {/* glow halo */}
      {!broken && (
        <div
          className="animate-ore-pulse pointer-events-none absolute inset-x-2 bottom-1 top-2 rounded-full"
          style={{ boxShadow: `0 0 18px 6px ${GREEN}` }}
        />
      )}

      {/* rock base */}
      <div className="absolute bottom-0 left-1/2 h-4 w-[74px] -translate-x-1/2 rounded-[2px] border-2 border-black/60 bg-[#2a2433]" />
      <div className="absolute bottom-[2px] left-1/2 h-1.5 w-[60px] -translate-x-1/2 rounded-[1px] bg-[#3a3247]" />

      {broken ? (
        <>
          {/* leftover stub */}
          <Crystal className="bottom-3 left-1/2 -translate-x-1/2 opacity-60" size={10} />
          {/* flying fragments */}
          {FRAGMENTS.map((f, i) => (
            <span
              key={i}
              className="animate-shatter absolute bottom-4 left-1/2 rotate-45 border-2"
              style={{
                width: f.size,
                height: f.size,
                marginLeft: -f.size / 2,
                backgroundColor: GREEN,
                borderColor: GREEN_DARK,
                boxShadow: `inset 2px 2px 0 ${GREEN_LIGHT}`,
                ["--dx" as string]: `${f.dx}px`,
                ["--dy" as string]: `${f.dy}px`,
                ["--rot" as string]: f.rot,
                animationDelay: `${i * 25}ms`,
              }}
            />
          ))}
        </>
      ) : (
        <>
          {/* crystal cluster */}
          <Crystal className="bottom-1.5 left-2" size={16} />
          <Crystal className="bottom-1.5 right-2" size={16} />
          <Crystal className="bottom-2.5 left-1/2 -translate-x-1/2" size={26} />
          {/* top spike */}
          <Crystal className="bottom-7 left-1/2 -translate-x-1/2" size={12} />

          {/* progressive cracks */}
          {hits >= 1 && (
            <span className="absolute bottom-3 left-1/2 h-7 w-[2px] -translate-x-1/2 rotate-[18deg] bg-black/70" />
          )}
          {hits >= 2 && (
            <>
              <span className="absolute bottom-4 left-1/2 h-5 w-[2px] -translate-x-1/2 -rotate-[28deg] bg-black/70" />
              <span className="absolute bottom-2 left-[58%] h-3 w-[2px] rotate-[60deg] bg-black/60" />
            </>
          )}
        </>
      )}
    </div>
  )
}
