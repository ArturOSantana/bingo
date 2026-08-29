"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { BingoSession, CardColor, GameStatus, RoundType } from "@/lib/types";

interface BingoStore {
  session: BingoSession | null;
  isLoading: boolean;
  lastCalledAnimation: boolean;
  fetchSession: () => Promise<void>;
  callNumber: (num: number) => Promise<void>;
  setPrize: (prize: string) => Promise<void>;
  setStatus: (status: GameStatus) => Promise<void>;
  setCardColor: (color: CardColor) => Promise<void>;
  setRoundType: (roundType: RoundType) => Promise<void>;
  resetGame: () => Promise<void>;
  subscribeToUpdates: () => () => void;
}

const ALL_NUMBERS = Array.from({ length: 75 }, (_, i) => i + 1);

export const useBingoStore = create<BingoStore>((set, get) => ({
  session: null,
  isLoading: true,
  lastCalledAnimation: false,

  fetchSession: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("bingo_session")
      .select("*")
      .eq("id", "main")
      .single();

    if (!error && data) {
      set({ session: data as BingoSession, isLoading: false });
      return;
    }

    // Sessão não existe — tenta criar
    const newSession: Partial<BingoSession> = {
      id: "main",
      drawn_numbers: [],
      remaining_numbers: ALL_NUMBERS,
      prize: "",
      game_status: "playing",
      last_drawn: null,
      card_color: "yellow",
      round_type: "principal",
    };

    const { data: created, error: insertError } = await supabase
      .from("bingo_session")
      .upsert(newSession)
      .select()
      .single();

    if (insertError || !created) {
      console.error("Supabase error:", insertError?.message);
      set({
        session: { ...newSession, id: "main", created_at: "", updated_at: "" } as BingoSession,
        isLoading: false,
      });
    } else {
      set({ session: created as BingoSession, isLoading: false });
    }
  },

  // Marca ou desmarca um número (chamado pelo admin ao anunciar a pedra)
  callNumber: async (num: number) => {
    const { session } = get();
    if (!session) return;

    const alreadyCalled = session.drawn_numbers.includes(num);
    let newDrawn: number[];
    let newRemaining: number[];

    if (alreadyCalled) {
      // Desmarca (corrige engano)
      newDrawn = session.drawn_numbers.filter((n) => n !== num);
      newRemaining = [...session.remaining_numbers, num].sort((a, b) => a - b);
    } else {
      // Marca como chamado
      newDrawn = [...session.drawn_numbers, num];
      newRemaining = session.remaining_numbers.filter((n) => n !== num);
    }

    const updates = {
      drawn_numbers: newDrawn,
      remaining_numbers: newRemaining,
      last_drawn: alreadyCalled
        ? (newDrawn.length > 0 ? newDrawn[newDrawn.length - 1] : null)
        : num,
      game_status: newRemaining.length === 0 ? ("finished" as GameStatus) : session.game_status,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("bingo_session").update(updates).eq("id", "main");

    set({
      session: { ...session, ...updates } as BingoSession,
      lastCalledAnimation: !alreadyCalled,
    });
    if (!alreadyCalled) {
      setTimeout(() => set({ lastCalledAnimation: false }), 2000);
    }
  },

  setCardColor: async (color: CardColor) => {
    const { session } = get();
    if (!session) return;
    await supabase
      .from("bingo_session")
      .update({ card_color: color, updated_at: new Date().toISOString() })
      .eq("id", "main");
    set({ session: { ...session, card_color: color } });
  },

  setRoundType: async (roundType: RoundType) => {
    const { session } = get();
    if (!session) return;
    await supabase
      .from("bingo_session")
      .update({ round_type: roundType, updated_at: new Date().toISOString() })
      .eq("id", "main");
    set({ session: { ...session, round_type: roundType } });
  },

  setPrize: async (prize: string) => {
    const { session } = get();
    if (!session) return;
    await supabase
      .from("bingo_session")
      .update({ prize, updated_at: new Date().toISOString() })
      .eq("id", "main");
    set({ session: { ...session, prize } });
  },

  setStatus: async (status: GameStatus) => {
    const { session } = get();
    if (!session) return;
    await supabase
      .from("bingo_session")
      .update({ game_status: status, updated_at: new Date().toISOString() })
      .eq("id", "main");
    set({ session: { ...session, game_status: status } });
  },

  resetGame: async () => {
    const resetData = {
      drawn_numbers: [],
      remaining_numbers: ALL_NUMBERS,
      last_drawn: null,
      game_status: "playing" as GameStatus,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("bingo_session").update(resetData).eq("id", "main");
    set({ session: { ...get().session!, ...resetData } });
  },

  subscribeToUpdates: () => {
    const channel = supabase
      .channel("bingo-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bingo_session", filter: "id=eq.main" },
        (payload) => {
          const newData = payload.new as BingoSession;
          const current = get().session;
          const isNewCall =
            current &&
            newData.last_drawn !== current.last_drawn &&
            newData.drawn_numbers.length > (current.drawn_numbers.length ?? 0);
          set({ session: newData, lastCalledAnimation: !!isNewCall });
          if (isNewCall) {
            setTimeout(() => set({ lastCalledAnimation: false }), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
