"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "motion/react";
import { useMemo, useRef } from "react";
import { MODE_META, MODE_ORDER, modeShortLabel } from "../game/modeMeta";
import type { GameMode } from "../game/types";

gsap.registerPlugin(useGSAP);

interface VictoryScreenProps {
  score: number;
  best: number;
  isNewBest: boolean;
  mode: GameMode;
  onRestart: () => void;
  /** Whether normal + hard modes have been unlocked */
  modesUnlocked: boolean;
  /** Whether we just unlocked them on THIS victory (first-time celebration) */
  justUnlocked: boolean;
  /** Callback to start a specific mode */
  onStartMode: (mode: GameMode) => void;
  /** Callback to show leaderboard */
  onShowLeaderboard: () => void;
}

export default function VictoryScreen({
  score,
  best,
  isNewBest,
  mode,
  onRestart,
  modesUnlocked,
  justUnlocked,
  onStartMode,
  onShowLeaderboard,
}: VictoryScreenProps) {
  const titleRef = useRef<HTMLDivElement>(null);
  const newBestRef = useRef<HTMLSpanElement>(null);
  const chars = "云宝生日快乐!".split("");

  useGSAP(
    () => {
      if (titleRef.current) {
        gsap.from(titleRef.current.querySelectorAll(".char"), {
          opacity: 0,
          y: 50,
          stagger: 0.08,
          duration: 0.6,
          ease: "back.out(1.7)",
        });
      }
    },
    { scope: titleRef },
  );

  useGSAP(() => {
    if (isNewBest && newBestRef.current) {
      gsap.from(newBestRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      });
    }
  }, [isNewBest]);

  // Confetti pieces
  const confettiPieces = useMemo(() => {
    const confettiColors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ffd700",
    ];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: confettiColors[i % confettiColors.length],
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
    }));
  }, []);

  const modeLabel = modeShortLabel(mode);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-4 rounded-sm"
          style={{
            backgroundColor: piece.color,
            left: `${piece.x}%`,
            top: "-5%",
          }}
          animate={{ y: "110vh", rotate: 720, opacity: [1, 1, 0] }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}

      {/* Title */}
      <div
        ref={titleRef}
        className="text-5xl md:text-7xl font-bold text-white mb-4 flex"
      >
        {chars.map((char) => (
          <span key={char} className="char inline-block">
            {char}
          </span>
        ))}
      </div>

      {/* Mode + Stats */}
      <div className="text-white/70 text-sm mb-2">{modeLabel}</div>
      <div className="text-white/80 text-xl mb-2 text-center">
        得分: {score} 🎂
      </div>
      <div className="mb-6 text-lg text-white/80">
        最佳: {best} 🎂{" "}
        {isNewBest && <span ref={newBestRef}>· 🏆 NEW BEST!</span>}
      </div>

      {/* First-time unlock celebration */}
      {justUnlocked && (
        <motion.div
          className="mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-orange-500/30 border border-purple-400/40 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
        >
          <p className="text-purple-200 font-bold text-lg">
            🎊 普通 & 困难模式已解锁！
          </p>
          <p className="text-purple-300/70 text-sm mt-1">
            挑战更高难度，冲榜吧~
          </p>
        </motion.div>
      )}

      {/* Buttons — restart current mode + jump into any other unlocked mode */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center justify-center max-w-lg">
        <motion.button
          onClick={onRestart}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-bold rounded-full shadow-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          再玩一次 🎮
        </motion.button>

        {MODE_ORDER.filter((id) => {
          if (id === mode) return false; // current mode already covered by restart
          if (id === "easy") return true; // easy always available
          return modesUnlocked;
        }).map((id, i) => {
          const m = MODE_META[id];
          return (
            <motion.button
              key={id}
              onClick={() => onStartMode(id)}
              className={`px-5 py-3 bg-gradient-to-r ${m.gradient} text-white font-bold rounded-full shadow-lg cursor-pointer`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              {m.label} {m.icon}
            </motion.button>
          );
        })}
      </div>

      {/* Leaderboard button */}
      <motion.button
        onClick={onShowLeaderboard}
        className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 font-medium transition-colors cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        🏆 排行榜
      </motion.button>
    </motion.div>
  );
}
