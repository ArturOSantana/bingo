"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";

const SESSION_ID = "main";
const MAX_BODY = 200;

interface ChatStore {
  /** Mensagens aprovadas — visíveis para todos */
  approved: ChatMessage[];
  /** Mensagens pendentes — visíveis apenas para o admin */
  pending: ChatMessage[];
  isLoading: boolean;

  /** Carrega mensagens iniciais (apenas aprovadas) */
  fetchMessages: () => Promise<void>;
  /** Carrega mensagens pendentes (admin) */
  fetchPending: () => Promise<void>;
  /** Envia uma nova mensagem (fica pendente até aprovação) */
  sendMessage: (author: string, body: string) => Promise<void>;
  /** Admin aprova uma mensagem pendente */
  approveMessage: (id: string) => Promise<void>;
  /** Admin remove uma mensagem (aprovada ou pendente) */
  deleteMessage: (id: string) => Promise<void>;
  /** Subscreve a atualizações em tempo real */
  subscribe: () => () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  approved: [],
  pending: [],
  isLoading: true,

  fetchMessages: async () => {
    set({ isLoading: true });

    // Busca mensagens aprovadas (respeita RLS — anon só vê approved=true)
    const { data: approvedData } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", SESSION_ID)
      .eq("approved", true)
      .order("created_at", { ascending: true })
      .limit(100);

    set({
      approved: (approvedData ?? []) as ChatMessage[],
      isLoading: false,
    });
  },

  fetchPending: async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", SESSION_ID)
      .eq("approved", false)
      .order("created_at", { ascending: true })
      .limit(100);

    set({ pending: (data ?? []) as ChatMessage[] });
  },

  sendMessage: async (author, body) => {
    const trimmedAuthor = author.trim().slice(0, 40) || "Anônimo";
    const trimmedBody = body.trim().slice(0, MAX_BODY);
    if (!trimmedBody) return;

    await supabase.from("chat_messages").insert({
      session_id: SESSION_ID,
      author: trimmedAuthor,
      body: trimmedBody,
      approved: false,
    });
  },

  approveMessage: async (id) => {
    const { pending, approved } = get();
    const msg = pending.find((m) => m.id === id);
    if (!msg) return;

    await supabase
      .from("chat_messages")
      .update({ approved: true })
      .eq("id", id);

    set({
      pending: pending.filter((m) => m.id !== id),
      approved: [...approved, { ...msg, approved: true }],
    });
  },

  deleteMessage: async (id) => {
    await supabase.from("chat_messages").delete().eq("id", id);
    set({
      pending: get().pending.filter((m) => m.id !== id),
      approved: get().approved.filter((m) => m.id !== id),
    });
  },

  subscribe: () => {
    // Canal para mensagens aprovadas (INSERT de approved=true ou UPDATE que aprova)
    const approvedChannel = supabase
      .channel("chat-approved")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${SESSION_ID}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.approved) {
            set((s) => ({
              approved: s.approved.some((m) => m.id === msg.id)
                ? s.approved
                : [...s.approved, msg],
            }));
          } else {
            // Nova mensagem pendente
            set((s) => ({
              pending: s.pending.some((m) => m.id === msg.id)
                ? s.pending
                : [...s.pending, msg],
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${SESSION_ID}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.approved) {
            set((s) => ({
              pending: s.pending.filter((m) => m.id !== msg.id),
              approved: s.approved.some((m) => m.id === msg.id)
                ? s.approved
                : [...s.approved, msg],
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const id = (payload.old as { id: string }).id;
          set((s) => ({
            pending: s.pending.filter((m) => m.id !== id),
            approved: s.approved.filter((m) => m.id !== id),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(approvedChannel);
    };
  },
}));
