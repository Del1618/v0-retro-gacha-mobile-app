import type { LottoRow } from "@/lib/lottery"
import type { Theme } from "@/lib/themes"

function PixelBall({
  value,
  variant,
  theme,
}: {
  value: number
  variant: "main" | "bonus"
  theme: Theme
}) {
  const pad = String(value).padStart(2, "0")
  const style =
    variant === "bonus"
      ? {
          borderColor: theme.accent,
          background: theme.accentDeep,
          color: theme.accentText,
          boxShadow: `0 0 10px ${theme.oreGlow}`,
        }
      : { borderColor: theme.accent, background: theme.caveDeep, color: "#f4f4f4" }

  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[9px] [image-rendering:pixelated]"
      style={style}
    >
      {pad}
    </span>
  )
}

export function LootRow({ row, index, theme }: { row: LottoRow; index: number; theme: Theme }) {
  return (
    <li
      className="animate-loot-drop flex items-center gap-2 rounded-sm border-2 px-2 py-2"
      style={{
        animationDelay: `${index * 70}ms`,
        borderColor: theme.accent,
        background: `${theme.caveDeep}cc`,
      }}
    >
      <span
        className="w-5 shrink-0 text-center font-pixel text-[8px]"
        style={{ color: theme.accent }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex flex-1 items-center justify-between gap-1.5 font-pixel">
        <div className="flex items-center gap-1.5">
          {row.main.map((n) => (
            <PixelBall key={n} value={n} variant="main" theme={theme} />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="font-pixel text-[10px]" style={{ color: theme.accent }}>
            +
          </span>
          <PixelBall value={row.bonus} variant="bonus" theme={theme} />
        </div>
      </div>
    </li>
  )
}
