"use client";

import { useEffect } from "react";
import { useBingoStore } from "@/store/bingo";
import { BingoGrid } from "@/components/BingoGrid";
import { PrizeEditor } from "@/components/PrizeEditor";
import { RoundConfig } from "@/components/RoundConfig";
import { useTheme } from "@/hooks/useTheme";

function getBingoLetter(n: number) {
  if (n <= 15) return { letter: "B", gradient: "from-sky-400 to-sky-600" };
  if (n <= 30) return { letter: "I", gradient: "from-violet-400 to-violet-600" };
  if (n <= 45) return { letter: "N", gradient: "from-amber-400 to-amber-600" };
  if (n <= 60) return { letter: "G", gradient: "from-emerald-400 to-emerald-600" };
  return { letter: "O", gradient: "from-rose-400 to-rose-600" };
}

export default function ViewPage() {
  const { session, isLoading, lastCalledAnimation, fetchSession, subscribeToUpdates } =
    useBingoStore();

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchSession();
    const unsub = subscribeToUpdates();
    return unsub;
  }, []);

  if (isLoading || !session) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0f0f13]" : "bg-gray-50"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>Conectando...</p>
        </div>
      </div>
    );
  }

  const isPaused = session.game_status === "paused";
  const isFinished = session.game_status === "finished";
  const lastNum = session.last_drawn;
  const lastLetter = lastNum ? getBingoLetter(lastNum) : null;
  const recentHistory = [...session.drawn_numbers].reverse().slice(0, 10);

  const bg = isDark ? "bg-[#0f0f13]" : "bg-gray-50";
  const text = isDark ? "text-white" : "text-gray-900";
  const card = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-200";
  const muted = isDark ? "text-white/35" : "text-gray-400";

  return (
    <div className={`min-h-screen ${bg} ${text} flex flex-col`}>

      {/* Flash de novo número */}
      {lastCalledAnimation && lastNum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative animate-pop-in flex flex-col items-center gap-4">
            <div className={`w-44 h-44 rounded-full bg-gradient-to-br ${lastLetter?.gradient} flex flex-col items-center justify-center`}>
              <span className="text-lg font-black text-black/50 leading-none -mb-1">
                {lastLetter?.letter}
              </span>
              <span className="text-8xl font-black text-black leading-none">
                {lastNum}
              </span>
            </div>
            <span className="text-white font-bold text-lg tracking-widest uppercase bg-black/50 px-5 py-1.5 rounded-full">
              {lastLetter?.letter} — {lastNum}
            </span>
          </div>
        </div>
      )}

      {/* Faixa de status */}
      {(isPaused || isFinished) && (
        <div className={`w-full text-center py-1.5 text-xs tracking-widest uppercase ${
          isPaused ? "bg-amber-500/15 text-amber-600" : "bg-gray-500/15 text-gray-500"
        }`}>
          {isPaused ? "Jogo pausado" : "Jogo finalizado"}
        </div>
      )}

      {/* Header */}
      <header className={`border-b ${isDark ? "border-white/[0.07]" : "border-gray-200"} px-4 h-11 flex items-center justify-between`}>
        <span className="font-semibold text-sm">Bingo</span>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${muted}`}>
            {session.drawn_numbers.length} de 75
          </span>
          <button
            onClick={toggleTheme}
            className={`text-xs px-2.5 py-1 rounded border transition-colors ${
              isDark
                ? "border-white/[0.08] text-white/40 hover:text-white/70"
                : "border-gray-200 text-gray-400 hover:text-gray-700"
            }`}
          >
            {isDark ? "Claro" : "Escuro"}
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 max-w-md mx-auto w-full">

        {/* Tipo de rodada e cor da cartela */}
        <RoundConfig readOnly theme={theme} />

        {/* Prêmio */}
        <PrizeEditor readOnly theme={theme} />

        {/* Último número */}
        <div className={`border ${card} rounded-lg p-5 flex flex-col items-center gap-4`}>
          <span className={`text-[11px] ${muted}`}>Último chamado</span>

          {lastNum ? (
            <div
              key={lastNum}
              className={`w-28 h-28 rounded-full bg-gradient-to-br ${lastLetter?.gradient} flex flex-col items-center justify-center`}
            >
              <span className="text-sm font-black text-black/50 leading-none -mb-1">
                {lastLetter?.letter}
              </span>
              <span className="text-6xl font-black text-black leading-none">
                {lastNum}
              </span>
            </div>
          ) : (
            <div className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <span className={muted}>—</span>
            </div>
          )}

          <div className="w-full">
            <div className={`flex justify-between text-xs ${muted} mb-1.5`}>
              <span>{session.drawn_numbers.length} de 75</span>
              <span>{Math.round((session.drawn_numbers.length / 75) * 100)}%</span>
            </div>
            <div className={`h-1 ${isDark ? "bg-white/[0.08]" : "bg-gray-100"} rounded-full overflow-hidden`}>
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${(session.drawn_numbers.length / 75) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Histórico recente */}
        {recentHistory.length > 1 && (
          <div className={`border ${card} rounded-lg p-3`}>
            <p className={`text-[11px] ${muted} mb-2.5`}>Últimos chamados</p>
            <div className="flex gap-1.5 flex-wrap">
              {recentHistory.map((n, i) => {
                const ltr = getBingoLetter(n);
                return (
                  <span
                    key={n}
                    className={`
                      w-10 h-10 rounded-full flex flex-col items-center justify-center
                      ${i === 0 ? "opacity-100" : "opacity-40"}
                      bg-gradient-to-br ${ltr.gradient}
                    `}
                  >
                    <span className="text-[7px] font-bold text-black/50 leading-none">{ltr.letter}</span>
                    <span className="text-sm font-black text-black leading-none">{n}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Grade */}
        <div className={`border ${card} rounded-lg p-4`}>
          <p className={`text-[11px] ${muted} mb-3`}>Números chamados</p>
          <BingoGrid
            calledNumbers={session.drawn_numbers}
            lastCalled={session.last_drawn}
            compact
            theme={theme}
          />
        </div>

        {/* Fim de jogo */}
        {isFinished && (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 p-5 text-center">
            <h2 className="font-bold text-lg text-amber-500 mb-1">Fim do jogo!</h2>
            <p className={`text-sm ${muted}`}>Todos os 75 números foram chamados.</p>
            {session.prize && (
              <p className="mt-2 text-amber-500 font-medium text-sm">Prêmio: {session.prize}</p>
            )}
          </div>
        )}

        {/* Poucos restantes */}
        {!isFinished && session.remaining_numbers.length <= 10 && session.remaining_numbers.length > 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
            <p className={`text-amber-500 font-medium text-sm mb-2`}>
              Faltam {session.remaining_numbers.length} número{session.remaining_numbers.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {session.remaining_numbers.map((n) => {
                const ltr = getBingoLetter(n);
                return (
                  <span
                    key={n}
                    className={`w-8 h-8 rounded-md bg-gradient-to-br ${ltr.gradient} flex items-center justify-center text-xs font-bold text-black`}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
