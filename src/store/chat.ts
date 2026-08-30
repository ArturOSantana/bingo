"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";

const SESSION_ID = "main";
const MAX_BODY = 200;

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;

  fetchMessages: () => Promise<void>;
  sendMessage: (author: string, body: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  subscribe: () => () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: true,

  fetchMessages: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", SESSION_ID)
      .order("created_at", { ascending: true })
      .limit(100);
    set({ messages: (data ?? []) as ChatMessage[], isLoading: false });
  },

  sendMessage: async (author, body) => {
    const trimmedAuthor = author.trim().slice(0, 40) || "Anônimo";
    const trimmedBody = body.trim().slice(0, MAX_BODY);
    if (!trimmedBody) return;
    await supabase.from("chat_messages").insert({
      session_id: SESSION_ID,
      author: trimmedAuthor,
      body: trimmedBody,
    });
  },

  deleteMessage: async (id) => {
    await supabase.from("chat_messages").delete().eq("id", id);
    set({ messages: get().messages.filter((m) => m.id !== id) });
  },

  subscribe: () => {
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${SESSION_ID}` },
        (payload) => {
          const msg = payload.new as ChatMessage;
          set((s) => ({
            messages: s.messages.some((m) => m.id === msg.id)
              ? s.messages
              : [...s.messages, msg],
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages" },
        (payload) => {
          const id = (payload.old as { id: string }).id;
          set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
}));
