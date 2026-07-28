// ─── World / Bird ────────────────────────────────────────────────────────────
export const WORLD_WIDTH = 500;
export const WORLD_HEIGHT = 700;

export const BIRD_WIDTH = 60;
export const BIRD_HEIGHT = 45;
export const BIRD_LEFT = 80;
export const BIRD_START_BOTTOM = 440;
export const BIRD_MIN_BOTTOM = 100;
export const BIRD_MAX_BOTTOM = 580;

// ─── rAF Physics (bottom-anchored: positive vy = upward) ─────────────────────
/** Gravitational acceleration in px/s² — subtracted from vy each frame */
export const GRAVITY_ACC = 1200;
/** Initial vertical velocity on jump in px/s — POSITIVE = upward */
export const JUMP_VY = 520;
/** Maximum frame-time delta clamp in seconds (prevents spiral-of-death) */
export const MAX_DT = 0.05;

// ─── Cake ─────────────────────────────────────────────────────────────────────
export const CAKE_WIDTH = 50;
export const CAKE_HEIGHT = 50;
export const CAKE_START_LEFT = WORLD_WIDTH - CAKE_WIDTH;
/** Base horizontal speed in px/s */
export const CAKE_SPEED_BASE = 180;
/** Base spawn interval in milliseconds */
export const CAKE_SPAWN_MS_BASE = 1400;
export const VICTORY_SCORE = 20;

// ─── Difficulty Ramp ──────────────────────────────────────────────────────────
/** Score interval at which speed and spawn rate are ramped */
export const SPEED_RAMP_INTERVAL = 5;
/** Multiplier applied to cake speed each ramp step */
export const SPEED_RAMP_FACTOR = 1.15;
/** Multiplier applied to spawn interval each ramp step (< 1 = faster spawns) */
export const SPAWN_RAMP_FACTOR = 0.9;
/** Maximum speed expressed as a multiple of CAKE_SPEED_BASE */
export const SPEED_CAP_FACTOR = 2.0;
/** Minimum spawn interval floor in milliseconds */
export const SPAWN_FLOOR_MS = 700;

// ─── Variety ──────────────────────────────────────────────────────────────────
/** Probability [0–1] that a spawned cake is golden */
export const GOLDEN_CAKE_PROB = 0.15;
/** Points awarded for catching a golden cake */
export const GOLDEN_CAKE_POINTS = 3;
/** Score milestones that trigger special feedback */
export const MILESTONE_SCORES = [5, 10, 15] as const;

// ─── Feel ─────────────────────────────────────────────────────────────────────
/** Duration of hit-stop freeze in milliseconds */
export const HITSTOP_MS = 80;
/** Duration of screen-shake effect in milliseconds */
export const SCREEN_SHAKE_MS = 400;

// ─── Combo System ─────────────────────────────────────────────────────────────
/** Max time window (ms) between eats to maintain a combo */
export const COMBO_WINDOW_MS = 2000;
/** Bonus multiplier per combo level (e.g., combo=3 → 1 + 3*0.5 = 2.5x) */
export const COMBO_BONUS_FACTOR = 0.5;

// ─── Endless Mode ─────────────────────────────────────────────────────────────
/** In endless mode, speed/spawn continue to ramp beyond the normal caps */
export const ENDLESS_SPEED_CAP_FACTOR = 3.0;
export const ENDLESS_SPAWN_FLOOR_MS = 450;

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const BEST_SCORE_STORAGE_KEY = "happy-birthday-best";
export const MUTED_STORAGE_KEY = "happy-birthday-muted";
export const ENDLESS_UNLOCKED_KEY = "happy-birthday-endless-unlocked";
export const LEADERBOARD_KEY = "happy-birthday-leaderboard";
export const LEADERBOARD_MAX_ENTRIES = 10;
