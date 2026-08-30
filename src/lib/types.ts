export type CardColor = "yellow" | "blue" | "green" | "red" | "pink" | "purple" | "orange" | "white";
export type RoundType = "principal" | "extra";

export interface ChatMessage {
  id: string;
  session_id: string;
  author: string;
  body: string;
  created_at: string;
}

export interface BingoSession {
  id: string;
  drawn_numbers: number[];
  remaining_numbers: number[];
  prize: string;
  game_status: "waiting" | "playing" | "paused" | "finished";
  last_drawn: number | null;
  card_color: CardColor;
  round_type: RoundType;
  created_at: string;
  updated_at: string;
}

export type GameStatus = BingoSession["game_status"];
