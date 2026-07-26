"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { MILESTONE_SCORES } from "../../game/constants";

export default function MilestoneFlash({
  cakesEaten,
  reducedMotion,
}: {
  cakesEaten: number;
  reducedMotion?: boolean;
}) {
  const [flash, setFlash] = useState<number | null>(null);
  useEffect(() => {
    if ((MILESTONE_SCORES as readonly number[]).includes(cakesEaten)) {
      setFlash(cakesEaten);
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [cakesEaten]);

  if (reducedMotion) {
    return flash !== null ? (
      <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm pointer-events-none z-30">
        <div className="text-8xl">🎂×{flash}!</div>
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {flash !== null && (
        <motion.div
          key={flash}
          className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm pointer-events-none z-30"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-8xl">🎂×{flash}!</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
