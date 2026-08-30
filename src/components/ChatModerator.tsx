"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chat";
import type { Theme } from "@/hooks/useTheme";
import type { ChatMessage } from "@/lib/types";

interface ChatModeratorProps {
  theme?: Theme;
}

const MIN_WIDTH = 240;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 320;

/** Toast flutuante — auto-dismiss 3s, pausado no hover */
function MessageToast({
  msg,
  isDark,
  onDelete,
}: {
  msg: ChatMessage;
  isDark: boolean;
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
      className={`w-72 rounded-xl border shadow-xl overflow-hidden animate-slide-in-right
        ${isDark ? "bg-[#1c1c24] border-white/10" : "bg-white border-gray-200"}`}
    >
      <div className={`h-0.5 w-full ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
        <div className="h-full bg-amber-500 transition-none" style={{ width: `${progress}%` }} />
      </div>
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? "text-white/45" : "text-gray-400"}`}>
            {msg.author}
          </span>
          <p className={`text-sm leading-snug ${isDark ? "text-white/85" : "text-gray-800"}`}>
            {msg.body}
          </p>
        </div>
        <button
          onClick={() => { onDelete(); setVisible(false); }}
          title="Apagar mensagem"
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-xs transition-colors
            ${isDark ? "text-white/25 hover:text-red-400 hover:bg-red-500/15" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function ChatModerator({ theme = "dark" }: ChatModeratorProps) {
  const { messages, isLoading, fetchMessages, deleteMessage, subscribe } = useChatStore();

  const isDark = theme === "dark";

  // ── Visibilidade e largura ───────────────────────────────────────────────
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = width;
  }, [width]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      // Arrastar para a esquerda aumenta o painel (largura cresce)
      const delta = startX.current - e.clientX;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW.current + delta)));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── Toasts ───────────────────────────────────────────────────────────────
  const shownRef = useRef<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ChatMessage[]>([]);
  const initialLoadDone = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const unsub = subscribe();
    return unsub;
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!initialLoadDone.current) {
      messages.forEach((m) => shownRef.current.add(m.id));
      initialLoadDone.current = true;
      return;
    }
    const newOnes = messages.filter((m) => !shownRef.current.has(m.id));
    if (!newOnes.length) return;
    newOnes.forEach((m) => shownRef.current.add(m.id));
    setToasts((prev) => [...prev, ...newOnes]);
  }, [messages, isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((m) => m.id !== id));

  const muted = isDark ? "text-white/35" : "text-gray-400";
  const border = isDark ? "border-white/[0.07]" : "border-gray-200";
  const panelBg = isDark ? "bg-[#0f0f13]" : "bg-gray-50";

  return (
    <>
      {/* ── Painel direito ── */}
      <div
        className={`relative shrink-0 flex flex-col border-l ${border} ${panelBg} transition-[width] duration-200 overflow-hidden`}
        style={{ width: open ? width : 0 }}
      >
        {/* Alça de redimensionamento — borda esquerda */}
        {open && (
          <div
            onMouseDown={onMouseDown}
            className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize z-10 group"
            title="Arrastar para redimensionar"
          >
            <div className={`h-full w-px mx-auto transition-colors group-hover:bg-amber-500/50 ${isDark ? "bg-white/5" : "bg-gray-200"}`} />
          </div>
        )}

        {open && (
          <div className="flex flex-col h-full min-h-0 pl-1.5">
            {/* Header */}
            <div className={`shrink-0 flex items-center justify-between px-4 py-3 border-b ${border}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Chat</span>
                <span className={`text-[10px] tabular-nums ${muted}`}>
                  {isLoading ? "…" : messages.length}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                title="Ocultar chat"
                className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors
                  ${isDark ? "text-white/25 hover:text-white/70 hover:bg-white/8" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
              >
                ✕
              </button>
            </div>

            {/* Lista de mensagens */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
              {isLoading ? (
                <p className={`text-xs ${muted} text-center pt-6`}>Carregando…</p>
              ) : messages.length === 0 ? (
                <p className={`text-xs ${muted} text-center pt-6`}>Nenhuma mensagem ainda</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2 group">
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <span className={`text-[10px] font-semibold ${isDark ? "text-white/45" : "text-gray-400"}`}>
                        {msg.author}
                      </span>
                      <p className={`text-sm leading-snug break-words ${isDark ? "text-white/80" : "text-gray-800"}`}>
                        {msg.body}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      title="Apagar"
                      className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity
                        ${isDark ? "text-white/30 hover:text-red-400 hover:bg-red-500/15" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        )}
      </div>

      {/* ── Botão para reabrir (aparece quando fechado) ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Abrir chat"
          className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 px-1.5 py-3 rounded-l-lg border-l border-t border-b text-[10px] font-medium transition-colors
            ${isDark
              ? "bg-[#1c1c24] border-white/10 text-white/40 hover:text-white/80"
              : "bg-white border-gray-200 text-gray-400 hover:text-gray-700"}`}
        >
          <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest uppercase">Chat</span>
          {messages.length > 0 && (
            <span className="bg-amber-500 text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {messages.length > 99 ? "99+" : messages.length}
            </span>
          )}
        </button>
      )}

      {/* ── Toasts flutuantes ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((msg) => (
          <div key={msg.id} className="pointer-events-auto">
            <MessageToast
              msg={msg}
              isDark={isDark}
              onDelete={() => { deleteMessage(msg.id); removeToast(msg.id); }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
