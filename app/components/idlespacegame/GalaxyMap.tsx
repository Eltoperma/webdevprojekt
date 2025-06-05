"use client";

import { useEffect, useRef, useState } from "react";

type Entity = {
  id: number;
  x: number;
  y: number;
  type: "planet" | "trader";
  resource: {
    name: string;
    rarity: string;
  };
};

type Player = {
  position_x: number;
  position_y: number;
};

type Props = {
  entities: Entity[];
  player: Player;
  onMove?: (x: number, y: number) => void;
  onEncounter?: (entity: Entity) => void;
};

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;
const PLAYER_SIZE = 24;

export default function GalaxyMap({
  entities,
  player,
  onMove,
  onEncounter,
}: Props) {
  const [position, setPosition] = useState({
    x: player.position_x,
    y: player.position_y,
  });

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const speed = 20;

    const handleKeyDown = (e: KeyboardEvent) => {
      setPosition((prev) => {
        const next = { ...prev };
        if (e.key === "w") next.y = Math.max(0, prev.y - speed);
        if (e.key === "s") next.y = Math.min(MAP_HEIGHT, prev.y + speed);
        if (e.key === "a") next.x = Math.max(0, prev.x - speed);
        if (e.key === "d") next.x = Math.min(MAP_WIDTH, prev.x + speed);

        if (onMove) onMove(next.x, next.y);

        // Check für Encounter
        const encounter = entities.find(
          (ent) =>
            Math.abs(ent.x - next.x) < PLAYER_SIZE &&
            Math.abs(ent.y - next.y) < PLAYER_SIZE
        );
        if (encounter && onEncounter) {
          onEncounter(encounter);
        }

        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [entities, onMove, onEncounter]);

  return (
    <div
      ref={mapRef}
      className="relative border overflow-hidden rounded"
      style={{
        width: "100%",
        height: 600,
        backgroundImage: 'url("/assets/galaxy-bg.png")',
        backgroundSize: "cover",
        position: "relative",
      }}
    >
      {/* Player */}
      <img
        src="/assets/spaceship.png"
        alt="player"
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Entities */}
      {entities.map((e) => (
        <img
          key={e.id}
          src={`/assets/${e.type === "planet" ? "red-planet" : "trader"}.png`}
          alt={e.type}
          style={{
            position: "absolute",
            left: e.x,
            top: e.y,
            width: 32,
            height: 32,
            transform: "translate(-50%, -50%)",
          }}
          title={`${e.type.toUpperCase()}: ${e.resource.name} (${
            e.resource.rarity
          })`}
        />
      ))}
    </div>
  );
}
