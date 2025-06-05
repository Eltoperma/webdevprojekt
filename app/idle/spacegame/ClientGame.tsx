"use client";

import { useEffect, useState } from "react";
import GalaxyMap from "@/app/components/idlespacegame/GalaxyMap";
import { loadWorld } from "./world";

export default function ClientGame({ userId }: { userId: string }) {
  const [world, setWorld] = useState([]);
  const [game, setGame] = useState(null);

  useEffect(() => {
    (async () => {
      const { world, game } = await loadWorld(userId);
      setWorld(world);
      setGame(game);
    })();
  }, [userId]);

  return (
    <div className="p-4">
      {world.length > 0 && game && <GalaxyMap entities={world} player={game} />}
    </div>
  );
}
