import { PhoneBackground } from "@/components/phone-background"
import { GachaGame } from "@/components/gacha-game"

export default function Page() {
  return (
    <main className="min-h-[100dvh] w-full bg-stage flex items-center justify-center overflow-hidden">
      {/* The phone-sized stage */}
      <div className="relative h-[100dvh] w-full max-w-[440px] overflow-hidden bg-cave-deep">
        {/* Dimmed, blurred "home screen" content behind the modal */}
        <div
          className="absolute inset-0 scale-105 blur-sm brightness-[0.45] pointer-events-none select-none"
          aria-hidden="true"
        >
          <PhoneBackground />
        </div>

        {/* Dim overlay */}
        <div className="absolute inset-0 bg-cave-deep/60 pointer-events-none" aria-hidden="true" />

        {/* Centered gacha modal */}
        <GachaGame />
      </div>
    </main>
  )
}
