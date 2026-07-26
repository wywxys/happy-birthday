import {
  BIRD_HEIGHT,
  BIRD_LEFT,
  BIRD_START_BOTTOM,
  BIRD_WIDTH,
  CAKE_HEIGHT,
  CAKE_SPAWN_MS_BASE,
  CAKE_SPEED_BASE,
  CAKE_WIDTH,
  SPAWN_FLOOR_MS,
  SPAWN_RAMP_FACTOR,
  SPEED_CAP_FACTOR,
  SPEED_RAMP_FACTOR,
  SPEED_RAMP_INTERVAL,
  VICTORY_SCORE,
} from "./constants";
import {
  applyGravity,
  applyJump,
  boxesOverlap,
  cakeOffscreen,
  moveCake,
} from "./physics";
import { cakePoints } from "./spawner";
import type { Cake, GameAction, GameState } from "./types";

export const initialGameState: GameState = {
  phase: "intro",
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
};

function freshRunState(phase: "ready" | "playing"): GameState {
  return {
    phase,
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
  };
}

function resolveCakeEaten(
  state: GameState,
  hit: Cake,
  sourceCakes: readonly Cake[],
): GameState {
  const points = cakePoints(hit.kind);
  const newScore = state.score + points;
  const newCakesEaten = state.cakesEaten + 1;
  let currentSpeed = state.currentSpeed;
  let currentSpawnMs = state.currentSpawnMs;

  if (newCakesEaten % SPEED_RAMP_INTERVAL === 0) {
    currentSpeed = Math.min(
      state.currentSpeed * SPEED_RAMP_FACTOR,
      CAKE_SPEED_BASE * SPEED_CAP_FACTOR,
    );
    currentSpawnMs = Math.max(
      state.currentSpawnMs * SPAWN_RAMP_FACTOR,
      SPAWN_FLOOR_MS,
    );
  }

  return {
    ...state,
    cakes: sourceCakes.filter((cake) => cake.id !== hit.id),
    score: newScore,
    cakesEaten: newCakesEaten,
    currentSpeed,
    currentSpawnMs,
    lastEatenCake: {
      x: hit.left,
      y: hit.bottom,
      kind: hit.kind,
      points,
      id: hit.id,
    },
    phase: newScore >= VICTORY_SCORE ? "victory" : "playing",
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INTRO_DONE":
      return state.phase === "intro" ? { ...state, phase: "ready" } : state;

    case "START":
      return state.phase === "ready" ? freshRunState("playing") : state;

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
        ? freshRunState("ready")
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
          CAKE_SPEED_BASE * SPEED_CAP_FACTOR,
        ),
        currentSpawnMs: Math.max(
          CAKE_SPAWN_MS_BASE *
            SPAWN_RAMP_FACTOR **
              Math.floor(action.cakesEaten / SPEED_RAMP_INTERVAL),
          SPAWN_FLOOR_MS,
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

      if (hitFloor) {
        return {
          ...state,
          birdBottom: bottom,
          birdVy: vy,
          cakes: movedCakes,
          phase: "gameover",
          lastMissedAt: performance.now(),
        };
      }

      if (movedCakes.some(cakeOffscreen)) {
        return {
          ...state,
          birdBottom: bottom,
          birdVy: vy,
          cakes: movedCakes,
          phase: "gameover",
          lastMissedAt: performance.now(),
        };
      }

      const hit = movedCakes.find((cake) =>
        boxesOverlap(
          BIRD_LEFT,
          bottom,
          BIRD_WIDTH,
          BIRD_HEIGHT,
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
