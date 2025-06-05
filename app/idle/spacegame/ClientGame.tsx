// app/idle/spacegame/ClientGame.tsx
"use client";

import GalaxyMap from "@/app/components/idlespacegame/GalaxyMap";
import type { GalaxyEntity } from "@/lib/galaxy/galaxyTypes";
import type { IdleGame } from "@/lib/galaxy/idleGameTypes";

type Props = {
  userId: string;
  world: GalaxyEntity[];
  game: IdleGame;
};

export default function ClientGame({ userId, world, game }: Props) {
  return (
    <div className="p-4">
      <GalaxyMap entities={world} player={game} />
    </div>
  );
}
