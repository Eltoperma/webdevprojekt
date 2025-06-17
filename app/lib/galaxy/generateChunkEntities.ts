import seedrandom from "seedrandom";
import { Resource, GalaxyEntity } from "./galaxyTypes";

export function generateChunkEntities(
  seed: string,
  allResources: Resource[],
  count = 20,
  chunkSize = { width: 1100, height: 700 },
  chunkOffset = { x: 0, y: 0 }
): GalaxyEntity[] {
  const rng = seedrandom(seed);

  const rarityWeights: Record<Resource["rarity"], number> = {
    Common: 50,
    Uncommon: 30,
    Rare: 12,
    Epic: 6,
    Legendary: 2,
  };

  function pickWeightedResource(): Resource {
    const pool = allResources.flatMap((res) =>
      Array(rarityWeights[res.rarity]).fill(res)
    );
    const idx = Math.floor(rng() * pool.length);
    return pool[idx];
  }

  const entities: GalaxyEntity[] = Array.from({ length: count }, (_, i) => {
    const isTrader = rng() < 0.25;

    return {
      id: i,
      x: Math.floor(rng() * chunkSize.width) + chunkOffset.x,
      y: Math.floor(rng() * chunkSize.height) + chunkOffset.y,
      type: isTrader ? "trader" : "planet",
      resource: pickWeightedResource(),
    };
  });

  return entities;
}
