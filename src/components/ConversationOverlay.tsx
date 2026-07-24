"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

const conversations = [
  { speaker: "shan", text: "杉：可爱的云宝你好，今天是你一年一度的生日，为此我准备了许多蛋糕。" },
  { speaker: "shan", text: "杉：勇敢向前跳跃，然后尽力吃下蛋糕吧！" },
  { speaker: "yun", text: "云：我该怎么操作呢？" },
  { speaker: "shan", text: "杉：点击屏幕，会使角色云宝向上跳跃一段距离，蛋糕会从右侧来袭。" },
  { speaker: "yun", text: "云：为什么一定是蛋糕呢？" },
  { speaker: "shan", text: "杉：因为我实在想不出来写什么小游戏了，凑活吃吧。" },
  { speaker: "shan", text: "杉：但要记住，漏掉杉杉准备的蛋糕，会受到制裁捏。" },
  { speaker: "yun", text: "云：怎么制裁？" },
  { speaker: "shan", text: "杉：漏掉就游戏结束了捏。多说无益，开始你的旅途吧少女！" },
  { speaker: "shan", text: "杉：对话框结束后点击屏幕开始游戏捏~" },
];

interface ConversationOverlayProps {
  onComplete: () => void;
}

export default function ConversationOverlay({ onComplete }: ConversationOverlayProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const next = useCallback(() => {
    if (index >= conversations.length - 1) {
      setVisible(false);
      setTimeout(onComplete, 500); // wait for exit animation
    } else {
      setIndex(i => i + 1);
    }
  }, [index, onComplete]);

  const skip = useCallback(() => {
    setVisible(false);
    setTimeout(onComplete, 300);
  }, [onComplete]);

  if (!visible) return null;

  const current = conversations[index];
  const speakerSrc = current.speaker === "shan" ? "/shan.png" : "/yun.png";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Speaker image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`speaker-${index}`}
          className="absolute right-[5%] bottom-[35%] w-[180px]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Image src={speakerSrc} alt={current.speaker} width={180} height={240} priority />
        </motion.div>
      </AnimatePresence>

      {/* Dialog box */}
      <div className="w-full bg-gradient-to-t from-slate-800/95 to-slate-700/90 p-6 pb-8 cursor-pointer" onClick={next}>
        <AnimatePresence mode="wait">
          <motion.p
            key={`text-${index}`}
            className="text-white text-lg font-bold max-w-[70%] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {current.text}
          </motion.p>
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex justify-center mt-3 gap-1">
          {conversations.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= index ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={skip}
        className="absolute top-4 right-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm backdrop-blur-sm transition-colors cursor-pointer"
      >
        跳过
      </button>
    </motion.div>
  );
}
