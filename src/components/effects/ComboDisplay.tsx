"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface ComboDisplayProps {
  combo: number;
  reducedMotion?: boolean;
}

/**
 * Compact combo pill. Colour + label escalate with combo tier, but the layout
 * stays small so it doesn't dominate the screen at high combos.
 *
 * Perf notes:
 *   - The outer motion.div does NOT use `key={combo}`, so it only runs its
 *     spring enter animation once per combo streak (not once per cake eaten).
 *   - Only the number itself gets a tiny scale pulse via an inner motion.span
 *     keyed on `combo` — cheap and doesn't trigger the surrounding layout.
 *   - Font size is fixed (no runaway growth at high combos).
 */

const TIERS = [
  { min: 5, color: "#ff2f4a", emoji: "🔥", label: "INSANE!" },
  { min: 4, color: "#ff6a00", emoji: "🔥", label: "AMAZING!" },
  { min: 3, color: "#ff9d00", emoji: "🔥", label: "GREAT!" },
  { min: 2, color: "#ffd400", emoji: "⚡", label: "COMBO!" },
] as const;

function tierFor(combo: number) {
  return TIERS.find((t) => combo >= t.min) ?? TIERS[TIERS.length - 1];
}

export default function ComboDisplay({
  combo,
  reducedMotion,
}: ComboDisplayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (combo >= 2) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [combo]);

  const tier = tierFor(combo);

  if (reducedMotion) {
    return visible ? (
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none px-3 py-1 rounded-full bg-black/55 font-bold text-base whitespace-nowrap"
        style={{ color: tier.color }}
      >
        {tier.emoji} x{combo} {tier.label}
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute top-16 left-1/2 z-20 pointer-events-none select-none px-3 py-1 rounded-full bg-black/55 backdrop-blur-sm font-bold text-lg whitespace-nowrap shadow-lg"
          style={{
            color: tier.color,
            textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          }}
          initial={{ opacity: 0, scale: 0.5, x: "-50%", y: -10 }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: "-50%", y: -10 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <span>{tier.emoji}</span>{" "}
          {/* Tiny pulse just on the number, keyed by combo so it re-triggers
              per cake but the surrounding pill stays put. */}
          <motion.span
            key={combo}
            className="inline-block"
            initial={{ scale: 1.35 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            x{combo}
          </motion.span>{" "}
          <span>{tier.label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
