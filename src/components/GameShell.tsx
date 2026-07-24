"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ConversationOverlay from "./ConversationOverlay";
import VictoryScreen from "./VictoryScreen";

const PhaserGame = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
});

export default function GameShell() {
  const [gameState, setGameState] = useState<
    "intro" | "playing" | "victory" | "gameover"
  >("intro");
  const [score, setScore] = useState(0);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;

    import("@/game/EventBus").then(({ EventBus, GameEvents }) => {
      if (!active) return;

      const onVictory = (data: { score: number }) => {
        setScore(data.score);
        setGameState("victory");
      };
      const onGameOver = (data: { score: number }) => {
        setScore(data.score);
        setGameState("gameover");
      };
      const onGameStart = () => setGameState("playing");

      EventBus.on(GameEvents.VICTORY, onVictory);
      EventBus.on(GameEvents.GAME_OVER, onGameOver);
      EventBus.on(GameEvents.GAME_START, onGameStart);

      cleanup = () => {
        EventBus.off(GameEvents.VICTORY, onVictory);
        EventBus.off(GameEvents.GAME_OVER, onGameOver);
        EventBus.off(GameEvents.GAME_START, onGameStart);
      };
    });

    return () => {
      active = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const handleRestart = () => {
    import("@/game/EventBus").then(({ EventBus }) => {
      EventBus.emit("restart-game");
      setGameState("playing");
      setScore(0);
    });
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-900 overflow-hidden relative">
      <PhaserGame />

      {gameState === "intro" && (
        <ConversationOverlay onComplete={() => setGameState("playing")} />
      )}

      {gameState === "victory" && (
        <VictoryScreen score={score} onRestart={handleRestart} />
      )}

      {gameState === "gameover" && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-red-500 mb-6">
            游戏结束 😢
          </h2>
          <p className="text-white/80 text-xl mb-8">最终得分: {score} 🎂</p>
          <motion.button
            onClick={handleRestart}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xl font-bold rounded-full shadow-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            再试一次 🎮
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
