export type Resource = {
  id: number;
  name: string;
  category:
    | "Ore"
    | "Gas"
    | "Crystal"
    | "Liquid"
    | "Alloy"
    | "Organic"
    | "Energy"
    | "Currency";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  base_value: number;
};

export type GalaxyEntity = {
  id: number;
  x: number;
  y: number;
  type: "planet" | "trader";
  resource: Resource;
};

export type IdleGameWorld = {
  id?: string; // UUID (Primärschlüssel)
  entities?: GalaxyEntity[]; // Liste der Planeten und Trader
  seed?: string; // Welt-Seed
};

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
  current_chunk?: {
    x: number; // Chunk-Koordinate X
    y: number; // Chunk-Koordinate Y
  };
};
