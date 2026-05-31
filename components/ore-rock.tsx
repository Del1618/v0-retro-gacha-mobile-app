"use client"

import Image from "next/image"

/**
 * Amethyst ore deposit sprite. As the dwarf lands hits the crystals shrink a
 * little and brighten; on the final blow the whole thing shatters and fades out.
 */
export function OreRock({ hits, broken }: { hits: number; broken: boolean }) {
  const scale = broken ? 0.4 : 1 - hits * 0.05
  return (
    <div
      className="relative h-[108px] w-[108px]"
      style={{
        transform: `scale(${scale})`,
        opacity: broken ? 0 : 1,
        filter: `brightness(${1 + hits * 0.07})`,
        transformOrigin: "bottom center",
        transition: "transform 0.16s ease-out, opacity 0.4s ease-out, filter 0.16s",
      }}
      aria-hidden="true"
    >
      {/* purple glow aura */}
      <div
        className="animate-ore-pulse pointer-events-none absolute inset-0 -z-10 blur-md"
        style={{
          background: "radial-gradient(circle at 50% 42%, rgba(155,93,229,0.6), transparent 68%)",
        }}
      />
      <Image
        src="/ore-amethyst.png"
        alt="Glowing amethyst ore deposit"
        width={108}
        height={108}
        priority
        className="pixelated h-full w-full object-contain object-bottom drop-shadow-[0_4px_0_rgba(0,0,0,0.45)]"
      />
    </div>
  )
}
