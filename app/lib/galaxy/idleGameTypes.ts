export type IdleGame = {
  id: string; // UUID (Primärschlüssel)
  user_id: string; // Spielerreferenz
  seed: string; // Welt-Seed
  position_x: number;
  position_y: number;
  created_at: string; // ISO-Date
  updated_at: string; // ISO-Date
  current_pos: {
    x: number; // Aktuelle X-Position des Spielers
    y: number; // Aktuelle Y-Position des Spielers
  };
};
