export function PhoneBackground() {
  return (
    <div className="flex h-full w-full flex-col bg-cave px-5 pt-12 font-pixel text-retro-cream">
      {/* status bar */}
      <div className="flex items-center justify-between text-[8px] text-retro-cyan">
        <span>9:41</span>
        <span>MINER OS</span>
        <span>100%</span>
      </div>

      {/* header */}
      <div className="mt-8 space-y-2">
        <h2 className="text-sm leading-relaxed text-retro-gold">ORE STRIKE</h2>
        <p className="text-[8px] leading-relaxed text-retro-cyan">DAILY LUCKY DRAW</p>
      </div>

      {/* grid of fake tiles */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm border-2 border-retro-blue bg-cave-deep"
          />
        ))}
      </div>

      <div className="mt-auto mb-8 h-14 rounded-sm border-2 border-retro-blue bg-cave-deep" />
    </div>
  )
}
