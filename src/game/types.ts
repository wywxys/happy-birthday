export type Phase = "intro" | "ready" | "playing" | "paused" | "gameover" | "victory";
export type CakeKind = "regular" | "golden";
export interface Cake { id: number; left: number; bottom: number; kind: CakeKind }
export type GameAction =
  | { type: "INTRO_DONE" } | { type: "START" } | { type: "JUMP" }
  | { type: "PAUSE" } | { type: "RESUME" } | { type: "TICK"; dt: number }
  | { type: "SPAWN_CAKE"; cake: Omit<Cake, "id"> } | { type: "EAT_CAKE"; cakeId: number }
  | { type: "SET_SCORE"; score: number; cakesEaten: number }
  | { type: "MISS" } | { type: "VICTORY" } | { type: "RESET" };
export interface GameState { phase: Phase; birdBottom: number; birdVy: number; cakes: Cake[]; score: number; cakesEaten: number; nextCakeId: number; currentSpeed: number; currentSpawnMs: number; runStartTs: number; lastEatenCake: { x: number; y: number; kind: CakeKind; points: number; id: number } | null; lastMissedAt: number | null }
