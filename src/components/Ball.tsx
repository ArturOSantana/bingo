"use client";

import clsx from "clsx";

interface BallProps {
  number: number;
  isDrawn: boolean;
  isLast?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export function Ball({ number, isDrawn, isLast, onClick, size = "md" }: BallProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        "rounded-full flex items-center justify-center font-bold transition-all duration-300 select-none",
        sizeMap[size],
        isLast && isDrawn
          ? "ball-drawn animate-pulse-ring scale-110 ring-2 ring-amber-400"
          : isDrawn
          ? "ball-drawn"
          : "ball-remaining",
        onClick && "cursor-pointer hover:scale-110 hover:opacity-90",
        !onClick && "cursor-default",
        isDrawn && "animate-pop-in"
      )}
      title={`Número ${number}${isDrawn ? " — sorteado" : ""}`}
    >
      {number}
    </button>
  );
}
