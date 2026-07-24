"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ConversationOverlay from "./ConversationOverlay";

const PhaserGame = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
});

export default function GameShell() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-900 overflow-hidden relative">
      <PhaserGame />
      {!introComplete && (
        <ConversationOverlay onComplete={() => setIntroComplete(true)} />
      )}
    </div>
  );
}
