"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chat";
import type { Theme } from "@/hooks/useTheme";
import type { ChatMessage } from "@/lib/types";

interface ChatModeratorProps {
  theme?: Theme;
}

/** Um toast individual com auto-dismiss de 3s, pausado no hover */
function PendingToast({
  msg,
  isDark,
  onApprove,
  onDelete,
}: {
  msg: ChatMessage;
  isDark: boolean;
  onApprove: () => void;
  onDelete: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 3000;
  const TICK = 50;

  useEffect(() => {
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      if (paused) return;
      elapsed += TICK;
      setProgress(Math.max(0, 100 - (elapsed / DURATION) * 100));
      if (elapsed >= DURATION) {
        clearInterval(intervalRef.current!);
        setVisible(false);
      }
    }, TICK);
    return () => clearInterval(intervalRef.current!);
  }, [paused]);

  if (!visible) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`
        w-72 rounded-xl border shadow-xl overflow-hidden
        animate-slide-in-right
        ${isDark
          ? "bg-[#1c1c24] border-white/10 text-white"
          : "bg-white border-gray-200 text-gray-900"}
      `}
    >
      {/* Barra de progresso */}
      <div className="h-0.5 bg-amber-500/20 w-full">
        <div
          className="h-full bg-amber-500 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        {/* Remetente + mensagem */}
        <div className="flex flex-col gap-0.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? "text-amber-400/70" : "text-amber-600"}`}>
            {msg.author}
          </span>
          <p className={`text-sm leading-snug ${isDark ? "text-white/85" : "text-gray-800"}`}>
            {msg.body}
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={() => { onApprove(); setVisible(false); }}
            className="flex-1 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
          >
            ✓ Aprovar
          </button>
          <button
            onClick={() => { onDelete(); setVisible(false); }}
            className="flex-1 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            ✕ Remover
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatModerator({ theme = "dark" }: ChatModeratorProps) {
  const {
    pending,
    isLoading,
    fetchMessages,
    fetchPending,
    approveMessage,
    deleteMessage,
    subscribe,
  } = useChatStore();

  const isDark = theme === "dark";
  const card = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-200";
  const muted = isDark ? "text-white/35" : "text-gray-400";

  // IDs de mensagens já exibidas como toast (para não re-mostrar no polling)
  const shownRef = useRef<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ChatMessage[]>([]);

  useEffect(() => {
    fetchMessages();
    fetchPending();
    const unsub = subscribe();
    return unsub;
  }, []);

  // Polling de pendentes a cada 4s
  useEffect(() => {
    const interval = setInterval(() => fetchPending(), 4000);
    return () => clearInterval(interval);
  }, []);

  // Sempre que `pending` mudar, enfileira novos toasts
  useEffect(() => {
    const newOnes = pending.filter((m) => !shownRef.current.has(m.id));
    if (newOnes.length === 0) return;
    newOnes.forEach((m) => shownRef.current.add(m.id));
    setToasts((prev) => [...prev, ...newOnes]);
  }, [pending]);

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((m) => m.id !== id));

  return (
    <>
      {/* Card compacto na sidebar */}
      <div className={`rounded-2xl border ${card} px-4 py-3 flex items-center justify-between`}>
        <p className={`text-xs uppercase tracking-widest ${muted}`}>Chat</p>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className={`text-[10px] ${muted}`}>…</span>
          ) : pending.length > 0 ? (
            <span className="text-[10px] font-bold bg-amber-500 text-black rounded-full px-1.5 py-0.5 leading-none animate-pulse">
              {pending.length} pendente{pending.length > 1 ? "s" : ""}
            </span>
          ) : (
            <span className={`text-[10px] ${muted}`}>nenhum pendente</span>
          )}
        </div>
      </div>

      {/* Toasts flutuantes */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((msg) => (
          <div key={msg.id} className="pointer-events-auto">
            <PendingToast
              msg={msg}
              isDark={isDark}
              onApprove={() => { approveMessage(msg.id); removeToast(msg.id); }}
              onDelete={() => { deleteMessage(msg.id); removeToast(msg.id); }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
