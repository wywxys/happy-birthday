"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import ConversationOverlay from "./ConversationOverlay";
import VictoryScreen from "./VictoryScreen";

// Game world dimensions (original game logic units — we scale via viewport)
const WORLD_WIDTH = 500;
const WORLD_HEIGHT = 700;

const BIRD_WIDTH = 60;
const BIRD_HEIGHT = 45;
const BIRD_LEFT = 80;
const BIRD_START_BOTTOM = 440;
const BIRD_MIN_BOTTOM = 100; // ground line
const BIRD_MAX_BOTTOM = 580;
const GRAVITY = 4;
const JUMP_AMOUNT = 80;
const TICK_MS = 20;

const CAKE_WIDTH = 50;
const CAKE_HEIGHT = 50;
const CAKE_START_LEFT = WORLD_WIDTH - CAKE_WIDTH; // spawn at right edge
const CAKE_SPEED = 3;
const CAKE_SPAWN_MS = 1400;
const VICTORY_SCORE = 20;

interface Cake {
  id: number;
  left: number;
  bottom: number;
  eaten: boolean;
}

type GameState = "intro" | "ready" | "playing" | "gameover" | "victory";

export default function GameShell() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [birdBottom, setBirdBottom] = useState(BIRD_START_BOTTOM);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [score, setScore] = useState(0);

  // Refs mirror state for use inside intervals (avoid stale closures)
  const birdBottomRef = useRef(BIRD_START_BOTTOM);
  const cakesRef = useRef<Cake[]>([]);
  const scoreRef = useRef(0);
  const stateRef = useRef<GameState>("intro");
  const nextCakeIdRef = useRef(0);

  const gravityIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const cakeMoveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const cakeSpawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const setBird = useCallback((v: number) => {
    birdBottomRef.current = v;
    setBirdBottom(v);
  }, []);
  const setState = useCallback((s: GameState) => {
    stateRef.current = s;
    setGameState(s);
  }, []);
  const setCakesSync = useCallback((updater: (prev: Cake[]) => Cake[]) => {
    cakesRef.current = updater(cakesRef.current);
    setCakes(cakesRef.current);
  }, []);
  const setScoreSync = useCallback((v: number) => {
    scoreRef.current = v;
    setScore(v);
  }, []);

  const clearAllIntervals = useCallback(() => {
    if (gravityIntervalRef.current) {
      clearInterval(gravityIntervalRef.current);
      gravityIntervalRef.current = null;
    }
    if (cakeMoveIntervalRef.current) {
      clearInterval(cakeMoveIntervalRef.current);
      cakeMoveIntervalRef.current = null;
    }
    if (cakeSpawnIntervalRef.current) {
      clearInterval(cakeSpawnIntervalRef.current);
      cakeSpawnIntervalRef.current = null;
    }
  }, []);

  const gameOver = useCallback(() => {
    if (stateRef.current !== "playing") return;
    setState("gameover");
    clearAllIntervals();
  }, [clearAllIntervals, setState]);

  const victory = useCallback(() => {
    if (stateRef.current !== "playing") return;
    setState("victory");
    clearAllIntervals();
  }, [clearAllIntervals, setState]);

  const startGame = useCallback(() => {
    // Reset world
    setBird(BIRD_START_BOTTOM);
    setCakesSync(() => []);
    setScoreSync(0);
    nextCakeIdRef.current = 0;
    setState("playing");

    clearAllIntervals();

    // Gravity tick
    gravityIntervalRef.current = setInterval(() => {
      if (stateRef.current !== "playing") return;
      let next = birdBottomRef.current - GRAVITY;
      if (next < BIRD_MIN_BOTTOM) {
        // Hit the ground = game over
        next = BIRD_MIN_BOTTOM;
        setBird(next);
        gameOver();
        return;
      }
      setBird(next);
    }, TICK_MS);

    // Cake move tick + collision + eat
    cakeMoveIntervalRef.current = setInterval(() => {
      if (stateRef.current !== "playing") return;
      const birdB = birdBottomRef.current;
      let scored = false;
      const next: Cake[] = [];
      for (const c of cakesRef.current) {
        if (c.eaten) continue;
        const nl = c.left - CAKE_SPEED;
        // Off-screen left = missed = game over (original: "漏掉就游戏结束")
        if (nl + CAKE_WIDTH < 0) {
          gameOver();
          return;
        }
        // Collision detection (AABB)
        // Bird box: left=BIRD_LEFT, right=BIRD_LEFT+BIRD_WIDTH, bottom=birdB, top=birdB+BIRD_HEIGHT
        // Cake box: left=nl, right=nl+CAKE_WIDTH, bottom=c.bottom, top=c.bottom+CAKE_HEIGHT
        const birdRight = BIRD_LEFT + BIRD_WIDTH;
        const birdTop = birdB + BIRD_HEIGHT;
        const cakeRight = nl + CAKE_WIDTH;
        const cakeTop = c.bottom + CAKE_HEIGHT;
        const overlaps =
          BIRD_LEFT < cakeRight &&
          birdRight > nl &&
          birdB < cakeTop &&
          birdTop > c.bottom;

        if (overlaps) {
          scored = true;
          // Eaten — drop this cake
          continue;
        }
        next.push({ ...c, left: nl });
      }
      cakesRef.current = next;
      setCakes(next);

      if (scored) {
        const newScore = scoreRef.current + 1;
        setScoreSync(newScore);
        if (newScore >= VICTORY_SCORE) {
          victory();
        }
      }
    }, TICK_MS);

    // Cake spawner
    cakeSpawnIntervalRef.current = setInterval(() => {
      if (stateRef.current !== "playing") return;
      // Random cake bottom between 140 and 550 (mirrors original 140 + random*410)
      const b = 140 + Math.random() * 410;
      const id = nextCakeIdRef.current++;
      cakesRef.current = [
        ...cakesRef.current,
        { id, left: CAKE_START_LEFT, bottom: b, eaten: false },
      ];
      setCakes(cakesRef.current);
    }, CAKE_SPAWN_MS);
  }, [
    clearAllIntervals,
    gameOver,
    setBird,
    setCakesSync,
    setScoreSync,
    setState,
    victory,
  ]);

  const jump = useCallback(() => {
    if (stateRef.current !== "playing") return;
    const next = Math.min(birdBottomRef.current + JUMP_AMOUNT, BIRD_MAX_BOTTOM);
    setBird(next);
  }, [setBird]);

  const handleClick = useCallback(() => {
    const s = stateRef.current;
    if (s === "intro") return; // conversation overlay handles clicks
    if (s === "ready") {
      startGame();
      return;
    }
    if (s === "playing") {
      jump();
      return;
    }
    // gameover / victory — restart handled by button
  }, [jump, startGame]);

  const handleRestart = useCallback(() => {
    setState("ready");
    setBird(BIRD_START_BOTTOM);
    setCakesSync(() => []);
    setScoreSync(0);
  }, [setBird, setCakesSync, setScoreSync, setState]);

  const handleIntroComplete = useCallback(() => {
    setState("ready");
  }, [setState]);

  // Keyboard: Space / Enter also acts as click
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, [clearAllIntervals]);

  return (
    <div
      className="w-screen h-screen bg-neutral-900 overflow-hidden relative flex items-center justify-center select-none"
      onClick={handleClick}
    >
      {/* Game viewport — fixed aspect ratio, centered */}
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{
          width: `min(100vw, ${WORLD_WIDTH / WORLD_HEIGHT} * 100vh)`,
          aspectRatio: `${WORLD_WIDTH} / ${WORLD_HEIGHT}`,
          maxHeight: "100vh",
        }}
      >
        {/* Inner absolute-positioned world using px coords, scaled via CSS transform */}
        <div
          className="absolute inset-0"
          style={{
            width: `${WORLD_WIDTH}px`,
            height: `${WORLD_HEIGHT}px`,
            transformOrigin: "top left",
            // Scale so world fills the viewport container
            transform: `scale(min(calc(100vw / ${WORLD_WIDTH}), calc(100vh / ${WORLD_HEIGHT})))`,
          }}
        >
          {/* Sky */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(rgb(70, 178, 192), rgb(60, 95, 160))",
            }}
          />

          {/* Ground */}
          <div
            className="absolute left-0 right-0 bottom-0"
            style={{
              height: "15%",
              background:
                "linear-gradient(rgb(131, 85, 17), rgb(105, 60, 22))",
            }}
          />

          {/* Bird */}
          <div
            className="absolute transition-none"
            style={{
              left: `${BIRD_LEFT}px`,
              bottom: `${birdBottom}px`,
              width: `${BIRD_WIDTH}px`,
              height: `${BIRD_HEIGHT}px`,
              backgroundImage: "url(/cloud.png)",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Cakes */}
          {cakes.map((c) => (
            <div
              key={c.id}
              className="absolute"
              style={{
                left: `${c.left}px`,
                bottom: `${c.bottom}px`,
                width: `${CAKE_WIDTH}px`,
                height: `${CAKE_HEIGHT}px`,
                backgroundImage: "url(/cake.png)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}

          {/* Ready prompt */}
          {gameState === "ready" && (
            <div
              className="absolute left-0 right-0 flex justify-center"
              style={{ top: "30%" }}
            >
              <h1
                className="text-white font-bold text-4xl px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-sm shadow-xl animate-pulse"
                style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}
              >
                点击屏幕开始游戏
              </h1>
            </div>
          )}
        </div>

        {/* Score HUD — outside scaled world, in screen space */}
        {(gameState === "playing" ||
          gameState === "gameover" ||
          gameState === "victory") && (
          <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/50 text-white font-bold text-xl backdrop-blur-sm shadow-lg z-10">
            🎂 {score} / {VICTORY_SCORE}
          </div>
        )}
      </div>

      {/* Intro conversation */}
      {gameState === "intro" && (
        <ConversationOverlay onComplete={handleIntroComplete} />
      )}

      {/* Game over */}
      {gameState === "gameover" && (
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

      {/* Victory */}
      {gameState === "victory" && (
        <VictoryScreen score={score} onRestart={handleRestart} />
      )}

      {/* Hidden preload so browser caches the images before first render */}
      <div className="hidden" aria-hidden>
        <Image src="/cloud.png" alt="" width={60} height={45} priority />
        <Image src="/cake.png" alt="" width={50} height={50} priority />
      </div>
    </div>
  );
}
