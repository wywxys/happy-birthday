import {
  LEADERBOARD_KEY,
  LEADERBOARD_MAX_ENTRIES,
  LEGACY_ENDLESS_UNLOCKED_KEY,
  MODES_UNLOCKED_KEY,
} from "./constants";
import type { GameMode } from "./types";

export interface LeaderboardEntry {
  score: number;
  mode: GameMode;
  date: string; // ISO string
  cakesEaten: number;
  maxCombo: number;
}

// ─── Mode Unlock ─────────────────────────────────────────────────────────────
// Easy is always unlocked (default). Beating Easy Mode (25 cakes) unlocks
// Normal + Hard. Backwards-compat: the pre-v2 "endless-unlocked" flag also
// counts as fully unlocked so returning players don't lose progress.

export function isModesUnlocked(): boolean {
  try {
    if (localStorage.getItem(MODES_UNLOCKED_KEY) === "1") return true;
    // Legacy migration: pre-v2 users who beat Normal Mode already had the
    // "endless" flag set — carry that over to the new unlock system and
    // persist so we don't rely on the legacy key forever.
    if (localStorage.getItem(LEGACY_ENDLESS_UNLOCKED_KEY) === "1") {
      try {
        localStorage.setItem(MODES_UNLOCKED_KEY, "1");
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function unlockModes(): void {
  try {
    localStorage.setItem(MODES_UNLOCKED_KEY, "1");
  } catch {
    /* ignore */
  }
}

// Migrate legacy leaderboard entries whose mode was "endless" → "hard"
function migrateEntry(e: LeaderboardEntry): {
  entry: LeaderboardEntry;
  changed: boolean;
} {
  // biome-ignore lint/suspicious/noExplicitAny: reading legacy string value
  if ((e.mode as any) === "endless") {
    return { entry: { ...e, mode: "hard" }, changed: true };
  }
  return { entry: e, changed: false };
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    let anyChanged = false;
    const migrated = (parsed as LeaderboardEntry[]).map((e) => {
      const { entry, changed } = migrateEntry(e);
      if (changed) anyChanged = true;
      return entry;
    });
    // Persist migration so we don't keep translating on every read
    if (anyChanged) {
      try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(migrated));
      } catch {
        /* ignore */
      }
    }
    return migrated;
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
