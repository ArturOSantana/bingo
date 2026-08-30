"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat";
import type { Theme } from "@/hooks/useTheme";

interface ChatModeratorProps {
  theme?: Theme;
}

export function ChatModerator({ theme = "dark" }: ChatModeratorProps) {
  const { approved, pending, isLoading, fetchMessages, fetchPending, approveMessage, deleteMessage, subscribe } =
    useChatStore();

  const isDark = theme === "dark";
  const card = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-200";
  const muted = isDark ? "text-white/35" : "text-gray-400";
  const approvedBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchPending();
    const unsub = subscribe();
    return unsub;
  }, []);

  // Polling de pendentes a cada 4s (Realtime INSERT já captura novos, mas garante consistência)
  useEffect(() => {
    const interval = setInterval(() => fetchPending(), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    approvedBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [approved.length]);

  const total = pending.length + approved.length;

  return (
    <div className={`rounded-2xl border ${card} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}>
        <p className={`text-xs uppercase tracking-widest ${muted}`}>Chat</p>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <span className="text-[10px] font-bold bg-amber-500 text-black rounded-full px-1.5 py-0.5 leading-none">
              {pending.length} pendente{pending.length > 1 ? "s" : ""}
            </span>
          )}
          <span className={`text-[10px] ${muted}`}>{total} mensage{total !== 1 ? "ns" : "m"}</span>
        </div>
      </div>

      {/* Fila de pendentes */}
      {pending.length > 0 && (
        <div className={`px-4 py-3 border-b ${isDark ? "border-white/[0.06] bg-amber-500/[0.04]" : "border-amber-100 bg-amber-50"}`}>
          <p className={`text-[10px] uppercase tracking-widest mb-2 ${isDark ? "text-amber-400/70" : "text-amber-600"}`}>
            Aguardando moderação
          </p>
          <div className="flex flex-col gap-2 max-h-44 overflow-y-auto">
            {pending.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg p-2.5 flex flex-col gap-1 ${isDark ? "bg-white/5 border border-white/8" : "bg-white border border-amber-100"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[10px] font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      {msg.author}
                    </span>
                    <span className={`text-xs leading-snug ${isDark ? "text-white/80" : "text-gray-800"}`}>
                      {msg.body}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0 mt-0.5">
                    <button
                      onClick={() => approveMessage(msg.id)}
                      title="Aprovar"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-emerald-500 hover:bg-emerald-500/15 transition-colors text-sm"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      title="Remover"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagens aprovadas */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-2 overflow-y-auto max-h-52 min-h-[60px]">
        {isLoading ? (
          <p className={`text-xs ${muted} text-center pt-2`}>Carregando...</p>
        ) : approved.length === 0 ? (
          <p className={`text-xs ${muted} text-center pt-2`}>Sem mensagens aprovadas</p>
        ) : (
          approved.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 group">
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className={`text-[10px] font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  {msg.author}
                </span>
                <span className={`text-xs leading-snug ${isDark ? "text-white/75" : "text-gray-700"}`}>
                  {msg.body}
                </span>
              </div>
              <button
                onClick={() => deleteMessage(msg.id)}
                title="Remover mensagem"
                className={`shrink-0 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/15 text-[10px]`}
              >
                ✕
              </button>
            </div>
          ))
        )}
        <div ref={approvedBottomRef} />
      </div>
    </div>
  );
}
