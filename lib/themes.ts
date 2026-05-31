export type ThemeKey = "GOLD" | "IRON" | "CRYSTAL" | "LAVA"

export type Theme = {
  key: ThemeKey
  label: string
  // 1) cave background
  caveBg: string
  caveDeep: string
  ground: string
  groundAlt: string
  speck: string
  // 2) ore sprite colors
  oreMain: string
  oreLight: string
  oreDark: string
  oreGlow: string
  rock: string
  rockLight: string
  rockDark: string
  // 3) spark effect colors
  sparkCore: string
  sparkRay: string
  sparkDebris: string[]
  // 4) result card accent
  accent: string
  accentDeep: string
  accentText: string
}

export const THEMES: Record<ThemeKey, Theme> = {
  GOLD: {
    key: "GOLD",
    label: "GOLD VEIN",
    caveBg: "#16241c",
    caveDeep: "#0e1812",
    ground: "#25392c",
    groundAlt: "#1d2e23",
    speck: "#38b764",
    oreMain: "#38b764",
    oreLight: "#a7f070",
    oreDark: "#1f6b3e",
    oreGlow: "rgba(56,183,100,0.5)",
    rock: "#6b5638",
    rockLight: "#8a6f49",
    rockDark: "#4a3a26",
    sparkCore: "#f4f4f4",
    sparkRay: "#ffcd75",
    sparkDebris: ["#a7f070", "#38b764", "#ffcd75", "#6b5638", "#f4f4f4"],
    accent: "#ffcd75",
    accentDeep: "#ef9d2a",
    accentText: "#1a2b1f",
  },
  IRON: {
    key: "IRON",
    label: "IRON VEIN",
    caveBg: "#29241a",
    caveDeep: "#1c180f",
    ground: "#3a3220",
    groundAlt: "#2d2718",
    speck: "#ffcd75",
    oreMain: "#ffcd75",
    oreLight: "#fff3c2",
    oreDark: "#b07d2a",
    oreGlow: "rgba(255,205,117,0.5)",
    rock: "#5c4a30",
    rockLight: "#7a6440",
    rockDark: "#3e3220",
    sparkCore: "#ffffff",
    sparkRay: "#fff3c2",
    sparkDebris: ["#fff3c2", "#ffcd75", "#b07d2a", "#5c4a30", "#f4f4f4"],
    accent: "#ffcd75",
    accentDeep: "#d99a2e",
    accentText: "#2b2410",
  },
  CRYSTAL: {
    key: "CRYSTAL",
    label: "CRYSTAL VEIN",
    caveBg: "#16203a",
    caveDeep: "#0e1626",
    ground: "#243049",
    groundAlt: "#1b2538",
    speck: "#41a6f6",
    oreMain: "#41a6f6",
    oreLight: "#a8e0ff",
    oreDark: "#29366f",
    oreGlow: "rgba(65,166,246,0.5)",
    rock: "#3a4256",
    rockLight: "#4f5970",
    rockDark: "#2a3043",
    sparkCore: "#ffffff",
    sparkRay: "#a8e0ff",
    sparkDebris: ["#a8e0ff", "#41a6f6", "#29366f", "#3a4256", "#f4f4f4"],
    accent: "#41a6f6",
    accentDeep: "#2f7fd0",
    accentText: "#0e1626",
  },
  LAVA: {
    key: "LAVA",
    label: "LAVA VEIN",
    caveBg: "#2a1618",
    caveDeep: "#1c0f10",
    ground: "#3a2024",
    groundAlt: "#2d181b",
    speck: "#ff3355",
    oreMain: "#ff3355",
    oreLight: "#ff8d6b",
    oreDark: "#8a1f2e",
    oreGlow: "rgba(255,51,85,0.5)",
    rock: "#4a2e2a",
    rockLight: "#66423b",
    rockDark: "#331f1d",
    sparkCore: "#ffffff",
    sparkRay: "#ff8d6b",
    sparkDebris: ["#ff8d6b", "#ff3355", "#8a1f2e", "#4a2e2a", "#f4f4f4"],
    accent: "#ff3355",
    accentDeep: "#c8243f",
    accentText: "#fff0f0",
  },
}

const KEYS: ThemeKey[] = ["GOLD", "IRON", "CRYSTAL", "LAVA"]

export function randomTheme(exclude?: ThemeKey): Theme {
  const pool = exclude ? KEYS.filter((k) => k !== exclude) : KEYS
  return THEMES[pool[Math.floor(Math.random() * pool.length)]]
}
