export type Phase =
  | "intro"
  | "ready"
  | "playing"
  | "paused"
  | "gameover"
  | "victory";
export type CakeKind = "regular" | "golden" | "heart";
export type GameMode = "easy" | "normal" | "hard";
export interface Cake {
  id: number;
  left: number;
  bottom: number;
  kind: CakeKind;
}
export type GameAction =
  | { type: "INTRO_DONE" }
  | { type: "START"; mode?: GameMode }
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "JUMP" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK"; dt: number }
  | { type: "SPAWN_CAKE"; cake: Omit<Cake, "id"> }
  | { type: "EAT_CAKE"; cakeId: number }
  | { type: "SET_SCORE"; score: number; cakesEaten: number }
  | { type: "MISS" }
  | { type: "VICTORY" }
  | { type: "RESET" };
export interface GameState {
  phase: Phase;
  mode: GameMode;
  birdBottom: number;
  birdVy: number;
  cakes: Cake[];
  score: number;
  cakesEaten: number;
  nextCakeId: number;
  currentSpeed: number;
  currentSpawnMs: number;
  runStartTs: number;
  lastEatenCake: {
    x: number;
    y: number;
    kind: CakeKind;
    points: number;
    id: number;
  } | null;
  lastMissedAt: number | null;
  /** Combo tracking */
  combo: number;
  lastEatTime: number;
  /** Easy-mode: 1 (default) up to 9 (max, wears crown). Grows per cake, resets on miss. */
  birdSize: number;
  /** Lenient modes (Easy & Normal): remaining lives. Costs 1 per floor-touch
   *  or missed cake; refilled by heart cakes up to EASY_MAX_LIVES. */
  livesLeft: number;
}
