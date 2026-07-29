import type { GameMode } from "./types";

export interface ModeMeta {
  id: GameMode;
  label: string; // Short label ("简单")
  icon: string; // Emoji ("🌸")
  desc: string; // One-line description in the picker
  /** Tailwind gradient stops for buttons/cards */
  gradient: string;
}

export const MODE_META: Record<GameMode, ModeMeta> = {
  easy: {
    id: "easy",
    label: "简单",
    icon: "🌸",
    desc: "变胖・蹦床・生命值 · 25 蛋糕通关",
    gradient: "from-pink-400 to-rose-500",
  },
  normal: {
    id: "normal",
    label: "普通",
    icon: "🎂",
    desc: "简单模式的无尽版本",
    gradient: "from-purple-500 to-fuchsia-600",
  },
  hard: {
    id: "hard",
    label: "困难",
    icon: "🔥",
    desc: "一次失误就死 · 无尽",
    gradient: "from-orange-500 to-red-600",
  },
};

/** Ordered list for stable iteration (picker, button rows, etc.) */
export const MODE_ORDER: GameMode[] = ["easy", "normal", "hard"];

/** Short "icon + label" for HUDs and screen headers */
export function modeShortLabel(mode: GameMode): string {
  const m = MODE_META[mode];
  return `${m.icon} ${m.label}`;
}
