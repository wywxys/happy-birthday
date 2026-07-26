"use client";

import { motion } from "motion/react";

interface ScorePopProps {
  pops: {
    id: number;
    x: number;
    y: number;
    points: number;
    isGolden: boolean;
  }[];
  onDone: (id: number) => void;
  reducedMotion?: boolean;
}

export default function ScorePop({
  pops,
  onDone,
  reducedMotion,
}: ScorePopProps) {
  return (
    <>
      {pops.map((pop) => (
        <motion.span
          key={pop.id}
          className="score-pop absolute font-bold text-2xl pointer-events-none select-none z-20"
          style={{
            left: pop.x,
            bottom: pop.y,
            color: pop.isGolden ? "#ffd700" : "#ff69b4",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
          initial={{ opacity: 1, y: 0, scale: reducedMotion ? 1 : 0.7 }}
          animate={{
            opacity: 0,
            y: reducedMotion ? 0 : -60,
            scale: reducedMotion ? 1 : 1.4,
          }}
          transition={{ duration: reducedMotion ? 0.3 : 0.6, ease: "easeOut" }}
          onAnimationComplete={() => onDone(pop.id)}
        >
          +{pop.points} {pop.isGolden ? "✨" : "🎂"}
        </motion.span>
      ))}
    </>
  );
}
