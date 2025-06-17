"use client";

import { useEffect, useRef, useState } from "react";
import GalaxyMap from "@/app/components/idlespacegame/GalaxyMap";
import {
  GalaxyEntity,
  IdleGame,
  IdleGameWorld,
  Resource,
} from "@/app/lib/galaxy/galaxyTypes";
import { generateChunkEntities } from "@/app/lib/galaxy/generateChunkEntities";

const CHUNK_PADDING = 50;
const PLAYER_SIZE = 65;
const FIXED_CHUNK_WIDTH = 1300;
const FIXED_CHUNK_HEIGHT = 900;

const getChunkCoord = (value: number, chunkSize: number) =>
  Math.floor(value / chunkSize);

type Props = {
  userId: string;
  world: IdleGameWorld;
  game: IdleGame & { seed: string; current_chunk?: { x: number; y: number } };
  resources: Resource[];
};

export default function ClientGame({ userId, world, game, resources }: Props) {
  const [viewportSize, setViewportSize] = useState({
    width: 1200,
    height: 800,
  });

  const CHUNK_WIDTH = FIXED_CHUNK_WIDTH;
  const CHUNK_HEIGHT = FIXED_CHUNK_HEIGHT;

  const [rocketPos, setRocketPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [smoothedRocketPos, setSmoothedRocketPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [chunk, setChunk] = useState({ x: 0, y: 0 });

  const [visibleEntities, setVisibleEntities] = useState<GalaxyEntity[]>([]);
  const chunkEntityCache = useRef<Map<string, GalaxyEntity[]>>(new Map());
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updateSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!rocketPos) {
      const chunk = game.current_chunk ?? { x: 0, y: 0 };
      const pos = {
        x: chunk.x * CHUNK_WIDTH + viewportSize.width / 2,
        y: chunk.y * CHUNK_HEIGHT + viewportSize.height / 2,
      };
      setRocketPos(pos);
      setSmoothedRocketPos(pos);
      setChunk({
        x: getChunkCoord(pos.x, CHUNK_WIDTH),
        y: getChunkCoord(pos.y, CHUNK_HEIGHT),
      });
    }
  }, [viewportSize, game.current_chunk, rocketPos]);

  useEffect(() => {
    if (!rocketPos) return;
    targetPosRef.current = rocketPos;
    let frame: number;

    const animate = () => {
      setSmoothedRocketPos((prev) => {
        if (!prev || !targetPosRef.current) return prev!;
        const dx = targetPosRef.current.x - prev.x;
        const dy = targetPosRef.current.y - prev.y;
        const factor = 0.05;
        return {
          x: prev.x + dx * factor,
          y: prev.y + dy * factor,
        };
      });
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [rocketPos]);

  useEffect(() => {
    if (!smoothedRocketPos) return;
    const nextChunkX = getChunkCoord(smoothedRocketPos.x, CHUNK_WIDTH);
    const nextChunkY = getChunkCoord(smoothedRocketPos.y, CHUNK_HEIGHT);

    if (nextChunkX !== chunk.x || nextChunkY !== chunk.y) {
      const newChunk = { x: nextChunkX, y: nextChunkY };
      setChunk(newChunk);

      const chunkKey = `${newChunk.x},${newChunk.y}`;
      if (!chunkEntityCache.current.has(chunkKey)) {
        const chunkOffset = {
          x: newChunk.x * CHUNK_WIDTH,
          y: newChunk.y * CHUNK_HEIGHT,
        };
        const entities = generateChunkEntities(
          `${game.seed}-${chunkKey}`,
          resources,
          20,
          { width: viewportSize.width, height: viewportSize.height },
          chunkOffset
        );
        chunkEntityCache.current.set(chunkKey, entities);
      }

      setVisibleEntities(chunkEntityCache.current.get(chunkKey)!);
    }
  }, [smoothedRocketPos, chunk, CHUNK_WIDTH, CHUNK_HEIGHT]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const globalX = localX + chunk.x * CHUNK_WIDTH;
    const globalY = localY + chunk.y * CHUNK_HEIGHT;
    setRocketPos({ x: globalX, y: globalY });
  };

  if (!rocketPos || !smoothedRocketPos) return null;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: `${viewportSize.width}px`,
        height: `${viewportSize.height}px`,
        backgroundImage: "url('/assets/galaxy-bg.png')",
        backgroundSize: "cover",
      }}
      onClick={handleMapClick}
    >
      <GalaxyMap
        entities={visibleEntities}
        chunk={chunk}
        chunkSize={{ width: CHUNK_WIDTH, height: CHUNK_HEIGHT }}
      />
      <img
        src="/assets/spaceship.png"
        alt="Spaceship"
        style={{
          position: "absolute",
          left: `${smoothedRocketPos.x - chunk.x * CHUNK_WIDTH}px`,
          top: `${smoothedRocketPos.y - chunk.y * CHUNK_HEIGHT}px`,
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          width: `${PLAYER_SIZE * 1.5}px`,
          height: `${PLAYER_SIZE}px`,
        }}
      />

      <div
        className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded"
        style={{ zIndex: 999 }}
      >
        <div>
          <strong>Global:</strong> {Math.round(smoothedRocketPos.x)},{" "}
          {Math.round(smoothedRocketPos.y)}
        </div>
        <div>
          <strong>Chunk:</strong> {chunk.x}, {chunk.y}
        </div>
        <div>
          <strong>Offset:</strong>{" "}
          {Math.round(smoothedRocketPos.x - chunk.x * CHUNK_WIDTH)},{" "}
          {Math.round(smoothedRocketPos.y - chunk.y * CHUNK_HEIGHT)}
        </div>
      </div>

      <div
        className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-white text-sm px-3 py-2 rounded shadow"
        style={{ zIndex: 998 }}
      >
        <strong>Inventar</strong>
        <ul className="text-xs mt-1 space-y-1">
          <li>🪨 Stein x23</li>
          <li>🔩 Metall x5</li>
          <li>💎 Kristall x1</li>
        </ul>
      </div>
    </div>
  );
}
