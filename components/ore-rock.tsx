"use client"

const GEM = "#38b764"
const GEM_LIGHT = "#a7f070"
const GEM_DARK = "#1f6b3e"

// Elongated crystal gem shape (pointed top, faceted body).
const GEM_CLIP = "polygon(50% 0, 78% 22%, 100% 62%, 70% 100%, 30% 100%, 0 62%, 22% 22%)"

// Scatter vectors for the shatter fragments.
const FRAGMENTS = [
  { dx: -40, dy: -34, rot: "-130deg", size: 14 },
  { dx: 42, dy: -38, rot: "150deg", size: 16 },
  { dx: -28, dy: -14, rot: "90deg", size: 11 },
  { dx: 32, dy: -10, rot: "-70deg", size: 12 },
  { dx: 2, dy: -44, rot: "210deg", size: 15 },
  { dx: -14, dy: -24, rot: "40deg", size: 9 },
]

function Gem({
  className,
  w,
  h,
  rotate = 0,
}: {
  className: string
  w: number
  h: number
  rotate?: number
}) {
  return (
    <span
      className={`absolute ${className}`}
      style={{
        width: w,
        height: h,
        transform: `rotate(${rotate}deg)`,
        clipPath: GEM_CLIP,
        background: `linear-gradient(135deg, ${GEM_LIGHT} 0%, ${GEM} 42%, ${GEM_DARK} 100%)`,
        filter: `drop-shadow(0 0 5px ${GEM})`,
      }}
      aria-hidden="true"
    >
      {/* facet highlight */}
      <span
        className="absolute left-[14%] top-[10%] h-[34%] w-[26%]"
        style={{ background: GEM_LIGHT, clipPath: GEM_CLIP, opacity: 0.85 }}
      />
    </span>
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
    <div className="relative h-[92px] w-[124px] [image-rendering:pixelated]" aria-hidden="true">
      {/* glow halo */}
      {!broken && (
        <div
          className="animate-ore-pulse pointer-events-none absolute inset-x-3 bottom-2 top-3 rounded-full"
          style={{ boxShadow: `0 0 26px 10px ${GEM}` }}
        />
      )}

      {/* ---- Rocky boulder base (stacked irregular blocks) ---- */}
      {/* shadow on ground */}
      <div className="absolute bottom-1 left-1/2 h-3 w-[112px] -translate-x-1/2 rounded-full bg-black/40 blur-[1px]" />
      {/* main mound */}
      <div className="absolute bottom-[10px] left-1/2 h-9 w-[110px] -translate-x-1/2 rounded-t-[10px] rounded-b-[4px] border-2 border-black/60 bg-[#54506a]" />
      {/* left hump */}
      <div className="absolute bottom-[24px] left-[14px] h-7 w-12 rounded-[8px] border-2 border-black/60 bg-[#5e5a76]" />
      {/* right hump */}
      <div className="absolute bottom-[22px] right-[12px] h-6 w-11 rounded-[8px] border-2 border-black/60 bg-[#494560]" />
      {/* highlight + shading speckles */}
      <div className="absolute bottom-[30px] left-[26px] h-2 w-7 rounded-full bg-[#7a7592]" />
      <div className="absolute bottom-[16px] left-[44px] h-1.5 w-6 rounded-full bg-[#34303f]" />
      <div className="absolute bottom-[18px] right-[26px] h-1.5 w-5 rounded-full bg-[#34303f]" />

      {broken ? (
        <>
          {/* leftover embedded stub */}
          <Gem className="bottom-[26px] left-1/2 -translate-x-1/2 opacity-70" w={16} h={20} />
          {/* flying fragments */}
          {FRAGMENTS.map((f, i) => (
            <span
              key={i}
              className="animate-shatter absolute bottom-[34px] left-1/2"
              style={{
                width: f.size,
                height: f.size * 1.3,
                marginLeft: -f.size / 2,
                clipPath: GEM_CLIP,
                background: `linear-gradient(135deg, ${GEM_LIGHT} 0%, ${GEM} 45%, ${GEM_DARK} 100%)`,
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
          {/* ---- Embedded emerald crystal cluster ---- */}
          {/* big central spire */}
          <Gem className="bottom-[26px] left-1/2 -translate-x-1/2" w={30} h={48} rotate={-4} />
          {/* left crystal leaning out */}
          <Gem className="bottom-[24px] left-[22px]" w={20} h={34} rotate={-26} />
          {/* right crystal leaning out */}
          <Gem className="bottom-[24px] right-[20px]" w={22} h={36} rotate={24} />
          {/* small front shard */}
          <Gem className="bottom-[22px] left-[46px]" w={14} h={22} rotate={8} />
          {/* tiny accent */}
          <Gem className="bottom-[40px] right-[34px]" w={11} h={18} rotate={48} />

          {/* progressive cracks */}
          {hits >= 1 && (
            <span className="absolute bottom-[34px] left-1/2 h-9 w-[2px] -translate-x-1/2 rotate-[16deg] bg-black/75" />
          )}
          {hits >= 2 && (
            <>
              <span className="absolute bottom-[40px] left-1/2 h-7 w-[2px] -translate-x-1/2 -rotate-[30deg] bg-black/75" />
              <span className="absolute bottom-[30px] left-[56%] h-5 w-[2px] rotate-[64deg] bg-black/65" />
            </>
          )}
        </>
      )}
    </div>
  )
}
