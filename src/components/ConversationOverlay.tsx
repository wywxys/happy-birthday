"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const conversations = [
  {
    speaker: "shan",
    text: "杉：可爱的云宝你好，今天是你一年一度的生日，为此我准备了许多蛋糕。",
  },
  { speaker: "shan", text: "杉：勇敢向前跳跃，然后尽力吃下蛋糕吧！" },
  { speaker: "yun", text: "云：我该怎么操作呢？" },
  {
    speaker: "shan",
    text: "杉：点击屏幕，会使角色云宝向上跳跃一段距离，蛋糕会从右侧来袭。",
  },
  { speaker: "yun", text: "云：为什么一定是蛋糕呢？" },
  { speaker: "shan", text: "杉：因为我实在想不出来写什么小游戏了，凑活吃吧。" },
  { speaker: "shan", text: "杉：但要记住，漏掉杉杉准备的蛋糕，会受到制裁捏。" },
  { speaker: "yun", text: "云：怎么制裁？" },
  {
    speaker: "shan",
    text: "杉：漏掉就游戏结束了捏。多说无益，开始你的旅途吧少女！",
  },
  { speaker: "shan", text: "杉：对话框结束后点击屏幕开始游戏捏~" },
];

interface ConversationOverlayProps {
  onComplete: () => void;
}

export default function ConversationOverlay({
  onComplete,
}: ConversationOverlayProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const next = useCallback(() => {
    if (index >= conversations.length - 1) {
      setVisible(false);
      setTimeout(onComplete, 500);
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, onComplete]);

  const skip = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setVisible(false);
      setTimeout(onComplete, 300);
    },
    [onComplete],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "Escape") {
        setVisible(false);
        setTimeout(onComplete, 300);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, onComplete]);

  if (!visible) return null;

  const current = conversations[index];
  const speakerSrc = current.speaker === "shan" ? "/shan.png" : "/yun.png";
  const isLast = index === conversations.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-gradient-to-b from-black/40 via-black/30 to-black/70 backdrop-blur-[2px] cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={next}
      role="button"
      tabIndex={0}
    >
      {/* Speaker portrait — anchored above the dialog card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`speaker-${index}`}
          className="absolute right-[6%] bottom-[220px] w-[200px] pointer-events-none drop-shadow-2xl"
          initial={{ opacity: 0, x: 60, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 40, y: 10 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <Image
            src={speakerSrc}
            alt={current.speaker}
            width={200}
            height={270}
            priority
            className="w-full h-auto"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dialog card */}
      <div
        className="w-full max-w-[900px] mx-auto mb-6 px-6"
        onClick={(e) => {
          // Card click still advances; explicit handler so it never mysteriously stops working
          e.stopPropagation();
          next();
        }}
      >
        <div className="relative min-h-[180px] rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 shadow-2xl ring-1 ring-black/40 px-8 py-6 pr-[220px]">
          {/* Speaker name tag */}
          <div className="absolute -top-3 left-6 px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white text-sm font-bold shadow-lg tracking-wider">
            {current.speaker === "shan" ? "杉杉" : "云宝"}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={`text-${index}`}
              className="text-white text-lg md:text-xl font-medium leading-relaxed pt-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {current.text}
            </motion.p>
          </AnimatePresence>

          {/* Continue indicator */}
          <div className="absolute right-6 bottom-4 flex items-center gap-2">
            <span className="text-white/70 text-xs">
              {isLast ? "点击开始游戏" : "点击继续"}
            </span>
            <motion.span
              className="text-pink-300 text-lg"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ▼
            </motion.span>
          </div>

          {/* Progress dots */}
          <div className="absolute left-6 bottom-4 flex gap-1.5">
            {conversations.map((conv, i) => (
              <div
                key={conv.text}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-pink-400"
                    : i < index
                      ? "w-1.5 bg-white/80"
                      : "w-1.5 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skip button */}
      <button
        type="button"
        onClick={skip}
        className="absolute top-4 right-4 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full text-white text-sm font-medium backdrop-blur-md transition-colors cursor-pointer border border-white/20 shadow-lg z-10"
      >
        跳过 ›
      </button>
    </motion.div>
  );
}
