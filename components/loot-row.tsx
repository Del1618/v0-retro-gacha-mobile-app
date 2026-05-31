import type { LottoRow } from "@/lib/lottery"

function PixelBall({ value, variant }: { value: number; variant: "main" | "bonus" }) {
  const pad = String(value).padStart(2, "0")
  return (
    <span
      className={
        variant === "bonus"
          ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-retro-gold bg-retro-gold-deep text-[9px] text-cave-deep shadow-[0_0_10px_rgba(255,205,117,0.65)]"
          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-retro-cyan bg-cave-deep text-[9px] text-retro-cream"
      }
    >
      {pad}
    </span>
  )
}

export function LootRow({ row, index }: { row: LottoRow; index: number }) {
  return (
    <li
      className="animate-loot-drop flex items-center gap-2 rounded-sm border-2 border-retro-blue bg-cave-deep/80 px-2 py-2"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="w-5 shrink-0 text-center font-pixel text-[8px] text-retro-cyan">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex flex-1 items-center justify-between gap-1.5 font-pixel">
        <div className="flex items-center gap-1.5">
          {row.main.map((n) => (
            <PixelBall key={n} value={n} variant="main" />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="font-pixel text-[10px] text-retro-gold">+</span>
          <PixelBall value={row.bonus} variant="bonus" />
        </div>
      </div>
    </li>
  )
}
