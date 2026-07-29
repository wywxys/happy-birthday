// ─── World / Bird ────────────────────────────────────────────────────────────
export const WORLD_WIDTH = 500;
export const WORLD_HEIGHT = 700;

export const BIRD_WIDTH = 60;
export const BIRD_HEIGHT = 45;
export const BIRD_LEFT = 80;
export const BIRD_START_BOTTOM = 440;
/**
 * Floor collision threshold (bottom-anchored). The visible grass top sits at
 * bottom-anchored y=110 in the parallax canvas; this is set slightly lower so
 * the bird can visually dip a bit into the ground before dying/bouncing.
 */
export const BIRD_MIN_BOTTOM = 92;
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
/** Cakes-to-eat threshold to win Easy Mode (Normal & Hard are endless) */
export const VICTORY_CAKES = 25;

// ─── Difficulty Ramp ──────────────────────────────────────────────────────────
/** Score interval at which speed and spawn rate are ramped */
export const SPEED_RAMP_INTERVAL = 5;
/** Multiplier applied to cake speed each ramp step */
export const SPEED_RAMP_FACTOR = 1.15;
/** Multiplier applied to spawn interval each ramp step (< 1 = faster spawns) */
export const SPAWN_RAMP_FACTOR = 0.9;
/** Legacy fallback speed cap (unused now; each mode has its own) */
export const SPEED_CAP_FACTOR = 2.0;
/** Legacy fallback spawn floor (unused now; each mode has its own) */
export const SPAWN_FLOOR_MS = 700;

// ─── Variety ──────────────────────────────────────────────────────────────────
/** Probability [0–1] that a spawned cake is golden */
export const GOLDEN_CAKE_PROB = 0.15;
/** Points awarded for catching a golden cake */
export const GOLDEN_CAKE_POINTS = 3;
/** Probability [0–1] that a spawned cake is a heart (Easy & Normal only) */
export const HEART_CAKE_PROB = 0.12;

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

// ─── Easy Mode ( 简单 · 25 蛋糕胜利 ) ─────────────────────────────────────────
/** Bird grows one step per cake, from 1x up to 9x (crown at max) */
export const EASY_MAX_SIZE = 9;
/** Total visual scale multiplier at max size */
export const EASY_MAX_SIZE_SCALE = 1.5;
/** Max lives shared by Easy & Normal. Costs one life per floor-touch OR per
 *  missed cake; heart cakes can restore up to this cap. */
export const EASY_MAX_LIVES = 5;
/** Strong upward velocity when bouncing off the floor (px/s) */
export const EASY_BOUNCE_VY = 780;
/** Easy: forgiving speed cap */
export const EASY_SPEED_CAP_FACTOR = 1.5;
/** Easy: forgiving spawn interval floor */
export const EASY_SPAWN_FLOOR_MS = 900;

// ─── Normal Mode ( 普通 = Easy 的无尽版本 ) ───────────────────────────────────
/** Same lenient mechanics as Easy (growth / bounce / lives / hearts) but no
 *  victory condition. Difficulty caps a bit higher than Easy so the endless
 *  run has meaningful escalation. */
export const NORMAL_SPEED_CAP_FACTOR = 2.2;
export const NORMAL_SPAWN_FLOOR_MS = 600;

// ─── Hard Mode ( 困难 · 一次失误就死 ) ────────────────────────────────────────
/** Strict: no bounces, no growth, one miss = game over. Speed/spawn ramp
 *  the highest of all modes. */
export const HARD_SPEED_CAP_FACTOR = 3.0;
export const HARD_SPAWN_FLOOR_MS = 450;

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const BEST_SCORE_STORAGE_KEY = "happy-birthday-best";
export const MUTED_STORAGE_KEY = "happy-birthday-muted";
/** Set after the player first beats Easy Mode — unlocks Normal + Hard */
export const MODES_UNLOCKED_KEY = "happy-birthday-modes-unlocked";
/** Legacy pre-v2 flag — still honored to migrate returning players */
export const LEGACY_ENDLESS_UNLOCKED_KEY = "happy-birthday-endless-unlocked";
export const LEADERBOARD_KEY = "happy-birthday-leaderboard";
export const LEADERBOARD_MAX_ENTRIES = 10;
