"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "motion/react";
import { useMemo, useRef } from "react";

gsap.registerPlugin(useGSAP);

interface VictoryScreenProps {
  score: number;
  best: number;
  isNewBest: boolean;
  onRestart: () => void;
  /** Whether endless mode has been unlocked (first victory unlocks it) */
  endlessUnlocked: boolean;
  /** Callback to start endless mode */
  onStartEndless: () => void;
  /** Callback to show leaderboard */
  onShowLeaderboard: () => void;
}

export default function VictoryScreen({
  score,
  best,
  isNewBest,
  onRestart,
  endlessUnlocked,
  onStartEndless,
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
        className="text-5xl md:text-7xl font-bold text-white mb-8 flex"
      >
        {chars.map((char) => (
          <span key={char} className="char inline-block">
            {char}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="text-white/80 text-xl mb-4 text-center">
        <p>得分: {score} 🎂</p>
      </div>

      {/* Best score */}
      <div className="mb-6 text-2xl text-white">
        最佳: {best} 🎂{" "}
        {isNewBest && <span ref={newBestRef}>· 🏆 NEW BEST!</span>}
      </div>

      {/* Endless unlock announcement */}
      {endlessUnlocked && (
        <motion.div
          className="mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
        >
          <p className="text-purple-200 text-center font-bold">
            🎊 无尽模式已解锁！
          </p>
          <p className="text-purple-300/70 text-sm text-center mt-1">
            没有终点，挑战你的极限！
          </p>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <motion.button
          onClick={onRestart}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-full shadow-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          再玩一次 🎮
        </motion.button>

        {endlessUnlocked && (
          <motion.button
            onClick={onStartEndless}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xl font-bold rounded-full shadow-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            无尽模式 ♾️
          </motion.button>
        )}
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
