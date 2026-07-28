"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../game/leaderboard";
import { getLeaderboard } from "../game/leaderboard";

interface LeaderboardPanelProps {
  /** If provided, this score will be highlighted */
  currentScore?: number;
  onClose: () => void;
}

export default function LeaderboardPanel({
  currentScore,
  onClose,
}: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const getMedal = (rank: number) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `${rank + 1}.`;
  };

  const getModeLabel = (mode: string) => {
    return mode === "endless" ? "♾️ 无尽" : "🎂 普通";
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md mx-4 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 shadow-2xl overflow-hidden"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white text-center">
            🏆 排行榜
          </h2>
        </div>

        {/* Entries */}
        <div className="px-4 py-3 max-h-[400px] overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-white/50 text-center py-8">
              还没有记录，快去游戏吧！
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => {
                const isCurrentScore = entry.score === currentScore;
                return (
                  <motion.div
                    key={`${entry.date}-${entry.score}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                      isCurrentScore
                        ? "bg-amber-500/20 border border-amber-400/40"
                        : "bg-white/5"
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {/* Rank */}
                    <span className="text-xl w-8 text-center">
                      {getMedal(i)}
                    </span>

                    {/* Score & Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-lg font-bold ${
                            isCurrentScore ? "text-amber-300" : "text-white"
                          }`}
                        >
                          {entry.score} 分
                        </span>
                        <span className="text-xs text-white/40">
                          {getModeLabel(entry.mode)}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-white/50">
                        <span>🎂 ×{entry.cakesEaten}</span>
                        {entry.maxCombo >= 2 && (
                          <span>🔥 ×{entry.maxCombo}</span>
                        )}
                        <span>
                          {new Date(entry.date).toLocaleDateString("zh-CN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Current indicator */}
                    {isCurrentScore && (
                      <span className="text-xs text-amber-300 font-bold">
                        ← 本次
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
