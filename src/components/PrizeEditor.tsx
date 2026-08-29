"use client";

import { useState, useEffect } from "react";
import { useBingoStore } from "@/store/bingo";
import type { Theme } from "@/hooks/useTheme";

interface PrizeEditorProps {
  readOnly?: boolean;
  theme?: Theme;
}

export function PrizeEditor({ readOnly = false, theme = "dark" }: PrizeEditorProps) {
  const { session, setPrize } = useBingoStore();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(session?.prize ?? "");
  const isDark = theme === "dark";

  useEffect(() => {
    setValue(session?.prize ?? "");
  }, [session?.prize]);

  const handleSave = async () => {
    await setPrize(value.trim());
    setEditing(false);
  };

  if (readOnly) {
    return session?.prize ? (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-center">
        <p className="text-xs uppercase tracking-widest text-amber-500/70 mb-1">Prêmio</p>
        <p className="text-lg font-bold text-amber-500">{session.prize}</p>
      </div>
    ) : null;
  }

  return (
    <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}>
      <p className={`text-xs uppercase tracking-widest mb-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>Prêmio da rodada</p>
      {editing ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
            }}
            placeholder="Ex: Cesta básica, R$200..."
            className={`flex-1 rounded-lg px-3 py-2 text-sm outline-none border border-amber-400/40 focus:border-amber-400 transition-colors
              ${isDark ? "bg-white/10 text-white placeholder:text-white/30" : "bg-gray-50 text-gray-900 placeholder:text-gray-300"}`}
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors"
          >
            Salvar
          </button>
          <button
            onClick={() => setEditing(false)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors
              ${isDark ? "bg-white/10 hover:bg-white/15 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-left group"
        >
          {session?.prize ? (
            <span className="text-amber-500 font-medium text-sm group-hover:text-amber-400 transition-colors">
              {session.prize}
              <span className={`ml-2 text-xs font-normal ${isDark ? "text-white/30" : "text-gray-400"}`}>(editar)</span>
            </span>
          ) : (
            <span className={`text-sm italic transition-colors ${isDark ? "text-white/30 group-hover:text-white/50" : "text-gray-400 group-hover:text-gray-600"}`}>
              + Clique para definir o prêmio
            </span>
          )}
        </button>
      )}
    </div>
  );
}
