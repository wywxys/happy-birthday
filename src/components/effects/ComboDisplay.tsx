"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface ComboDisplayProps {
  combo: number;
  reducedMotion?: boolean;
}

/**
 * Displays a combo counter when player eats cakes in quick succession.
 * Shows fire emoji escalation and color changes.
 */
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

  const getComboStyle = () => {
    if (combo >= 5)
      return { color: "#ff0000", emoji: "🔥🔥🔥", label: "INSANE!" };
    if (combo >= 4)
      return { color: "#ff4500", emoji: "🔥🔥", label: "AMAZING!" };
    if (combo >= 3) return { color: "#ff8c00", emoji: "🔥", label: "GREAT!" };
    return { color: "#ffd700", emoji: "⚡", label: "COMBO!" };
  };

  const style = getComboStyle();

  if (reducedMotion) {
    return visible ? (
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 z-20 font-bold text-2xl pointer-events-none"
        style={{ color: style.color }}
      >
        {style.emoji} x{combo} {style.label}
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={combo}
          className="absolute top-16 left-1/2 z-20 font-bold pointer-events-none select-none"
          style={{
            color: style.color,
            textShadow: `0 0 10px ${style.color}, 0 2px 4px rgba(0,0,0,0.5)`,
            fontSize: `${Math.min(1.5 + combo * 0.2, 3)}rem`,
          }}
          initial={{ opacity: 0, scale: 0.5, x: "-50%", y: -10 }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
          exit={{ opacity: 0, scale: 1.3, x: "-50%", y: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {style.emoji} x{combo} {style.label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
