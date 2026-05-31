type PickaxeProps = {
  swinging: boolean
}

/**
 * Standalone pixel-art pickaxe. Drawn upright (handle pointing down = the grip,
 * iron head at the top). It pivots at the bottom-center (the dwarf's hands) and
 * the `pick-swing` keyframe rotates it clockwise so the head arcs down and
 * smashes into the ore — a real chopping motion layered over the dwarf bob.
 */
export function Pickaxe({ swinging }: PickaxeProps) {
  return (
    <div
      className={`pointer-events-none relative h-[96px] w-[64px] ${swinging ? "animate-pick" : ""}`}
      aria-hidden="true"
    >
      {/* ---- Wooden handle (vertical grip) ---- */}
      <div className="absolute bottom-0 left-1/2 h-[78px] w-[9px] -translate-x-1/2 rounded-[2px] border-2 border-black/70 bg-[#a9743f]" />
      {/* handle grain highlight */}
      <div className="absolute bottom-[6px] left-[29px] h-[62px] w-[3px] rounded-full bg-[#c99a63]" />

      {/* ---- Iron pick head at the top (curved double pick) ---- */}
      {/* center socket where head meets handle */}
      <div className="absolute left-1/2 top-[8px] h-[16px] w-[16px] -translate-x-1/2 rounded-[2px] border-2 border-black/70 bg-[#6f7686]" />
      {/* left spike */}
      <div
        className="absolute left-[2px] top-[6px] h-[12px] w-[28px] border-2 border-black/70 bg-[#5b6271]"
        style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
      />
      {/* right spike */}
      <div
        className="absolute right-[2px] top-[6px] h-[12px] w-[28px] border-2 border-black/70 bg-[#8b93a3]"
        style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
      />
      {/* metallic glint */}
      <div className="absolute right-[8px] top-[9px] h-[2px] w-[7px] bg-[#d6dbe6]" />
    </div>
  )
}
