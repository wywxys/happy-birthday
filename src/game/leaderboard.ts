import {
  ENDLESS_UNLOCKED_KEY,
  LEADERBOARD_KEY,
  LEADERBOARD_MAX_ENTRIES,
} from "./constants";
import type { GameMode } from "./types";

export interface LeaderboardEntry {
  score: number;
  mode: GameMode;
  date: string; // ISO string
  cakesEaten: number;
  maxCombo: number;
}

// ─── Endless Unlock ──────────────────────────────────────────────────────────

export function isEndlessUnlocked(): boolean {
  try {
    return localStorage.getItem(ENDLESS_UNLOCKED_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockEndless(): void {
  try {
    localStorage.setItem(ENDLESS_UNLOCKED_KEY, "1");
  } catch {
    /* ignore */
  }
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function addToLeaderboard(entry: LeaderboardEntry): LeaderboardEntry[] {
  const board = getLeaderboard();
  board.push(entry);
  // Sort by score descending
  board.sort((a, b) => b.score - a.score);
  // Keep only top N
  const trimmed = board.slice(0, LEADERBOARD_MAX_ENTRIES);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
  return trimmed;
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch {
    /* ignore */
  }
}
