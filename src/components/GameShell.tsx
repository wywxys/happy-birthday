"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import * as constants from "../game/constants";
import {
  birdScaleFor,
  gameReducer,
  hasVictoryCondition,
  initialGameState,
  isLenientMode,
} from "../game/gameReducer";
import {
  addToLeaderboard,
  isModesUnlocked,
  unlockModes,
} from "../game/leaderboard";
import { MODE_META, modeShortLabel } from "../game/modeMeta";
import { createCake } from "../game/spawner";
import type { GameMode } from "../game/types";
import { useBGM } from "../hooks/useBGM";
import { useGameLoop } from "../hooks/useGameLoop";
import { usePersistedNumber } from "../hooks/usePersisted";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSoundEffects } from "../hooks/useSoundEffect";
import ConversationOverlay from "./ConversationOverlay";
import LeaderboardPanel from "./LeaderboardPanel";
import ModePicker from "./ModePicker";
import VictoryScreen from "./VictoryScreen";
import ComboDisplay from "./effects/ComboDisplay";
import DifficultyMeter from "./effects/DifficultyMeter";
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
const readyStyle: React.CSSProperties = { top: "22%" };
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

  // Mode unlock (Normal + Hard) & leaderboard state
  const [modesUnlocked, setModesUnlocked] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const maxComboRef = useRef(0);

  // Check unlock status on mount + restore preferred mode (if any)
  useEffect(() => {
    setModesUnlocked(isModesUnlocked());
    try {
      const saved = localStorage.getItem("happy-birthday-preferred-mode");
      if (
        saved === "easy" ||
        (saved === "normal" && isModesUnlocked()) ||
        (saved === "hard" && isModesUnlocked())
      ) {
        dispatch({ type: "SET_MODE", mode: saved });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist mode preference whenever it changes on the ready screen
  useEffect(() => {
    if (state.phase === "ready") {
      try {
        localStorage.setItem("happy-birthday-preferred-mode", state.mode);
      } catch {
        /* ignore */
      }
    }
  }, [state.mode, state.phase]);

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
      const colors =
        le.kind === "golden"
          ? ["#ffd700", "#fff8dc", "#ffe873"]
          : le.kind === "heart"
            ? ["#ff5c8a", "#ff8fa8", "#ffffff"]
            : ["#ffb6c1", "#ff69b4", "#ffffff"];
      burst(
        particleContainerRef.current,
        le.x + constants.CAKE_WIDTH / 2,
        le.y + constants.CAKE_HEIGHT / 2,
        le.kind === "golden" ? 10 : 6,
        colors,
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
      // Read latest state via ref so we don't restart the interval on every
      // livesLeft change. Heart cakes only spawn in lenient modes AND when
      // the player is missing at least one life — no point dropping heals
      // at max HP.
      const cur = stateRef.current;
      dispatch({
        type: "SPAWN_CAKE",
        cake: createCake({
          allowGolden: true,
          allowHeart:
            isLenientMode(cur.mode) && cur.livesLeft < constants.EASY_MAX_LIVES,
        }),
      });
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

  const handleRestart = useCallback(() => {
    setJustUnlocked(false);
    dispatch({ type: "RESET" });
  }, []);

  const handleStartMode = useCallback((mode: GameMode) => {
    setJustUnlocked(false);
    dispatch({ type: "RESET" });
    // After reset puts us in "ready", start with the chosen mode
    setTimeout(() => dispatch({ type: "START", mode }), 0);
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

      // Any victory unlocks the other modes (persisted)
      if (state.phase === "victory" && !modesUnlocked) {
        unlockModes();
        setModesUnlocked(true);
        setJustUnlocked(true);
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

  // Auto-pause when the user leaves the game (tab switch, minimize, phone
  // home button, screen lock, or clicking to a different app on desktop).
  // We never auto-resume — the user must click / press to acknowledge.
  useEffect(() => {
    const pauseIfPlaying = () => {
      if (stateRef.current.phase === "playing") {
        dispatch({ type: "PAUSE" });
      }
    };
    const onVisibility = () => {
      if (document.hidden) pauseIfPlaying();
    };
    // window `blur` catches the case where the browser stays visible but the
    // user clicked into another app (desktop). Combined with visibilitychange
    // this covers mobile home button, alt-tab, minimize, screen lock, etc.
    const onBlur = () => pauseIfPlaying();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Derived visual state
  const birdScale = birdScaleFor(state);
  const isLenient = isLenientMode(state.mode);
  const hasCrown = isLenient && state.birdSize >= constants.EASY_MAX_SIZE;
  const modeIcon = MODE_META[state.mode].icon;
  // Only Easy shows an explicit victory target ("X / 25"); Normal & Hard are endless
  const showVictoryTarget = hasVictoryCondition(state.mode);

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
          {/* Layer 1: Background canvas */}
          <ParallaxBackground
            scrolling={state.phase === "playing"}
            speedFactor={state.currentSpeed / constants.CAKE_SPEED_BASE}
            score={state.score}
            reducedMotion={reducedMotion}
          />
        </div>
        {/* Layer 2: Game objects (isolated stacking context) */}
        <div
          className="absolute inset-0"
          style={{ ...worldStyle, isolation: "isolate" }}
        >
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
                ? `scale(${birdScale})`
                : `scale(${birdScale}) rotate(${Math.max(-25, Math.min(25, -state.birdVy * 0.04))}deg)`,
              transformOrigin: "center center",
            }}
          />
          {/* Crown overlay (easy-mode max size) */}
          {hasCrown && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${constants.BIRD_LEFT + constants.BIRD_WIDTH / 2 - 18}px`,
                bottom: `${state.birdBottom + (constants.BIRD_HEIGHT * birdScale) / 2 + constants.BIRD_HEIGHT / 2 - 4}px`,
                fontSize: "32px",
                lineHeight: 1,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
              }}
            >
              👑
            </div>
          )}
          {state.cakes.map((c) => (
            // Positioning wrapper — keeps the heart emoji OUT of the cake's
            // CSS filter (which would otherwise tint the emoji too).
            <div
              key={c.id}
              className="absolute pointer-events-none"
              style={{
                left: `${c.left}px`,
                bottom: `${c.bottom}px`,
                width: `${constants.CAKE_WIDTH}px`,
                height: `${constants.CAKE_HEIGHT}px`,
              }}
            >
              <div
                className={`absolute inset-0${c.kind === "golden" ? " golden-cake" : ""}`}
                style={{
                  backgroundImage: "url(/cake.png)",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  filter:
                    c.kind === "golden"
                      ? "hue-rotate(45deg) saturate(2) brightness(1.1) drop-shadow(0 0 6px gold)"
                      : c.kind === "heart"
                        ? "hue-rotate(-30deg) saturate(1.5) drop-shadow(0 0 6px #ff5c8a)"
                        : undefined,
                }}
              />
              {c.kind === "heart" && (
                <div className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow-md">
                  ❤️
                </div>
              )}
            </div>
          ))}
          <ScorePop
            pops={pops}
            onDone={(id) => setPops((p) => p.filter((x) => x.id !== id))}
            reducedMotion={reducedMotion}
          />
          <ParticleBurst containerRef={particleContainerRef} />
          <ComboDisplay combo={state.combo} reducedMotion={reducedMotion} />
          {state.phase === "ready" && (
            <div
              className="absolute left-0 right-0 flex flex-col items-center gap-4 px-4"
              style={readyStyle}
            >
              <h1
                className="text-white font-bold text-3xl md:text-4xl px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-sm shadow-xl animate-pulse"
                style={promptStyle}
              >
                点击屏幕开始
              </h1>
              <ModePicker
                currentMode={state.mode}
                modesUnlocked={modesUnlocked}
                onSelect={(m) => dispatch({ type: "SET_MODE", mode: m })}
              />
            </div>
          )}
        </div>
        {hudVisible && (
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="px-4 py-2 rounded-full bg-black/50 text-white font-bold text-xl backdrop-blur-sm shadow-lg">
              {modeIcon}{" "}
              <motion.span
                key={state.cakesEaten}
                className="inline-block"
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.25 }}
              >
                {state.cakesEaten}
              </motion.span>
              {showVictoryTarget && <span> / {constants.VICTORY_CAKES}</span>}
              <span className="text-white/60 text-sm ml-2">
                · {state.score} 分
              </span>
            </div>
            {/* Life meter — shown in lenient modes (Easy & Normal) */}
            {isLenient && state.phase === "playing" && (
              <div className="px-3 py-1 rounded-full bg-black/50 text-white text-lg backdrop-blur-sm shadow-lg flex items-center gap-1">
                {Array.from({ length: constants.EASY_MAX_LIVES }).map(
                  (_, i) => (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed set of life slots
                      key={i}
                      className={
                        i < state.livesLeft ? "" : "grayscale opacity-30"
                      }
                    >
                      ❤️
                    </span>
                  ),
                )}
              </div>
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-red-400 mb-3">
            游戏结束 😢
          </h2>
          <div className="text-white/70 text-sm mb-2">
            {modeShortLabel(state.mode)}
          </div>
          <p className="text-white/80 text-xl mb-1">
            吃到 {state.cakesEaten} 🎂 · {state.score} 分
          </p>
          <p className="text-white/80 text-lg mb-6">
            最佳: {best} 分{" "}
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
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center justify-center max-w-lg">
            <motion.button
              onClick={handleRestart}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white text-lg font-bold rounded-full shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              再试一次 🎮
            </motion.button>
            {(["easy", "normal", "hard"] as const)
              .filter((id) => {
                if (id === state.mode) return false;
                if (id === "easy") return true;
                return modesUnlocked;
              })
              .map((id) => {
                const m = MODE_META[id];
                return (
                  <motion.button
                    key={id}
                    onClick={() => handleStartMode(id)}
                    className={`px-5 py-3 bg-gradient-to-r ${m.gradient} text-white font-bold rounded-full shadow-lg cursor-pointer`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {m.label} {m.icon}
                  </motion.button>
                );
              })}
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
          mode={state.mode}
          onRestart={handleRestart}
          modesUnlocked={modesUnlocked}
          justUnlocked={justUnlocked}
          onStartMode={handleStartMode}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}
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
