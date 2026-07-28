"use client";

import { useEffect, useRef } from "react";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../game/constants";

interface ParallaxBackgroundProps {
  scrolling: boolean;
  speedFactor?: number;
  score?: number;
  reducedMotion?: boolean;
}

const CLOUD_LAYERS = [
  { y: 100, speed: 18, opacity: 0.15, scale: 2.2 },
  { y: 260, speed: 35, opacity: 0.2, scale: 1.3 },
];

const STARS = Array.from({ length: 15 }, () => ({
  x: Math.random() * WORLD_WIDTH,
  y: Math.random() * (WORLD_HEIGHT * 0.45),
  size: 1 + Math.random() * 1.5,
  phase: Math.random() * Math.PI * 2,
}));

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  opacity: number,
) {
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#ffffff";
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.arc(16, -4, 14, 0, Math.PI * 2);
  ctx.arc(-16, -2, 13, 0, Math.PI * 2);
  ctx.arc(6, -12, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

export default function ParallaxBackground({
  scrolling,
  speedFactor = 1,
  score = 0,
  reducedMotion = false,
}: ParallaxBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const cloudOffsetsRef = useRef<number[]>(CLOUD_LAYERS.map(() => 0));
  const decorationsRef = useRef(
    ["🎈", "🎀", "⭐", "💫", "🎵"].map((emoji, i) => ({
      emoji,
      x: WORLD_WIDTH + i * 120 + Math.random() * 80,
      y: 50 + Math.random() * (WORLD_HEIGHT * 0.5),
      speed: 15 + Math.random() * 20,
      size: 14 + Math.random() * 8,
    })),
  );
  const lastScoreRef = useRef(-1);
  const cachedGradRef = useRef<CanvasGradient | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      timeRef.current += dt;

      const w = WORLD_WIDTH;
      const h = WORLD_HEIGHT;

      // Sky gradient — only rebuild when score changes
      if (lastScoreRef.current !== score || !cachedGradRef.current) {
        const progress = Math.min(score / 20, 1);
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        const topR = Math.round(70 - progress * 30);
        const topG = Math.round(178 - progress * 100);
        const topB = Math.round(192 + progress * 60);
        const botR = Math.round(60 + progress * 40);
        const botG = Math.round(95 - progress * 30);
        const botB = Math.round(160 + progress * 40);
        grad.addColorStop(0, `rgb(${topR},${topG},${topB})`);
        grad.addColorStop(1, `rgb(${botR},${botG},${botB})`);
        cachedGradRef.current = grad;
        lastScoreRef.current = score;
      }

      ctx.fillStyle = cachedGradRef.current;
      ctx.fillRect(0, 0, w, h);

      // Stars
      const starAlpha = Math.min(0.15 + (score / 20) * 0.5, 0.65);
      ctx.fillStyle = "#ffffff";
      for (const star of STARS) {
        const twinkle =
          0.5 + 0.5 * Math.sin(Math.floor(timeRef.current * 2) + star.phase);
        ctx.globalAlpha = starAlpha * twinkle;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
      ctx.globalAlpha = 1;

      // Parallax clouds
      if (!reducedMotion) {
        for (let i = 0; i < CLOUD_LAYERS.length; i++) {
          const layer = CLOUD_LAYERS[i];
          if (scrolling) {
            cloudOffsetsRef.current[i] -= layer.speed * speedFactor * dt;
          }
          const offset = cloudOffsetsRef.current[i];
          const spacing = 280 * layer.scale;
          const numClouds = 3;
          for (let j = 0; j < numClouds; j++) {
            let cx = (j * spacing + offset) % (numClouds * spacing);
            if (cx < -50 * layer.scale) cx += numClouds * spacing;
            drawCloud(ctx, cx, layer.y, layer.scale, layer.opacity);
          }
        }
      }

      // Floating emoji decorations — drawn every frame (after sky, before ground)
      if (!reducedMotion) {
        const decos = decorationsRef.current;
        for (const deco of decos) {
          if (scrolling) {
            deco.x -= deco.speed * speedFactor * dt;
            if (deco.x < -30) {
              deco.x = w + 30 + Math.random() * 60;
              deco.y = 50 + Math.random() * (h * 0.5);
            }
          }
          ctx.font = `${deco.size}px serif`;
          ctx.globalAlpha = 0.2;
          ctx.fillText(deco.emoji, deco.x, deco.y);
        }
        ctx.globalAlpha = 1;
      }

      // Ground
      const groundTop = h * 0.85;
      ctx.fillStyle = "#5a3d12";
      ctx.fillRect(0, groundTop, w, h - groundTop);
      ctx.fillStyle = "#7a5020";
      ctx.fillRect(0, groundTop, w, 8);
      ctx.fillStyle = "#4a8c3f";
      ctx.fillRect(0, groundTop - 5, w, 10);
      ctx.fillStyle = "#6ab04c";
      ctx.fillRect(0, groundTop - 5, w, 4);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [scrolling, speedFactor, score, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      width={WORLD_WIDTH}
      height={WORLD_HEIGHT}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
