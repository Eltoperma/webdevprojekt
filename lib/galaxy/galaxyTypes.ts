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
