"use client";
import { useCallback, useEffect, useRef } from "react";
import { usePersistedNumber } from "./usePersisted";
import { MUTED_STORAGE_KEY } from "../game/constants";
import type { CakeKind } from "../game/types";

export function useSoundEffects(): SfxApi {
  const [mutedNum, setMutedNum] = usePersistedNumber(MUTED_STORAGE_KEY, 0);
  const muted = mutedNum !== 0;

  const ctxRef = useRef<AudioContext | null>(null);
  const playCountRef = useRef(0);

  useEffect(() => {
    if (typeof AudioContext === "undefined") return;
    try {
      ctxRef.current = new AudioContext();
    } catch {
      /* ignore — user may have denied audio */
    }
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  const tone = useCallback(
    (
      type: OscillatorType,
      freqStart: number,
      freqEnd: number,
      durMs: number,
      delayMs = 0,
    ) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const startTime = ctx.currentTime + delayMs / 1000;
      const durSec = durMs / 1000;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, startTime);
      osc.frequency.linearRampToValueAtTime(freqEnd, startTime + durSec);

      // Short attack + decay envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.005);
      gain.gain.linearRampToValueAtTime(0, startTime + durSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + durSec);
    },
    [],
  );

  const jump = useCallback(() => {
    playCountRef.current += 1;
    if (muted || !ctxRef.current) return;
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    tone("square", 600, 800, 60);
  }, [muted, tone]);

  const eat = useCallback(
    (kind?: CakeKind) => {
      playCountRef.current += 1;
      if (muted || !ctxRef.current) return;
      if (ctxRef.current.state === "suspended") {
        void ctxRef.current.resume();
      }
      tone("triangle", 900, 900, 200);
      if (kind === "golden") {
        tone("triangle", 1320, 1320, 200);
      }
    },
    [muted, tone],
  );

  const gameover = useCallback(() => {
    playCountRef.current += 1;
    if (muted || !ctxRef.current) return;
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    tone("sawtooth", 400, 100, 500);
  }, [muted, tone]);

  const victory = useCallback(() => {
    playCountRef.current += 1;
    if (muted || !ctxRef.current) return;
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    tone("triangle", 660, 660, 150, 0);
    tone("triangle", 880, 880, 150, 150);
    tone("triangle", 1320, 1320, 150, 300);
  }, [muted, tone]);

  const setMuted = useCallback(
    (m: boolean) => {
      setMutedNum(m ? 1 : 0);
    },
    [setMutedNum],
  );

  return {
    jump,
    eat,
    gameover,
    victory,
    setMuted,
    muted,
    get playCount() {
      return playCountRef.current;
    },
  };
}
