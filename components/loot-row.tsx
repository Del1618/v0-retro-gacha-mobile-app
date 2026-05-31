"use client"

// --- 4대 광산 국면별 색상 프로필 통합 연동 엔진 ---
interface FixedThemeProfile {
  accent: string      // 주연 네온 컬러
  accentDeep: string  // 보너스 공 배경색
  accentText: string  // 보너스 공 글자색
  caveDeep: string    // 메인 공 배경 및 행 레이아웃 베이스 배경
  oreGlow: string     // 보너스 공 네온 글로우 파티클 색상
}

const THEME_PROFILE_MAP: Record<string, FixedThemeProfile> = {
  GOLD_VEIN: {
    accent: "#2ecc71",       // 청정 녹색
    accentDeep: "#0f3d21",
    accentText: "#2ecc71",
    caveDeep: "#090f0b",
    oreGlow: "rgba(46, 204, 113, 0.6)",
  },
  IRON_MINE: {
    accent: "#f1c40f",       // 평온한 황색
    accentDeep: "#4d3e05",
    accentText: "#f1c40f",
    caveDeep: "#14130d",
    oreGlow: "rgba(241, 196, 15, 0.5)",
  },
  CRYSTAL_CAVE: {
    accent: "#3498db",       // 디펜스 청색
    accentDeep: "#0f2d42",
    accentText: "#3498db",
    caveDeep: "#091014",
    oreGlow: "rgba(52, 152, 219, 0.6)",
  },
  LAVA_ERUPTION: {
    accent: "#e74c3c",       // 위기방어 적색
    accentDeep: "#42120f",
    accentText: "#e74c3c",
    caveDeep: "#140909",
    oreGlow: "rgba(231, 76, 60, 0.7)",
  },
}

// --- 오락실 스타일 픽셀 구체 볼 컴포넌트 ---
function PixelBall({
  value,
  variant,
  themeKey,
}: {
  value: number
  variant: "main" | "bonus"
  themeKey: string
}) {
  const theme = THEME_PROFILE_MAP[themeKey] || THEME_PROFILE_MAP["IRON_MINE"]
  const pad = String(value).padStart(2, "0")
  
  // 국면별 변수 매핑 테이블 작동
  const style =
    variant === "bonus"
      ? {
          borderColor: theme.accent,
          background: theme.accentDeep,
          color: theme.accentText,
          boxShadow: `0 0 12px ${theme.oreGlow}`,
        }
      : { 
          borderColor: theme.accent, 
          background: theme.caveDeep, 
          color: "#f4f4f4" 
        }

  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-mono font-bold shadow-md transition-all duration-300"
      style={style}
    >
      {pad}
    </span>
  )
}

// --- 중복 배제 실시간 드랍 결과 행 레이아웃 ---
export function LootRow({ 
  row, 
  index, 
  themeKey 
}: { 
  row: { id: string; numbers: number[]; bonus: number }; 
  index: number; 
  themeKey: string 
}) {
  const theme = THEME_PROFILE_MAP[themeKey] || THEME_PROFILE_MAP["IRON_MINE"]

  return (
    <li
      className="flex items-center gap-2 rounded border-2 px-2.5 py-1.5 transition-all duration-500 animate-fade-in"
      style={{
        animationDelay: `${index * 60}ms`, // 위에서 아래로 순차적으로 폭포처럼 떨어지는 손맛 타이밍
        borderColor: theme.accent,
        background: `${theme.caveDeep}ee`,
      }}
    >
      {/* 행 번호 인덱스 라벨 (#01 ~ #10) */}
      <span
        className="w-4 shrink-0 text-center font-mono font-bold text-[9px]"
        style={{ color: theme.accent }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* 6대 메인 원소 조합 정렬 팩 */}
      <div className="flex flex-1 items-center justify-between gap-1.5 font-mono">
        <div className="flex items-center gap-1.5">
          {row.numbers.map((n, i) => (
            <PixelBall key={i} value={n} variant="main" themeKey={themeKey} />
          ))}
        </div>

        {/* 2등 사수용 위성 보너스 구역 */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <span className="font-mono text-[10px] font-bold mr-0.5" style={{ color: theme.accent }}>
            +
          </span>
          <PixelBall value={row.bonus} variant="bonus" themeKey={themeKey} />
        </div>
      </div>
    </li>
  )
}