"use client";

import clsx from "clsx";

interface NumberGridProps {
  drawnNumbers: number[];
  lastDrawn: number | null;
  onToggle?: (num: number) => void;
  total?: number;
}

export function NumberGrid({
  drawnNumbers,
  lastDrawn,
  onToggle,
  total = 75,
}: NumberGridProps) {
  const numbers = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
      {numbers.map((n) => {
        const isDrawn = drawnNumbers.includes(n);
        const isLast = n === lastDrawn;
        return (
          <button
            key={n}
            onClick={() => onToggle?.(n)}
            disabled={!onToggle}
            className={clsx(
              "rounded-lg flex items-center justify-center font-bold transition-all duration-300 select-none aspect-square text-sm",
              isLast && isDrawn
                ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black ring-2 ring-amber-300 ring-offset-1 ring-offset-transparent scale-110 shadow-lg shadow-amber-500/30"
                : isDrawn
                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md shadow-amber-600/20"
                : "bg-white/5 text-white/30 hover:bg-white/10",
              onToggle && "cursor-pointer",
              !onToggle && "cursor-default"
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
