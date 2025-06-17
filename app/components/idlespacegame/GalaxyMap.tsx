"use client";

import { GalaxyEntity } from "@/app/lib/galaxy/galaxyTypes";

type Props = {
  entities: GalaxyEntity[];
  chunk: { x: number; y: number };
  chunkSize: { width: number; height: number };
};

export default function GalaxyMap({ entities, chunk, chunkSize }: Props) {
  const chunkOffsetX = chunk.x * chunkSize.width;
  const chunkOffsetY = chunk.y * chunkSize.height;

  const visibleEntities = entities.filter((e) => {
    const localX = e.x - chunkOffsetX;
    const localY = e.y - chunkOffsetY;
    return (
      localX >= 0 &&
      localX < chunkSize.width &&
      localY >= 0 &&
      localY < chunkSize.height
    );
  });

  return (
    <>
      {visibleEntities.map((e) => (
        <img
          key={e.id}
          src={
            e.type === "planet"
              ? "/assets/red-planet.png"
              : "/assets/trader.png"
          }
          alt={e.type}
          style={{
            position: "absolute",
            left: `${e.x - chunkOffsetX}px`,
            top: `${e.y - chunkOffsetY}px`,
            width: "40px",
          }}
        />
      ))}
    </>
  );
}
