"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import * as constants from "../game/constants";
import { gameReducer, initialGameState } from "../game/gameReducer";
import {
  addToLeaderboard,
  isEndlessUnlocked,
  unlockEndless,
} from "../game/leaderboard";
import { createCake } from "../game/spawner";
import { useBGM } from "../hooks/useBGM";
import { useGameLoop } from "../hooks/useGameLoop";
import { usePersistedNumber } from "../hooks/usePersisted";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSoundEffects } from "../hooks/useSoundEffect";
import ConversationOverlay from "./ConversationOverlay";
import LeaderboardPanel from "./LeaderboardPanel";
import VictoryScreen from "./VictoryScreen";
import { BirdTrail } from "./effects/BirdTrail";
import ComboDisplay from "./effects/ComboDisplay";
import DifficultyMeter from "./effects/DifficultyMeter";
import MilestoneFlash from "./effects/MilestoneFlash";
import ParallaxBackground from "./effects/ParallaxBackground";
import { ParticleBurst, burst } from "./effects/ParticleBurst";
import ScorePop from "./effects/ScorePop";

const viewportStyle: React.CSSProperties = {
  width: `min(100vw, ${constants.WORLD_WIDTH / constants.WORLD_HEIGHT} * 100dvh)`,
  aspectRatio: `${constants.WORLD_WIDTH} / ${constants.WORLD_HEIGHT}`,
  maxHeight: "100dvh",
};
const worldStyle: React.CSSProperties = {
  width: `${constants.WORLD_WIDTH}px`,
  height: `${constants.WORLD_HEIGHT}px`,
  transformOrigin: "top left",
  transform: "scale(var(--game-scale, 1))",
};
// Ground and sky styles are now handled by ParallaxBackground canvas
const readyStyle = { top: "30%" };
const promptStyle = { textShadow: "2px 2px 6px rgba(0,0,0,0.6)" };

export default function GameShell() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const stateRef = useRef(state);
  const reducedMotion = useReducedMotion();
  const sfx = useSoundEffects();
  const sfxRef = useRef(sfx);
  useEffect(() => {
    sfxRef.current = sfx;
  });

  // 8-bit BGM — plays during "playing" phase, tempo syncs with difficulty
  useBGM({
    playing: state.phase === "playing",
    muted: sfx.muted,
    currentSpeed: state.currentSpeed,
  });

  // Endless mode & leaderboard state
  const [endlessUnlocked, setEndlessUnlocked] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const maxComboRef = useRef(0);

  // Check endless unlock status on mount
  useEffect(() => {
    setEndlessUnlocked(isEndlessUnlocked());
  }, []);

  // Track max combo during a run
  useEffect(() => {
    if (state.combo > maxComboRef.current) {
      maxComboRef.current = state.combo;
    }
  }, [state.combo]);

  // Reset max combo on new run
  useEffect(() => {
    if (state.phase === "playing" && state.score === 0) {
      maxComboRef.current = 0;
    }
  }, [state.phase, state.score]);

  const [best, setBest] = usePersistedNumber(
    constants.BEST_SCORE_STORAGE_KEY,
    0,
  );
  const isNewBestRef = useRef(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const hudVisible =
    state.phase === "playing" ||
    state.phase === "gameover" ||
    state.phase === "victory";

  const [pops, setPops] = useState<
    { id: number; x: number; y: number; points: number; isGolden: boolean }[]
  >([]);

  const particleContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hitstopUntilRef = useRef(0);
  const [inHitstop, setInHitstop] = useState(false);

  // Responsive scaling — compute scale factor on mount + resize
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(
        vw / constants.WORLD_WIDTH,
        vh / constants.WORLD_HEIGHT,
      );
      document.documentElement.style.setProperty("--game-scale", String(scale));
    };
    update();
    window.addEventListener("resize", update);
    // Also handle mobile viewport changes (address bar hide/show)
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (state.lastMissedAt !== null && viewportRef.current) {
      const el = viewportRef.current;
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
      const t = setTimeout(
        () => el.classList.remove("shake"),
        constants.SCREEN_SHAKE_MS + 100,
      );
      return () => clearTimeout(t);
    }
  }, [state.lastMissedAt, reducedMotion]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only trigger when lastEatenCake.id changes
  useEffect(() => {
    if (reducedMotion) return;
    const le = state.lastEatenCake;
    if (le) {
      burst(
        particleContainerRef.current,
        le.x + constants.CAKE_WIDTH / 2,
        le.y + constants.CAKE_HEIGHT / 2,
        le.kind === "golden" ? 10 : 6,
        le.kind === "golden"
          ? ["#ffd700", "#fff8dc", "#ffe873"]
          : ["#ffb6c1", "#ff69b4", "#ffffff"],
      );
    }
  }, [state.lastEatenCake?.id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only trigger when lastEatenCake.id changes
  useEffect(() => {
    const le = state.lastEatenCake;
    if (le) {
      setPops((p) =>
        [
          ...p,
          {
            id: le.id,
            x: le.x,
            y: le.y,
            points: le.points,
            isGolden: le.kind === "golden",
          },
        ].slice(-20),
      );
    }
  }, [state.lastEatenCake?.id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only trigger when lastEatenCake.id changes
  useEffect(() => {
    if (state.lastEatenCake) {
      if (reducedMotion) return;
      hitstopUntilRef.current = performance.now() + constants.HITSTOP_MS;
      setInHitstop(true);
      const t = setTimeout(() => setInHitstop(false), constants.HITSTOP_MS);
      return () => clearTimeout(t);
    }
  }, [state.lastEatenCake?.id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fire per eat
  useEffect(() => {
    if (state.lastEatenCake) sfx.eat(state.lastEatenCake.kind, state.combo);
  }, [state.lastEatenCake?.id]);

  useEffect(() => {
    if (state.phase === "gameover") sfx.gameover();
    else if (state.phase === "victory") sfx.victory();
  }, [state.phase, sfx.gameover, sfx.victory]);

  useGameLoop(
    (dt) => dispatch({ type: "TICK", dt }),
    state.phase === "playing" || state.phase === "paused",
    state.phase === "paused" || inHitstop,
  );

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (state.phase !== "playing") return;
    const id = setInterval(() => {
      if (performance.now() < hitstopUntilRef.current) return;
      dispatch({ type: "SPAWN_CAKE", cake: createCake({ allowGolden: true }) });
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
        sfx: {
          get jump() {
            return sfxRef.current.jump;
          },
          get eat() {
            return sfxRef.current.eat;
          },
          get gameover() {
            return sfxRef.current.gameover;
          },
          get victory() {
            return sfxRef.current.victory;
          },
          get setMuted() {
            return sfxRef.current.setMuted;
          },
          get muted() {
            return sfxRef.current.muted;
          },
          get playCount() {
            return sfxRef.current.playCount;
          },
        },
      };
      return () => {
        window.__gameDebug = undefined;
      };
    }
  }, []);

  const handleClick = useCallback(() => {
    if (state.phase === "ready") dispatch({ type: "START", mode: state.mode });
    else if (state.phase === "playing") {
      sfx.jump();
      dispatch({ type: "JUMP" });
    } else if (state.phase === "paused") dispatch({ type: "RESUME" });
  }, [state.phase, state.mode, sfx]);

  const handleRestart = useCallback(() => dispatch({ type: "RESET" }), []);

  const handleStartEndless = useCallback(() => {
    dispatch({ type: "RESET" });
    // After reset puts us in "ready", immediately start in endless mode
    setTimeout(() => dispatch({ type: "START", mode: "endless" }), 0);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: evaluate once per terminal phase transition using pre-write best
  useEffect(() => {
    if (state.phase === "gameover" || state.phase === "victory") {
      isNewBestRef.current = state.score > best && state.score > 0;
      if (isNewBestRef.current) setBest(state.score);

      // Record to leaderboard
      addToLeaderboard({
        score: state.score,
        mode: state.mode,
        date: new Date().toISOString(),
        cakesEaten: state.cakesEaten,
        maxCombo: maxComboRef.current,
      });

      // Unlock endless on first victory
      if (state.phase === "victory" && !endlessUnlocked) {
        unlockEndless();
        setEndlessUnlocked(true);
      }
    } else {
      isNewBestRef.current = false;
    }
    setIsNewBest(isNewBestRef.current);
  }, [state.phase]);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (state.phase === "playing") dispatch({ type: "PAUSE" });
        else if (state.phase === "paused") dispatch({ type: "RESUME" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase]);

  return (
    <div
      className="w-screen bg-neutral-900 overflow-hidden relative flex items-center justify-center select-none"
      style={{ height: "100dvh" }}
      onClick={handleClick}
      onKeyUp={() => undefined}
    >
      <div
        ref={viewportRef}
        className="relative overflow-hidden shadow-2xl"
        style={viewportStyle}
      >
        <div className="absolute inset-0" style={worldStyle}>
          {/* Layer 1: Background canvas (bottom) */}
          <ParallaxBackground
            scrolling={state.phase === "playing"}
            speedFactor={state.currentSpeed / constants.CAKE_SPEED_BASE}
            score={state.score}
            reducedMotion={reducedMotion}
          />
        </div>
        {/* Layer 2: Game objects (on top of canvas, separate stacking context) */}
        <div
          className="absolute inset-0"
          style={{ ...worldStyle, isolation: "isolate" }}
        >
          {/* Bird trail effect */}
          <BirdTrail
            birdBottom={state.birdBottom}
            reducedMotion={reducedMotion}
          />
          {/* Bird character with velocity-based tilt */}
          <div
            className={`absolute transition-none${state.combo >= 2 ? " combo-active" : ""}`}
            style={{
              left: `${constants.BIRD_LEFT}px`,
              bottom: `${state.birdBottom}px`,
              width: `${constants.BIRD_WIDTH}px`,
              height: `${constants.BIRD_HEIGHT}px`,
              backgroundImage: "url(/cloud.png)",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              transform: reducedMotion
                ? undefined
                : `rotate(${Math.max(-25, Math.min(25, -state.birdVy * 0.04))}deg)`,
              transformOrigin: "center center",
            }}
          />
          {state.cakes.map((c) => (
            <div
              key={c.id}
              className={`absolute${c.kind === "golden" ? " golden-cake" : ""}`}
              style={{
                left: `${c.left}px`,
                bottom: `${c.bottom}px`,
                width: `${constants.CAKE_WIDTH}px`,
                height: `${constants.CAKE_HEIGHT}px`,
                backgroundImage: "url(/cake.png)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                filter:
                  c.kind === "golden"
                    ? "hue-rotate(45deg) saturate(2) brightness(1.1) drop-shadow(0 0 6px gold)"
                    : undefined,
              }}
            />
          ))}
          <ScorePop
            pops={pops}
            onDone={(id) => setPops((p) => p.filter((x) => x.id !== id))}
            reducedMotion={reducedMotion}
          />
          <ParticleBurst containerRef={particleContainerRef} />
          {/* Combo display */}
          <ComboDisplay combo={state.combo} reducedMotion={reducedMotion} />
          {state.phase === "ready" && (
            <div
              className="absolute left-0 right-0 flex flex-col items-center gap-3"
              style={readyStyle}
            >
              <h1
                className="text-white font-bold text-4xl px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-sm shadow-xl animate-pulse"
                style={promptStyle}
              >
                点击屏幕开始游戏
              </h1>
              {state.mode === "endless" && (
                <span className="text-purple-300 text-lg font-bold bg-black/40 px-4 py-1 rounded-full">
                  ♾️ 无尽模式
                </span>
              )}
              {endlessUnlocked && state.mode === "normal" && (
                <button
                  type="button"
                  className="text-purple-300/80 text-sm bg-black/30 px-4 py-1 rounded-full hover:bg-black/50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "START", mode: "endless" });
                  }}
                >
                  或切换 ♾️ 无尽模式
                </button>
              )}
            </div>
          )}
        </div>
        <MilestoneFlash
          cakesEaten={state.cakesEaten}
          reducedMotion={reducedMotion}
        />
        {hudVisible && (
          <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/50 text-white font-bold text-xl backdrop-blur-sm shadow-lg z-10">
            {state.mode === "endless" ? "♾️" : "🎂"}{" "}
            <motion.span
              key={state.score}
              className="inline-block"
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
            >
              {state.score}
            </motion.span>
            {state.mode === "normal" && (
              <span> / {constants.VICTORY_SCORE}</span>
            )}
          </div>
        )}
        <button
          type="button"
          className="absolute top-4 right-16 z-10 px-3 py-2 rounded-full bg-black/40 text-white"
          onClick={(e) => {
            e.stopPropagation();
            sfx.setMuted(!sfx.muted);
          }}
        >
          {sfx.muted ? "🔇" : "🔊"}
        </button>
        {(state.phase === "playing" || state.phase === "paused") && (
          <button
            type="button"
            className="absolute top-4 right-28 z-10 px-3 py-2 rounded-full bg-black/40 text-white"
            onClick={(e) => {
              e.stopPropagation();
              if (state.phase === "playing") dispatch({ type: "PAUSE" });
              else if (state.phase === "paused") dispatch({ type: "RESUME" });
            }}
          >
            {state.phase === "paused" ? "▶" : "⏸"}
          </button>
        )}
        {state.phase === "paused" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
            <h2 className="text-white text-5xl mb-4">已暂停</h2>
            <p className="text-white/80">按 P 或点击 ⏸ 继续</p>
          </div>
        )}
        {reducedMotion && (
          <div className="absolute bottom-4 left-4 z-10 px-2 py-1 text-xs rounded bg-white/20 text-white">
            极简动效已启用
          </div>
        )}
        {/* Difficulty/speed meter */}
        {hudVisible && (
          <DifficultyMeter
            currentSpeed={state.currentSpeed}
            mode={state.mode}
            reducedMotion={reducedMotion}
          />
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
          <h2 className="text-4xl md:text-6xl font-bold text-red-400 mb-4">
            游戏结束 😢
          </h2>
          {state.mode === "endless" && (
            <span className="text-purple-300/80 text-sm mb-2">♾️ 无尽模式</span>
          )}
          <p className="text-white/80 text-xl mb-6">
            最终得分: {state.score} 🎂
          </p>
          <p className="text-white/80 text-lg mb-6">
            最佳: {best} 🎂{" "}
            {isNewBest && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                · 🏆 NEW BEST!
              </motion.span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <motion.button
              onClick={handleRestart}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xl font-bold rounded-full shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              再试一次 🎮
            </motion.button>
            {endlessUnlocked && state.mode !== "endless" && (
              <motion.button
                onClick={handleStartEndless}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-lg font-bold rounded-full shadow-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                无尽模式 ♾️
              </motion.button>
            )}
          </div>
          <motion.button
            onClick={() => setShowLeaderboard(true)}
            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 font-medium transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🏆 排行榜
          </motion.button>
        </motion.div>
      )}
      {state.phase === "victory" && (
        <VictoryScreen
          score={state.score}
          best={best}
          isNewBest={isNewBest}
          onRestart={handleRestart}
          endlessUnlocked={endlessUnlocked}
          onStartEndless={handleStartEndless}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}
      {/* Leaderboard overlay */}
      <AnimatePresence>
        {showLeaderboard && (
          <LeaderboardPanel
            currentScore={state.score}
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </AnimatePresence>
      <div className="hidden" aria-hidden>
        <Image src="/cloud.png" alt="" width={60} height={45} priority />
        <Image src="/cake.png" alt="" width={50} height={50} priority />
      </div>
    </div>
  );
}
