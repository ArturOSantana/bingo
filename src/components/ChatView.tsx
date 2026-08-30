"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chat";
import type { Theme } from "@/hooks/useTheme";

interface ChatViewProps {
  theme?: Theme;
}

export function ChatView({ theme = "dark" }: ChatViewProps) {
  const { messages, isLoading, fetchMessages, sendMessage, subscribe } = useChatStore();

  const isDark = theme === "dark";
  const card = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-200";
  const muted = isDark ? "text-white/35" : "text-gray-400";
  const inputBg = isDark
    ? "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/25"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400";

  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const unsub = subscribe();
    return unsub;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    await sendMessage(author || "Anônimo", trimmed);
    setBody("");
    setSent(true);
    setSending(false);
    setTimeout(() => setSent(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`border ${card} rounded-2xl flex flex-col overflow-hidden`}>
      <div className={`px-4 py-3 border-b ${isDark ? "border-white/[0.06]" : "border-gray-100"}`}>
        <p className={`text-xs uppercase tracking-widest ${muted}`}>Chat</p>
      </div>

      {/* Mensagens */}
      <div className="overflow-y-auto px-4 py-3 flex flex-col gap-2.5 max-h-64 min-h-[80px]">
        {isLoading ? (
          <p className={`text-xs ${muted} text-center pt-4`}>Carregando...</p>
        ) : messages.length === 0 ? (
          <p className={`text-xs ${muted} text-center pt-4`}>Nenhuma mensagem ainda</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-0.5">
              <span className={`text-[10px] font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>
                {msg.author}
              </span>
              <span className={`text-sm leading-snug ${isDark ? "text-white/80" : "text-gray-800"}`}>
                {msg.body}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`border-t ${isDark ? "border-white/[0.06]" : "border-gray-100"} px-4 py-3 flex flex-col gap-2`}>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value.slice(0, 40))}
          placeholder="Seu nome (opcional)"
          className={`w-full rounded-lg border px-3 py-1.5 text-xs outline-none transition-colors ${inputBg}`}
        />
        <div className="flex gap-2 items-end">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 200))}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem…"
            rows={2}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-colors resize-none ${inputBg}`}
          />
          <button
            onClick={handleSend}
            disabled={!body.trim() || sending}
            className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? "…" : "Enviar"}
          </button>
        </div>
        {sent && (
          <p className="text-[11px] text-emerald-500">✓ Enviado</p>
        )}
        <p className={`text-[10px] ${muted}`}>
          {body.length}/200 · Enter para enviar
        </p>
      </div>
    </div>
  );
}
