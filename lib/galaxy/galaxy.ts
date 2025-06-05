import seedrandom from "seedrandom";
import { Resource } from "./types";

export function generateGalaxy(seed: string, allResources: Resource[]) {
  const rng = seedrandom(seed);

  const planets = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.floor(rng() * 1000),
    y: Math.floor(rng() * 600),
    resource: allResources[Math.floor(rng() * allResources.length)],
    type: rng() > 0.5 ? "trader" : "planet",
  }));

  return planets;
}
