"use client";

import { motion } from "motion/react";
import {
  CAKE_SPEED_BASE,
  EASY_SPEED_CAP_FACTOR,
  HARD_SPEED_CAP_FACTOR,
  SPEED_CAP_FACTOR,
} from "../../game/constants";
import type { GameMode } from "../../game/types";

interface DifficultyMeterProps {
  currentSpeed: number;
  mode?: GameMode;
  reducedMotion?: boolean;
}

/**
 * Shows a small visual meter indicating the current difficulty/speed level.
 * Glows red as it approaches maximum.
 */
export default function DifficultyMeter({
  currentSpeed,
  mode = "normal",
  reducedMotion,
}: DifficultyMeterProps) {
  const capFactor =
    mode === "easy"
      ? EASY_SPEED_CAP_FACTOR
      : mode === "hard"
        ? HARD_SPEED_CAP_FACTOR
        : SPEED_CAP_FACTOR;
  const maxSpeed = CAKE_SPEED_BASE * capFactor;
  const progress = Math.min(
    (currentSpeed - CAKE_SPEED_BASE) / (maxSpeed - CAKE_SPEED_BASE),
    1,
  );

  // Color transitions from green → yellow → red
  const hue = Math.round(120 - progress * 120);
  const color = `hsl(${hue}, 80%, 50%)`;

  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
      <span className="text-white/60 text-xs">速度</span>
      <div className="w-16 h-2 rounded-full bg-black/40 overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{ width: `${Math.max(10, progress * 100)}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        />
      </div>
    </div>
  );
}
