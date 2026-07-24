"use client";

import dynamic from "next/dynamic";

const PhaserGame = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
});

export default function GameShell() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-900 overflow-hidden">
      <PhaserGame />
    </div>
  );
}
