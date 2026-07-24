"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "motion/react";
import { useMemo, useRef } from "react";

gsap.registerPlugin(useGSAP);

interface VictoryScreenProps {
  score: number;
  onRestart: () => void;
}

export default function VictoryScreen({
  score,
  onRestart,
}: VictoryScreenProps) {
  const titleRef = useRef<HTMLDivElement>(null);
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
      <div className="text-white/80 text-xl mb-8 text-center">
        <p>得分: {score} 🎂</p>
      </div>

      {/* Restart button */}
      <motion.button
        onClick={onRestart}
        className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-full shadow-lg cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        再玩一次 🎮
      </motion.button>
    </motion.div>
  );
}
