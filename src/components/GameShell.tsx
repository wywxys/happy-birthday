"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useReducer, useRef } from "react";
import * as constants from "../game/constants";
import { gameReducer, initialGameState } from "../game/gameReducer";
import { createCake } from "../game/spawner";
import { useGameLoop } from "../hooks/useGameLoop";
import ConversationOverlay from "./ConversationOverlay";
import VictoryScreen from "./VictoryScreen";

const sfxStub: SfxApi = {
  jump: () => {},
  eat: () => {},
  gameover: () => {},
  victory: () => {},
  setMuted: () => {},
  muted: false,
  playCount: 0,
};

const viewportStyle = {
  width: `min(100vw, ${constants.WORLD_WIDTH / constants.WORLD_HEIGHT} * 100vh)`,
  aspectRatio: `${constants.WORLD_WIDTH} / ${constants.WORLD_HEIGHT}`,
  maxHeight: "100vh",
};
const worldStyle = {
  width: `${constants.WORLD_WIDTH}px`,
  height: `${constants.WORLD_HEIGHT}px`,
  transformOrigin: "top left",
  transform: `scale(min(calc(100vw / ${constants.WORLD_WIDTH}), calc(100vh / ${constants.WORLD_HEIGHT})))`,
};
const skyStyle = {
  background: "linear-gradient(rgb(70, 178, 192), rgb(60, 95, 160))",
};
const groundStyle = {
  height: "15%",
  background: "linear-gradient(rgb(131, 85, 17), rgb(105, 60, 22))",
};
const readyStyle = { top: "30%" };
const promptStyle = { textShadow: "2px 2px 6px rgba(0,0,0,0.6)" };

export default function GameShell() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const stateRef = useRef(state);
  const hudVisible =
    state.phase === "playing" ||
    state.phase === "gameover" ||
    state.phase === "victory";

  useGameLoop(
    (dt) => dispatch({ type: "TICK", dt }),
    state.phase === "playing" || state.phase === "paused",
    state.phase === "paused",
  );

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (state.phase !== "playing") return;
    const id = setInterval(() => {
      dispatch({ type: "SPAWN_CAKE", cake: createCake() });
    }, state.currentSpawnMs);
    return () => clearInterval(id);
  }, [state.phase, state.currentSpawnMs]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      window.__gameDebug = {
        dispatch,
        getState: () => stateRef.current,
        forceEat: (cakeId) => dispatch({ type: "EAT_CAKE", cakeId }),
        forceScore: (score, cakesEaten) =>
          dispatch({ type: "SET_SCORE", score, cakesEaten }),
        forceGameover: () => dispatch({ type: "MISS" }),
        forceVictory: () => dispatch({ type: "VICTORY" }),
        sfx: sfxStub,
      };
      return () => {
        window.__gameDebug = undefined;
      };
    }
  }, []);

  const handleClick = useCallback(() => {
    if (state.phase === "ready") dispatch({ type: "START" });
    else if (state.phase === "playing") dispatch({ type: "JUMP" });
    else if (state.phase === "paused") dispatch({ type: "RESUME" });
  }, [state.phase]);

  const handleRestart = useCallback(() => dispatch({ type: "RESET" }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClick]);

  return (
    <div
      className="w-screen h-screen bg-neutral-900 overflow-hidden relative flex items-center justify-center select-none"
      onClick={handleClick}
      onKeyUp={() => undefined}
    >
      <div
        className="relative overflow-hidden shadow-2xl"
        style={viewportStyle}
      >
        <div className="absolute inset-0" style={worldStyle}>
          <div className="absolute inset-0" style={skyStyle} />
          <div
            className="absolute left-0 right-0 bottom-0"
            style={groundStyle}
          />
          <div
            className="absolute transition-none"
            style={{
              left: `${constants.BIRD_LEFT}px`,
              bottom: `${state.birdBottom}px`,
              width: `${constants.BIRD_WIDTH}px`,
              height: `${constants.BIRD_HEIGHT}px`,
              backgroundImage: "url(/cloud.png)",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />
          {state.cakes.map((c) => (
            <div
              key={c.id}
              className="absolute"
              style={{
                left: `${c.left}px`,
                bottom: `${c.bottom}px`,
                width: `${constants.CAKE_WIDTH}px`,
                height: `${constants.CAKE_HEIGHT}px`,
                backgroundImage: "url(/cake.png)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}
          {state.phase === "ready" && (
            <div
              className="absolute left-0 right-0 flex justify-center"
              style={readyStyle}
            >
              <h1
                className="text-white font-bold text-4xl px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-sm shadow-xl animate-pulse"
                style={promptStyle}
              >
                点击屏幕开始游戏
              </h1>
            </div>
          )}
        </div>
        {hudVisible && (
          <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/50 text-white font-bold text-xl backdrop-blur-sm shadow-lg z-10">
            🎂 {state.score} / {constants.VICTORY_SCORE}
          </div>
        )}
      </div>
      {state.phase === "intro" && (
        <ConversationOverlay
          onComplete={() => dispatch({ type: "INTRO_DONE" })}
        />
      )}
      {state.phase === "gameover" && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-red-400 mb-6">
            游戏结束 😢
          </h2>
          <p className="text-white/80 text-xl mb-8">
            最终得分: {state.score} 🎂
          </p>
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
      {state.phase === "victory" && (
        <VictoryScreen score={state.score} onRestart={handleRestart} />
      )}
      <div className="hidden" aria-hidden>
        <Image src="/cloud.png" alt="" width={60} height={45} priority />
        <Image src="/cake.png" alt="" width={50} height={50} priority />
      </div>
    </div>
  );
}
