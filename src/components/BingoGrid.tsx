"use client";

import clsx from "clsx";
import type { Theme } from "@/hooks/useTheme";

// B: 1-15 | I: 16-30 | N: 31-45 | G: 46-60 | O: 61-75
const COLUMNS = [
  { letter: "B", color: "text-sky-500",    bg: "bg-sky-400",    numbers: Array.from({ length: 15 }, (_, i) => i + 1) },
  { letter: "I", color: "text-violet-500", bg: "bg-violet-400", numbers: Array.from({ length: 15 }, (_, i) => i + 16) },
  { letter: "N", color: "text-amber-500",  bg: "bg-amber-400",  numbers: Array.from({ length: 15 }, (_, i) => i + 31) },
  { letter: "G", color: "text-emerald-500",bg: "bg-emerald-400",numbers: Array.from({ length: 15 }, (_, i) => i + 46) },
  { letter: "O", color: "text-rose-500",   bg: "bg-rose-400",   numbers: Array.from({ length: 15 }, (_, i) => i + 61) },
];

interface BingoGridProps {
  calledNumbers: number[];
  lastCalled: number | null;
  onToggle?: (num: number) => void;
  compact?: boolean;
  theme?: Theme;
}

export function BingoGrid({ calledNumbers, lastCalled, onToggle, compact = false, theme = "dark" }: BingoGridProps) {
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-5 gap-2">
      {COLUMNS.map((col) => (
        <div key={col.letter} className="flex flex-col gap-1.5">
          {/* Header da coluna */}
          <div className={clsx(
            "flex items-center justify-center font-black rounded-xl select-none",
            col.color,
            compact ? "h-8 text-base" : "h-10 text-xl",
            isDark ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"
          )}>
            {col.letter}
          </div>

          {/* Números da coluna */}
          {col.numbers.map((n) => {
            const isCalled = calledNumbers.includes(n);
            const isLast = n === lastCalled;

            return (
              <button
                key={n}
                onClick={() => onToggle?.(n)}
                disabled={!onToggle}
                className={clsx(
                  "flex items-center justify-center font-bold rounded-xl transition-all duration-200 select-none",
                  compact ? "h-8 text-sm" : "h-11 text-base",
                  isLast
                    ? `${col.bg} text-black scale-105 shadow-lg ring-2 ring-white/30`
                    : isCalled
                    ? `${col.bg} text-black opacity-90`
                    : isDark
                    ? "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700",
                  onToggle && "cursor-pointer active:scale-95",
                  !onToggle && "cursor-default"
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
