import seedrandom from "seedrandom";
import { Resource, GalaxyEntity } from "./galaxyTypes";

export function generateGalaxy(
  seed: string,
  allResources: Resource[]
): GalaxyEntity[] {
  const rng = seedrandom(seed);

  // Gewichtung je Rarität
  const rarityWeights: Record<Resource["rarity"], number> = {
    Common: 50,
    Uncommon: 30,
    Rare: 12,
    Epic: 6,
    Legendary: 2,
  };

  // Hilfsfunktion: Ressource nach Gewicht picken
  function pickWeightedResource(): Resource {
    const pool = allResources.flatMap((res) =>
      Array(rarityWeights[res.rarity]).fill(res)
    );
    const idx = Math.floor(rng() * pool.length);
    return pool[idx];
  }

  // Entity-Generierung
  const planets: GalaxyEntity[] = Array.from({ length: 100 }, (_, i) => {
    const isTrader = rng() < 0.25; // 25% Chance auf Trader

    return {
      id: i,
      x: Math.floor(rng() * 1000),
      y: Math.floor(rng() * 600),
      type: isTrader ? "trader" : "planet",
      resource: pickWeightedResource(),
    };
  });

  return planets;
}
