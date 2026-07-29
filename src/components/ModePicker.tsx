"use client";

import { motion } from "motion/react";
import { MODE_META, MODE_ORDER } from "../game/modeMeta";
import type { GameMode } from "../game/types";

interface ModePickerProps {
  currentMode: GameMode;
  modesUnlocked: boolean;
  onSelect: (mode: GameMode) => void;
}

export default function ModePicker({
  currentMode,
  modesUnlocked,
  onSelect,
}: ModePickerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {MODE_ORDER.map((id) => {
          const m = MODE_META[id];
          const isLocked = id !== "easy" && !modesUnlocked;
          const isActive = id === currentMode;
          return (
            <motion.button
              key={id}
              type="button"
              disabled={isLocked}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked) onSelect(id);
              }}
              className={`relative px-4 py-2 rounded-2xl text-white font-bold shadow-lg backdrop-blur-sm transition-all ${
                isActive
                  ? `bg-gradient-to-br ${m.gradient} ring-2 ring-white/60 scale-105`
                  : isLocked
                    ? "bg-black/40 opacity-50 cursor-not-allowed"
                    : "bg-black/40 hover:bg-black/60 cursor-pointer"
              }`}
              whileHover={isLocked ? undefined : { scale: 1.05 }}
              whileTap={isLocked ? undefined : { scale: 0.95 }}
            >
              <div className="text-2xl">{isLocked ? "🔒" : m.icon}</div>
              <div className="text-xs mt-0.5">{m.label}</div>
            </motion.button>
          );
        })}
      </div>
      {!modesUnlocked && (
        <p className="text-white/70 text-xs bg-black/40 px-3 py-1 rounded-full">
          通关简单模式即可解锁普通 & 困难
        </p>
      )}
      <p className="text-white/60 text-xs">
        当前：{MODE_META[currentMode].desc}
      </p>
    </div>
  );
}
