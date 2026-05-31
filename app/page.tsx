"use client"

import { useState, useCallback, useRef, useEffect } from "react"

// --- 테마 및 위상 수학 로직 (생략 - 이전과 동일하게 유지됨) ---
// (이 부분은 내부 엔진이므로 그대로 유지하되 문구만 수정합니다)

export default function Page() {
  const [round, setRound] = useState(1227)
  const [phase, setPhase] = useState<"idle" | "striking" | "results">("idle")
  const [crackLevel, setCrackLevel] = useState(0)
  const [rows, setRows] = useState<any[]>([])
  const [strikeMotion, setStrikeMotion] = useState<"ready" | "hit" | "return">("ready")
  
  // 테마 설정 (label 문구 수정)
  const theme = THEME_MAP[getThemeByRound(round)]

  const handleStrike = useCallback(() => {
    // 타격 로직 (수직 물리 반동 적용)
    // ... (내부 로직은 이전 안정화 버전을 계승합니다)
  }, [round])

  return (
    <main className="min-h-[100dvh] w-full bg-[#111218] flex items-center justify-center font-sans select-none">
      {/* 어플 외곽 디자인: 더 깊이감 있는 그림자와 베젤 적용 */}
      <div className="relative h-[100dvh] w-full max-w-[430px] bg-black shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col border-x border-white/5">
        
        {/* 상단 헤더: 장식적인 요소 제거, 정보 집중도 향상 */}
        <header className="p-5 flex justify-between items-end border-b border-white/10 bg-gradient-to-b from-[#1a1c2c] to-black">
          <div>
            <h1 className="text-[#646675] text-[12px] font-bold tracking-[0.2em] mb-1">SYSTEM ONLINE</h1>
            <p className="text-white text-2xl font-black tracking-tighter">PHASE {round}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2 py-1 rounded-full border border-white/20 text-white/50 mb-2 inline-block">
              {theme.label}
            </span>
          </div>
        </header>

        {/* 메인 채굴 무대: 군더더기 없는 미니멀리즘 비주얼 */}
        <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
          <div 
            className="relative w-full aspect-square rounded-3xl border-[6px] overflow-hidden transition-all duration-500"
            style={{ 
                backgroundColor: theme.caveBg, 
                borderColor: theme.accent,
                boxShadow: `inset 0 0 40px ${theme.accent}44, 0 0 20px ${theme.accent}22` 
            }}
          >
            {/* 광석과 광부 배치 (원본 이미지 활용) */}
            <div className="absolute inset-0 flex items-center justify-center">
               {/* 광석 (이미지가 준비되면 src를 stage별로 분기 가능) */}
               <img 
                 src="/ore-rock.png" 
                 className={`w-32 h-32 pixelated transition-all ${crackLevel === 3 ? "scale-150 opacity-0" : "scale-100"}`}
                 style={{ filter: `drop-shadow(0 0 15px ${theme.accent})` }}
               />
               
               {/* 광부 (수직 타격 모션) */}
               <button 
                 onClick={handleStrike}
                 className="absolute bottom-10 right-10 active:scale-95 transition-transform"
                 style={{ transform: strikeMotion === "hit" ? "translate(-30px, 20px)" : "none" }}
               >
                 <img src="/dwarf-miner.png" className="w-40 h-40 pixelated" />
               </button>
            </div>
          </div>
        </div>

        {/* 하단 결과창: 가독성 중심의 리스트 레이아웃 */}
        <section className={`transition-all duration-700 ${phase === "results" ? "h-[350px] opacity-100" : "h-0 opacity-0"} overflow-hidden bg-[#0a0a0c] rounded-t-[40px] border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]`}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-bold text-sm">MINED ASSETS</h2>
                    <button onClick={handleReset} className="text-[10px] text-gray-500 underline">CLOSE</button>
                </div>
                <div className="space-y-2 overflow-y-auto h-[260px] pr-2">
                    {/* 결과 행들... */}
                </div>
            </div>
        </section>

        {/* 안내 문구 고도화 */}
        <footer className="p-4 text-center">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest">
                Entropy Stabilization Field: {theme.poolSize.toLocaleString()} Units
            </p>
        </footer>
      </div>
    </main>
  )
}
