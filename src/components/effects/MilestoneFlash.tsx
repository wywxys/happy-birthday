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
      const t = setTimeout(() => setFlash(null), 1200);
      return () => clearTimeout(t);
    }
  }, [cakesEaten]);

  if (reducedMotion) {
    return flash !== null ? (
      <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-30 px-5 py-2 rounded-full bg-black/50 text-white text-xl font-bold">
        🎂×{flash}!
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {flash !== null && (
        <motion.div
          key={flash}
          className="absolute top-12 left-1/2 pointer-events-none z-30 px-5 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-2xl font-bold shadow-lg"
          initial={{ opacity: 0, scale: 0.6, x: "-50%", y: -20 }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: "-50%", y: -10 }}
          transition={{ duration: 0.25 }}
        >
          🎂×{flash}! 🎉
        </motion.div>
      )}
    </AnimatePresence>
  );
}
