import {
  BIRD_HEIGHT,
  BIRD_LEFT,
  BIRD_MIN_BOTTOM,
  BIRD_START_BOTTOM,
  BIRD_WIDTH,
  CAKE_HEIGHT,
  CAKE_SPAWN_MS_BASE,
  CAKE_SPEED_BASE,
  CAKE_WIDTH,
  COMBO_BONUS_FACTOR,
  COMBO_WINDOW_MS,
  EASY_BOUNCE_VY,
  EASY_MAX_LIVES,
  EASY_MAX_SIZE,
  EASY_MAX_SIZE_SCALE,
  EASY_SPAWN_FLOOR_MS,
  EASY_SPEED_CAP_FACTOR,
  HARD_SPAWN_FLOOR_MS,
  HARD_SPEED_CAP_FACTOR,
  NORMAL_SPAWN_FLOOR_MS,
  NORMAL_SPEED_CAP_FACTOR,
  SPAWN_RAMP_FACTOR,
  SPEED_RAMP_FACTOR,
  SPEED_RAMP_INTERVAL,
  VICTORY_CAKES,
} from "./constants";
import {
  applyGravity,
  applyJump,
  boxesOverlap,
  cakeOffscreen,
  moveCake,
} from "./physics";
import { cakePoints } from "./spawner";
import type { Cake, GameAction, GameMode, GameState } from "./types";

// ─── Mode Predicates ─────────────────────────────────────────────────────────

/**
 * Easy and Normal share the "lenient" mechanic set:
 *   • bird grows per cake (visual + hitbox)
 *   • floor collision consumes a bounce credit instead of instant gameover
 *   • missing a cake resets size but is not fatal
 *   • heart cakes can spawn to refill bounces
 * Only Hard opts out of all of these.
 */
export function isLenientMode(mode: GameMode): boolean {
  return mode !== "hard";
}

/** Only Easy has a victory (25 cakes); Normal & Hard are endless. */
export function hasVictoryCondition(mode: GameMode): boolean {
  return mode === "easy";
}

// ─── Mode-Specific Difficulty Caps ───────────────────────────────────────────
function speedCapFor(mode: GameMode): number {
  if (mode === "easy") return CAKE_SPEED_BASE * EASY_SPEED_CAP_FACTOR;
  if (mode === "hard") return CAKE_SPEED_BASE * HARD_SPEED_CAP_FACTOR;
  return CAKE_SPEED_BASE * NORMAL_SPEED_CAP_FACTOR;
}

function spawnFloorFor(mode: GameMode): number {
  if (mode === "easy") return EASY_SPAWN_FLOOR_MS;
  if (mode === "hard") return HARD_SPAWN_FLOOR_MS;
  return NORMAL_SPAWN_FLOOR_MS;
}

/**
 * Effective bird visual scale from state.birdSize (1..EASY_MAX_SIZE).
 * Applies to both Easy and Normal (lenient modes). Hard stays at 1x.
 * Clamps input defensively — pure and stable even on unexpected state.
 */
export function birdScaleFor(state: {
  mode: GameMode;
  birdSize: number;
}): number {
  if (!isLenientMode(state.mode)) return 1;
  const clamped = Math.max(1, Math.min(EASY_MAX_SIZE, state.birdSize));
  const t = (clamped - 1) / (EASY_MAX_SIZE - 1); // 0..1
  return 1 + t * (EASY_MAX_SIZE_SCALE - 1);
}

// ─── Initial / Fresh States ──────────────────────────────────────────────────
export const initialGameState: GameState = {
  phase: "intro",
  mode: "easy",
  birdBottom: BIRD_START_BOTTOM,
  birdVy: 0,
  cakes: [],
  score: 0,
  cakesEaten: 0,
  nextCakeId: 0,
  currentSpeed: CAKE_SPEED_BASE,
  currentSpawnMs: CAKE_SPAWN_MS_BASE,
  runStartTs: 0,
  lastEatenCake: null,
  lastMissedAt: null,
  combo: 0,
  lastEatTime: 0,
  birdSize: 1,
  livesLeft: EASY_MAX_LIVES,
};

function freshRunState(
  phase: "ready" | "playing",
  mode: GameMode = "easy",
): GameState {
  return {
    phase,
    mode,
    birdBottom: BIRD_START_BOTTOM,
    birdVy: 0,
    cakes: [],
    score: 0,
    cakesEaten: 0,
    nextCakeId: 0,
    currentSpeed: CAKE_SPEED_BASE,
    currentSpawnMs: CAKE_SPAWN_MS_BASE,
    runStartTs: phase === "playing" ? performance.now() : 0,
    lastEatenCake: null,
    lastMissedAt: null,
    combo: 0,
    lastEatTime: 0,
    birdSize: 1,
    livesLeft: EASY_MAX_LIVES,
  };
}

// ─── Eat Resolution ──────────────────────────────────────────────────────────
function resolveCakeEaten(
  state: GameState,
  hit: Cake,
  sourceCakes: readonly Cake[],
): GameState {
  const now = performance.now();
  const timeSinceLastEat = now - state.lastEatTime;
  const newCombo = timeSinceLastEat < COMBO_WINDOW_MS ? state.combo + 1 : 1;

  const basePoints = cakePoints(hit.kind);
  const comboMultiplier = newCombo >= 2 ? 1 + newCombo * COMBO_BONUS_FACTOR : 1;
  const points = Math.round(basePoints * comboMultiplier);

  const newScore = state.score + points;
  const newCakesEaten = state.cakesEaten + 1;

  let currentSpeed = state.currentSpeed;
  let currentSpawnMs = state.currentSpawnMs;

  if (newCakesEaten % SPEED_RAMP_INTERVAL === 0) {
    currentSpeed = Math.min(
      state.currentSpeed * SPEED_RAMP_FACTOR,
      speedCapFor(state.mode),
    );
    currentSpawnMs = Math.max(
      state.currentSpawnMs * SPAWN_RAMP_FACTOR,
      spawnFloorFor(state.mode),
    );
  }

  // Lenient-mode side-effects (Easy & Normal):
  //   - heart cake: restore one life (capped at EASY_MAX_LIVES)
  //   - regular/golden cake: grow one size step (capped at EASY_MAX_SIZE)
  let birdSize = state.birdSize;
  let livesLeft = state.livesLeft;
  if (isLenientMode(state.mode)) {
    if (hit.kind === "heart") {
      livesLeft = Math.min(EASY_MAX_LIVES, livesLeft + 1);
    } else {
      birdSize = Math.min(EASY_MAX_SIZE, birdSize + 1);
    }
  }

  // Only Easy has a victory (25 cakes). Normal & Hard are endless.
  const reachedVictory =
    hasVictoryCondition(state.mode) && newCakesEaten >= VICTORY_CAKES;

  return {
    ...state,
    cakes: sourceCakes.filter((cake) => cake.id !== hit.id),
    score: newScore,
    cakesEaten: newCakesEaten,
    currentSpeed,
    currentSpawnMs,
    combo: newCombo,
    lastEatTime: now,
    birdSize,
    livesLeft,
    lastEatenCake: {
      x: hit.left,
      y: hit.bottom,
      kind: hit.kind,
      points,
      id: hit.id,
    },
    phase: reachedVictory ? "victory" : "playing",
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INTRO_DONE":
      return state.phase === "intro" ? { ...state, phase: "ready" } : state;

    case "SET_MODE":
      // Allow mode changes only from the ready screen
      return state.phase === "ready" ? { ...state, mode: action.mode } : state;

    case "START":
      return state.phase === "ready"
        ? freshRunState("playing", action.mode ?? state.mode)
        : state;

    case "JUMP":
      return state.phase === "playing"
        ? { ...state, birdVy: applyJump() }
        : state;

    case "SPAWN_CAKE":
      return state.phase === "playing"
        ? {
            ...state,
            cakes: [...state.cakes, { ...action.cake, id: state.nextCakeId }],
            nextCakeId: state.nextCakeId + 1,
          }
        : state;

    case "PAUSE":
      return state.phase === "playing" ? { ...state, phase: "paused" } : state;

    case "RESUME":
      return state.phase === "paused" ? { ...state, phase: "playing" } : state;

    case "VICTORY":
      return state.phase === "playing" ? { ...state, phase: "victory" } : state;

    case "MISS":
      return state.phase === "playing"
        ? { ...state, phase: "gameover", lastMissedAt: performance.now() }
        : state;

    case "RESET":
      return state.phase === "gameover" || state.phase === "victory"
        ? freshRunState("ready", state.mode)
        : state;

    case "SET_SCORE":
      if (state.phase !== "playing") return state;

      return {
        ...state,
        score: action.score,
        cakesEaten: action.cakesEaten,
        currentSpeed: Math.min(
          CAKE_SPEED_BASE *
            SPEED_RAMP_FACTOR **
              Math.floor(action.cakesEaten / SPEED_RAMP_INTERVAL),
          speedCapFor(state.mode),
        ),
        currentSpawnMs: Math.max(
          CAKE_SPAWN_MS_BASE *
            SPAWN_RAMP_FACTOR **
              Math.floor(action.cakesEaten / SPEED_RAMP_INTERVAL),
          spawnFloorFor(state.mode),
        ),
      };

    case "EAT_CAKE": {
      if (state.phase !== "playing") return state;

      const hit = state.cakes.find((cake) => cake.id === action.cakeId);
      return hit === undefined
        ? state
        : resolveCakeEaten(state, hit, state.cakes);
    }

    case "TICK": {
      if (state.phase !== "playing") return state;

      const { bottom, vy, hitFloor } = applyGravity(
        state.birdBottom,
        state.birdVy,
        action.dt,
      );
      const movedCakes = state.cakes.map((cake) =>
        moveCake(cake, state.currentSpeed, action.dt),
      );

      // ─── Floor collision ─────────────────────────────────────────────────
      if (hitFloor) {
        // Lenient modes (Easy & Normal): bounce back if lives remain
        if (isLenientMode(state.mode) && state.livesLeft > 1) {
          return {
            ...state,
            birdBottom: BIRD_MIN_BOTTOM,
            birdVy: EASY_BOUNCE_VY,
            cakes: movedCakes,
            livesLeft: state.livesLeft - 1,
            // Do not gameover, but still trigger shake feedback
            lastMissedAt: performance.now(),
          };
        }
        // Last life OR strict mode — actual gameover
        return {
          ...state,
          birdBottom: bottom,
          birdVy: vy,
          cakes: movedCakes,
          livesLeft: isLenientMode(state.mode) ? 0 : state.livesLeft,
          phase: "gameover",
          lastMissedAt: performance.now(),
        };
      }

      // ─── Cake offscreen (missed) ─────────────────────────────────────────
      if (movedCakes.some(cakeOffscreen)) {
        // Lenient modes: missing a cake also costs a life. Reset bird size &
        // combo. Game over only when the last life is spent.
        if (isLenientMode(state.mode)) {
          const newLives = state.livesLeft - 1;
          if (newLives > 0) {
            return {
              ...state,
              birdBottom: bottom,
              birdVy: vy,
              cakes: movedCakes.filter((c) => !cakeOffscreen(c)),
              birdSize: 1,
              livesLeft: newLives,
              combo: 0,
              lastMissedAt: performance.now(),
            };
          }
          // Out of lives — game over
          return {
            ...state,
            birdBottom: bottom,
            birdVy: vy,
            cakes: movedCakes,
            birdSize: 1,
            livesLeft: 0,
            combo: 0,
            phase: "gameover",
            lastMissedAt: performance.now(),
          };
        }
        // Hard mode: any miss is instant gameover
        return {
          ...state,
          birdBottom: bottom,
          birdVy: vy,
          cakes: movedCakes,
          phase: "gameover",
          lastMissedAt: performance.now(),
        };
      }

      // ─── Cake collision (eaten) ─────────────────────────────────────────
      // Effective hitbox scales with birdSize (lenient modes grow the bird)
      const scale = birdScaleFor(state);
      const cx = BIRD_LEFT + BIRD_WIDTH / 2;
      const cy = bottom + BIRD_HEIGHT / 2;
      const ew = BIRD_WIDTH * scale;
      const eh = BIRD_HEIGHT * scale;
      const hx = cx - ew / 2;
      const hy = cy - eh / 2;

      const hit = movedCakes.find((cake) =>
        boxesOverlap(
          hx,
          hy,
          ew,
          eh,
          cake.left,
          cake.bottom,
          CAKE_WIDTH,
          CAKE_HEIGHT,
        ),
      );

      if (hit !== undefined) {
        return resolveCakeEaten(
          { ...state, birdBottom: bottom, birdVy: vy },
          hit,
          movedCakes,
        );
      }

      return { ...state, birdBottom: bottom, birdVy: vy, cakes: movedCakes };
    }

    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
