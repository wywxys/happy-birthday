"use client";

import type React from "react";

interface ParticleBurstProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ParticleBurst({ containerRef }: ParticleBurstProps) {
  return (
    <div
      ref={containerRef}
      className="particle-container pointer-events-none absolute inset-0"
    />
  );
}

export function burst(
  container: HTMLElement | null,
  x: number,
  y: number,
  count: number,
  colors: string[],
): void {
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const div = document.createElement("div");
    div.className = "particle";

    const dx = (Math.random() * 2 - 1) * 80;
    const dy = (Math.random() * 2 - 1) * 80;
    const color = colors[Math.floor(Math.random() * colors.length)];

    div.style.setProperty("--dx", `${dx}px`);
    div.style.setProperty("--dy", `${dy}px`);
    div.style.setProperty("--color", color);
    div.style.left = `${x}px`;
    div.style.bottom = `${y}px`;

    div.addEventListener("animationend", () => {
      div.remove();
    });

    container.appendChild(div);
  }
}
