"use client";

import { useEffect, useState } from "react";
import { useBingoStore } from "@/store/bingo";
import { BingoGrid } from "@/components/BingoGrid";
import { PrizeEditor } from "@/components/PrizeEditor";
import { QRShare } from "@/components/QRShare";
import { RoundConfig } from "@/components/RoundConfig";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";

function getBingoLetter(n: number) {
  if (n <= 15) return { letter: "B", color: "text-sky-400" };
  if (n <= 30) return { letter: "I", color: "text-violet-400" };
  if (n <= 45) return { letter: "N", color: "text-amber-400" };
  if (n <= 60) return { letter: "G", color: "text-emerald-400" };
  return { letter: "O", color: "text-rose-400" };
}

export default function AdminPage() {
  const {
    session,
    isLoading,
    lastCalledAnimation,
    fetchSession,
    callNumber,
    setStatus,
    resetGame,
    subscribeToUpdates,
  } = useBingoStore();

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
          <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>Carregando...</p>
        </div>
      </div>
    );
  }

  const isFinished = session.game_status === "finished";
  const isPaused = session.game_status === "paused";
  const isPlaying = session.game_status === "playing";

  const history = [...session.drawn_numbers].reverse();
  const lastNum = session.last_drawn;
  const lastLetter = lastNum ? getBingoLetter(lastNum) : null;

  const bg = isDark ? "bg-[#0f0f13]" : "bg-gray-50";
  const text = isDark ? "text-white" : "text-gray-900";
  const card = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-200";
  const muted = isDark ? "text-white/35" : "text-gray-400";
  const divider = isDark ? "bg-white/10" : "bg-gray-200";

  return (
    <div className={`h-screen ${bg} ${text} flex flex-col overflow-hidden`}>
      {/* Header */}
      <header className={`border-b ${isDark ? "border-white/[0.07]" : "border-gray-200"} shrink-0 z-10 ${isDark ? "bg-[#0f0f13]" : "bg-gray-50"}`}>
        <div className="max-w-screen-2xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-sm tracking-tight">Bingo</h1>
            <span className={`text-xs ${muted}`}>
              {isPlaying ? "em andamento" : isPaused ? "pausado" : "finalizado"}
            </span>
          </div>
          <div className="flex items-center gap-2">
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
            <Link
              href="/view"
              target="_blank"
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                isDark
                  ? "border-white/[0.08] text-white/40 hover:text-white/70"
                  : "border-gray-200 text-gray-400 hover:text-gray-700"
              }`}
            >
              Tela dos participantes
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 max-w-screen-2xl mx-auto w-full px-6 py-6 flex gap-6">

        {/* Coluna esquerda */}
        <div className="w-56 shrink-0 flex flex-col gap-3 overflow-y-auto min-h-0">

          {/* Último número */}
          <div className={`border ${card} rounded-lg p-4 flex flex-col items-center gap-3`}>
            <span className={`text-[11px] ${muted}`}>Último chamado</span>

            {lastNum ? (
              <div
                key={lastNum}
                className={`
                  w-20 h-20 rounded-full flex flex-col items-center justify-center
                  ${lastCalledAnimation ? "animate-pop-in" : ""}
                  ${lastLetter?.letter === "B" ? "bg-sky-500" : ""}
                  ${lastLetter?.letter === "I" ? "bg-violet-500" : ""}
                  ${lastLetter?.letter === "N" ? "bg-amber-500" : ""}
                  ${lastLetter?.letter === "G" ? "bg-emerald-500" : ""}
                  ${lastLetter?.letter === "O" ? "bg-rose-500" : ""}
                `}
              >
                <span className="text-[10px] font-bold text-black/50 leading-none">
                  {lastLetter?.letter}
                </span>
                <span className="text-3xl font-black text-black leading-none">
                  {lastNum}
                </span>
              </div>
            ) : (
              <div className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <span className={`text-sm ${muted}`}>—</span>
              </div>
            )}

            <div className="flex gap-4 text-sm w-full justify-center">
              <div className="text-center">
                <div className="text-xl font-bold tabular-nums">{session.drawn_numbers.length}</div>
                <div className={`text-[11px] ${muted}`}>chamados</div>
              </div>
              <div className={`w-px ${divider}`} />
              <div className="text-center">
                <div className={`text-xl font-bold tabular-nums ${isDark ? "text-white/40" : "text-gray-400"}`}>{session.remaining_numbers.length}</div>
                <div className={`text-[11px] ${muted}`}>restantes</div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatus(isPaused ? "playing" : "paused")}
              disabled={isFinished}
              className={`flex-1 py-2 rounded text-xs font-medium border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                isDark
                  ? "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/70"
                  : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              }`}
            >
              {isPaused ? "Continuar" : "Pausar"}
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex-1 py-2 rounded text-xs font-medium border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Reiniciar
            </button>
          </div>

          {/* Configuração de rodada */}
          <RoundConfig theme={theme} />

          {/* Prêmio */}
          <PrizeEditor theme={theme} />

          {/* QR Code */}
          <QRShare theme={theme} />

          {/* Progresso */}
          <div className={`border ${card} rounded-lg px-3 py-2.5`}>
            <div className="flex justify-between mb-1.5">
              <span className={`text-[11px] ${muted}`}>Progresso</span>
              <span className={`text-[11px] ${muted} tabular-nums`}>
                {Math.round((session.drawn_numbers.length / 75) * 100)}%
              </span>
            </div>
            <div className={`h-1 ${isDark ? "bg-white/[0.08]" : "bg-gray-100"} rounded-full overflow-hidden`}>
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(session.drawn_numbers.length / 75) * 100}%` }}
              />
            </div>
          </div>

          {/* Histórico */}
          <div className={`border ${card} rounded-lg p-3 flex-1`}>
            <p className={`text-[11px] ${muted} mb-2.5`}>Histórico</p>
            {history.length === 0 ? (
              <p className={`text-xs ${muted} text-center py-3`}>Nenhum número ainda</p>
            ) : (
              <div className="flex flex-wrap gap-1 overflow-y-auto max-h-[240px]">
                {history.map((n, i) => {
                  const ltr = getBingoLetter(n);
                  return (
                    <span
                      key={n}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${i === 0 ? "ring-1 ring-white/25 scale-110" : "opacity-50"}
                        ${ltr.letter === "B" ? "bg-sky-500 text-white" : ""}
                        ${ltr.letter === "I" ? "bg-violet-500 text-white" : ""}
                        ${ltr.letter === "N" ? "bg-amber-500 text-black" : ""}
                        ${ltr.letter === "G" ? "bg-emerald-500 text-black" : ""}
                        ${ltr.letter === "O" ? "bg-rose-500 text-white" : ""}
                      `}
                    >
                      {n}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Grade BINGO */}
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className={`border ${card} rounded-lg p-5 flex-1 min-h-0 flex flex-col`}>
            <div className="flex items-baseline justify-between mb-4 shrink-0">
              <p className={`text-sm font-medium`}>Marque o número chamado</p>
              <span className={`text-xs ${muted}`}>clique para desmarcar</span>
            </div>
            <div className="flex-1 min-h-0 flex items-center h-full">
              <BingoGrid
                calledNumbers={session.drawn_numbers}
                lastCalled={session.last_drawn}
                onToggle={callNumber}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`rounded-lg border p-6 max-w-xs w-full ${isDark ? "bg-[#1a1a22] border-white/10" : "bg-white border-gray-200"}`}>
            <h3 className="font-semibold text-base mb-1">Reiniciar o jogo?</h3>
            <p className={`text-sm mb-5 ${muted}`}>
              Todos os números marcados serão apagados.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`flex-1 py-2 rounded text-sm border transition-colors ${
                  isDark ? "border-white/10 text-white/50 hover:text-white" : "border-gray-200 text-gray-500 hover:text-gray-900"
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded bg-red-500 hover:bg-red-400 text-white font-medium text-sm transition-colors"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function handleReset() {
    await resetGame();
    setShowResetConfirm(false);
  }
}
