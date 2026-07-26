"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { MAX_DT } from "../game/constants";

export function useGameLoop(
  callback: (dt: number) => void,
  active: boolean,
  paused: boolean,
): void {
  const cbRef = useRef(callback);
  const pausedRef = useRef(paused);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  // useLayoutEffect: write refs BEFORE paint — not "during render" (React Compiler safe)
  useLayoutEffect(() => {
    cbRef.current = callback;
  });
  useLayoutEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!active) return;
    lastTsRef.current = 0; // reset so first dt is ~0
    const loop = (ts: number) => {
      const dt = Math.min((ts - (lastTsRef.current || ts)) / 1000, MAX_DT);
      lastTsRef.current = ts; // ALWAYS update, even when paused (no post-pause lurch)
      if (!pausedRef.current) cbRef.current(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
}
