export interface BingoSession {
  id: string;
  drawn_numbers: number[];
  remaining_numbers: number[];
  prize: string;
  game_status: "waiting" | "playing" | "paused" | "finished";
  last_drawn: number | null;
  created_at: string;
  updated_at: string;
}

export type GameStatus = BingoSession["game_status"];
