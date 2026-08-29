"use client";

interface LastDrawnProps {
  number: number | null;
  isAnimating: boolean;
  totalDrawn: number;
  totalRemaining: number;
}

export function LastDrawnDisplay({ number, isAnimating, totalDrawn, totalRemaining }: LastDrawnProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">Último sorteado</p>
      <div
        key={number}
        className={`
          relative w-32 h-32 rounded-full flex items-center justify-center
          bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600
          shadow-2xl shadow-amber-500/40
          ${number ? "animate-pop-in" : ""}
          ${isAnimating ? "animate-pulse-ring" : ""}
        `}
      >
        <span className="text-5xl font-black text-black tracking-tight">
          {number ?? "–"}
        </span>
      </div>
      <div className="flex gap-6 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{totalDrawn}</div>
          <div className="text-xs text-white/40 mt-0.5">sorteados</div>
        </div>
        <div className="w-px bg-white/10" />
        <div className="text-center">
          <div className="text-2xl font-bold text-white/60">{totalRemaining}</div>
          <div className="text-xs text-white/40 mt-0.5">restantes</div>
        </div>
      </div>
    </div>
  );
}
