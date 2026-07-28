"use client";

import { memo } from "react";
import { BIRD_HEIGHT, BIRD_LEFT, BIRD_WIDTH } from "../../game/constants";

interface BirdTrailProps {
  /** Current bird bottom position */
  birdBottom: number;
  /** Reduced motion preference */
  reducedMotion?: boolean;
}

/**
 * Lightweight bird trail — a single CSS-animated glow element
 * that follows the bird with a slight delay via CSS transition.
 * No React state updates, no intervals.
 */
function BirdTrailInner({ birdBottom, reducedMotion }: BirdTrailProps) {
  if (reducedMotion) return null;

  return (
    <div
      className="absolute pointer-events-none z-[1] rounded-full"
      style={{
        left: `${BIRD_LEFT + BIRD_WIDTH / 2 - 10}px`,
        bottom: `${birdBottom + BIRD_HEIGHT / 2 - 10}px`,
        width: "20px",
        height: "20px",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
        transition: "bottom 0.1s linear",
        opacity: 0.6,
      }}
    />
  );
}

export const BirdTrail = memo(BirdTrailInner);
