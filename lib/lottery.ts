export type LottoRow = {
  id: number
  main: number[]
  bonus: number
}

function pickUnique(count: number, max: number): number[] {
  const set = new Set<number>()
  while (set.size < count) {
    set.add(Math.floor(Math.random() * max) + 1)
  }
  return Array.from(set).sort((a, b) => a - b)
}

export function generateRows(amount = 10): LottoRow[] {
  return Array.from({ length: amount }, (_, i) => ({
    id: i + 1,
    main: pickUnique(6, 45),
    bonus: Math.floor(Math.random() * 20) + 1,
  }))
}
