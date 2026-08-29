"use client";

import { useBingoStore } from "@/store/bingo";
import type { Theme } from "@/hooks/useTheme";
import type { CardColor, RoundType } from "@/lib/types";

const CARD_COLORS: { value: CardColor; label: string; swatch: string }[] = [
  { value: "yellow",  label: "Amarela", swatch: "bg-yellow-400" },
  { value: "blue",    label: "Azul",    swatch: "bg-blue-400" },
  { value: "green",   label: "Verde",   swatch: "bg-green-400" },
  { value: "red",     label: "Vermelha",swatch: "bg-red-400" },
  { value: "pink",    label: "Rosa",    swatch: "bg-pink-400" },
  { value: "purple",  label: "Roxa",    swatch: "bg-purple-400" },
  { value: "orange",  label: "Laranja", swatch: "bg-orange-400" },
  { value: "white",   label: "Branca",  swatch: "bg-gray-100 border border-gray-300" },
];

const ROUND_TYPES: { value: RoundType; label: string }[] = [
  { value: "principal", label: "Principal" },
  { value: "extra",     label: "Extra" },
];

interface RoundConfigProps {
  theme?: Theme;
  readOnly?: boolean;
}

export function RoundConfig({ theme = "dark", readOnly = false }: RoundConfigProps) {
  const { session, setCardColor, setRoundType } = useBingoStore();
  const isDark = theme === "dark";

  if (!session) return null;

  const currentColor = session.card_color ?? "yellow";
  const currentType  = session.round_type  ?? "principal";

  const colorEntry = CARD_COLORS.find((c) => c.value === currentColor);

  if (readOnly) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* Badge tipo de rodada */}
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
          currentType === "extra"
            ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
            : "border-amber-500/40 bg-amber-500/10 text-amber-500"
        }`}>
          {currentType === "extra" ? "Rodada Extra" : "Rodada Principal"}
        </span>

        {/* Bolinha cor da cartela */}
        {colorEntry && (
          <span className="flex items-center gap-1.5 text-xs">
            <span className={`inline-block w-3 h-3 rounded-full ${colorEntry.swatch}`} />
            <span className={isDark ? "text-white/50" : "text-gray-500"}>
              Cartela {colorEntry.label}
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}>
      <p className={`text-xs uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-400"}`}>Configurar rodada</p>

      {/* Tipo de rodada */}
      <div className="flex gap-2">
        {ROUND_TYPES.map((rt) => (
          <button
            key={rt.value}
            onClick={() => setRoundType(rt.value)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              currentType === rt.value
                ? rt.value === "extra"
                  ? "bg-purple-500 border-purple-500 text-white"
                  : "bg-amber-500 border-amber-500 text-black"
                : isDark
                ? "border-white/10 text-white/40 hover:text-white/70"
                : "border-gray-200 text-gray-400 hover:text-gray-700"
            }`}
          >
            {rt.label}
          </button>
        ))}
      </div>

      {/* Cor da cartela */}
      <div className="flex flex-wrap gap-1.5">
        {CARD_COLORS.map((c) => (
          <button
            key={c.value}
            title={c.label}
            onClick={() => setCardColor(c.value)}
            className={`w-7 h-7 rounded-full transition-transform ${c.swatch} ${
              currentColor === c.value
                ? "scale-125 ring-2 ring-offset-1 ring-white/60"
                : "opacity-60 hover:opacity-100 hover:scale-110"
            } ${isDark ? "ring-offset-[#0f0f13]" : "ring-offset-white"}`}
          />
        ))}
      </div>
    </div>
  );
}
