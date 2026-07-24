"use client";

import { useEffect, useRef } from "react";
import { createGame } from "./main";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) {
      return;
    }

    if (containerRef.current) {
      gameRef.current = createGame(containerRef.current);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} id="game-container" className="w-full h-full" />
  );
}
