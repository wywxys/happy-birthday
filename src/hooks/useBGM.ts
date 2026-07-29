"use client";

import { useCallback, useEffect, useRef } from "react";
import { CAKE_SPEED_BASE } from "../game/constants";

/**
 * 8-bit chiptune BGM hook.
 *
 * Generates a procedural looping birthday-themed melody using Web Audio API
 * square/triangle waves (classic NES/Game Boy feel). The playback tempo
 * increases proportionally with the game's current speed.
 *
 * Robustness (v2 — fixes tab-switch / refresh / autoplay-policy "silent BGM"):
 *   1. AudioContext lifecycle is treated as first-class. When the browser
 *      suspends the context (tab hidden, power saving, autoplay policy), we
 *      listen on visibilitychange / pageshow / focus / pointerdown / keydown /
 *      statechange and re-`resume()` it, then reset the schedule so we don't
 *      dump stale notes.
 *   2. Tempo changes (currentSpeed ramps) no longer tear down + recreate the
 *      AudioContext. `currentSpeed` is captured via ref; the scheduler reads
 *      the latest value on every tick without React re-running the effect.
 *   3. If the scheduler falls too far behind (throttled setInterval while tab
 *      hidden), we jump the schedule cursor forward to `ctx.currentTime` on
 *      resume instead of back-filling a burst of stale notes.
 */

// ─── Musical Data ────────────────────────────────────────────────────────────

const NOTE = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 784.0,
  C3: 130.81,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  C2: 65.41,
  F2: 87.31,
  G2: 98.0,
  Bb2: 116.54,
} as const;

type NoteName = keyof typeof NOTE;

interface MelodyNote {
  note: NoteName | null;
  duration: number;
}

const MELODY: MelodyNote[] = [
  { note: "C4", duration: 0.75 },
  { note: "C4", duration: 0.25 },
  { note: "D4", duration: 1 },
  { note: "C4", duration: 1 },
  { note: "F4", duration: 1 },
  { note: "E4", duration: 2 },
  { note: "C4", duration: 0.75 },
  { note: "C4", duration: 0.25 },
  { note: "D4", duration: 1 },
  { note: "C4", duration: 1 },
  { note: "G4", duration: 1 },
  { note: "F4", duration: 2 },
  { note: "C4", duration: 0.75 },
  { note: "C4", duration: 0.25 },
  { note: "C5", duration: 1 },
  { note: "A4", duration: 1 },
  { note: "F4", duration: 1 },
  { note: "E4", duration: 1 },
  { note: "D4", duration: 1 },
  { note: null, duration: 0.5 },
  { note: "Bb4", duration: 0.75 },
  { note: "Bb4", duration: 0.25 },
  { note: "A4", duration: 1 },
  { note: "F4", duration: 1 },
  { note: "G4", duration: 1 },
  { note: "F4", duration: 2 },
  { note: null, duration: 0.5 },
  { note: "C5", duration: 0.25 },
  { note: "E5", duration: 0.25 },
  { note: "G5", duration: 0.5 },
  { note: null, duration: 0.5 },
];

const BASS: MelodyNote[] = [
  { note: "F2", duration: 2 },
  { note: "F2", duration: 2 },
  { note: "F2", duration: 2 },
  { note: "C2", duration: 2 },
  { note: "C2", duration: 2 },
  { note: "C2", duration: 2 },
  { note: "F2", duration: 2 },
  { note: "F2", duration: 1 },
  { note: "Bb2", duration: 1 },
  { note: "F2", duration: 1.5 },
  { note: "G2", duration: 0.5 },
  { note: "C2", duration: 2 },
  { note: "F2", duration: 2 },
  { note: "C2", duration: 1 },
  { note: "F2", duration: 1 },
];

const ARPEGGIO: MelodyNote[] = [
  { note: "C5", duration: 0.25 },
  { note: "E5", duration: 0.25 },
  { note: "G5", duration: 0.25 },
  { note: "E5", duration: 0.25 },
  { note: "F5", duration: 0.25 },
  { note: "A4", duration: 0.25 },
  { note: "C5", duration: 0.25 },
  { note: "A4", duration: 0.25 },
  { note: "G4", duration: 0.25 },
  { note: "B4", duration: 0.25 },
  { note: "D5", duration: 0.25 },
  { note: "B4", duration: 0.25 },
  { note: "F4", duration: 0.25 },
  { note: "A4", duration: 0.25 },
  { note: "C5", duration: 0.25 },
  { note: "A4", duration: 0.25 },
];

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseBGMOptions {
  playing: boolean;
  muted: boolean;
  /** Current game speed in px/s */
  currentSpeed: number;
}

const BGM_VOLUME = 0.12;
const LOOK_AHEAD = 0.3; // seconds
const SCHEDULE_INTERVAL_MS = 100;
/** If a voice's next-note time has fallen this far behind now, reset it to now. */
const CATCHUP_THRESHOLD = 0.1;

export function useBGM({ playing, muted, currentSpeed }: UseBGMOptions) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);

  // Speed via ref — reading this in the scheduler does NOT re-run the effect,
  // so tempo ramps never tear down the AudioContext.
  const currentSpeedRef = useRef(currentSpeed);
  useEffect(() => {
    currentSpeedRef.current = currentSpeed;
  }, [currentSpeed]);

  // Track scheduling state for each voice
  const melodyNextRef = useRef(0);
  const melodyIdxRef = useRef(0);
  const bassNextRef = useRef(0);
  const bassIdxRef = useRef(0);
  const arpNextRef = useRef(0);
  const arpIdxRef = useRef(0);

  // Read tempo from ref (never memoized on currentSpeed)
  const getSecondsPerBeat = useCallback(() => {
    const speedRatio = currentSpeedRef.current / CAKE_SPEED_BASE;
    const bpm = 120 + (speedRatio - 1) * 60;
    return 60 / Math.min(bpm, 200);
  }, []);

  const scheduleNote = useCallback(
    (
      ctx: AudioContext,
      master: GainNode,
      freq: number,
      startTime: number,
      durSec: number,
      type: OscillatorType,
      volume: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      const attack = 0.008;
      const release = Math.min(0.05, durSec * 0.2);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + attack);
      gain.gain.setValueAtTime(volume, startTime + durSec - release);
      gain.gain.linearRampToValueAtTime(0, startTime + durSec);

      osc.connect(gain);
      gain.connect(master);

      osc.start(startTime);
      osc.stop(startTime + durSec + 0.01);
    },
    [],
  );

  // Reset the schedule cursor for all three voices to `now`. Prevents the
  // "burst of stale notes" that happens when the tab is unhidden after
  // browser-throttled setInterval fell behind ctx.currentTime.
  const resetScheduleToNow = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime + 0.05;
    melodyNextRef.current = now;
    bassNextRef.current = now;
    arpNextRef.current = now;
  }, []);

  /**
   * Ensure the audio context is running. Called from user gestures and
   * page-visible/focus/statechange events. Idempotent and safe to call
   * whenever we can't be sure the context is still alive.
   */
  const ensureRunning = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state === "closed") return;
    if (ctx.state === "suspended") {
      // Fire-and-forget resume. Reset schedule so we don't backfill.
      ctx.resume().then(
        () => resetScheduleToNow(ctx),
        () => {
          /* resume rejected — likely no user gesture yet, will retry on next event */
        },
      );
    }
  }, [resetScheduleToNow]);

  const startBGM = useCallback(() => {
    if (isPlayingRef.current) return;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(BGM_VOLUME, ctx.currentTime);
      master.connect(ctx.destination);
      masterGainRef.current = master;

      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {
          /* will retry via ensureRunning() on next user gesture */
        });
      }

      resetScheduleToNow(ctx);
      melodyIdxRef.current = 0;
      bassIdxRef.current = 0;
      arpIdxRef.current = 0;

      schedulerRef.current = setInterval(() => {
        const ctx2 = ctxRef.current;
        const master2 = masterGainRef.current;
        if (!ctx2 || !master2) return;

        // Don't schedule notes into a suspended context — they'd all pile up
        // as "past" events once it resumes, causing an audible burst.
        if (ctx2.state !== "running") return;

        const secPerBeat = getSecondsPerBeat();
        const now = ctx2.currentTime;
        const scheduleUntil = now + LOOK_AHEAD;

        // Catch-up guard: if a voice cursor has fallen far behind now (e.g.
        // long JS blocking or throttled timer while hidden), skip forward
        // instead of back-filling. Loses continuity for one frame but avoids
        // the "sudden 20-note dump" symptom.
        if (melodyNextRef.current < now - CATCHUP_THRESHOLD)
          melodyNextRef.current = now + 0.02;
        if (bassNextRef.current < now - CATCHUP_THRESHOLD)
          bassNextRef.current = now + 0.02;
        if (arpNextRef.current < now - CATCHUP_THRESHOLD)
          arpNextRef.current = now + 0.02;

        // Melody (square lead)
        while (melodyNextRef.current < scheduleUntil) {
          const idx = melodyIdxRef.current % MELODY.length;
          const n = MELODY[idx];
          const dur = n.duration * secPerBeat;
          if (n.note !== null) {
            scheduleNote(
              ctx2,
              master2,
              NOTE[n.note],
              melodyNextRef.current,
              dur * 0.85,
              "square",
              0.35,
            );
          }
          melodyNextRef.current += dur;
          melodyIdxRef.current++;
        }

        // Bass (triangle)
        while (bassNextRef.current < scheduleUntil) {
          const idx = bassIdxRef.current % BASS.length;
          const n = BASS[idx];
          const dur = n.duration * secPerBeat;
          if (n.note !== null) {
            scheduleNote(
              ctx2,
              master2,
              NOTE[n.note],
              bassNextRef.current,
              dur * 0.9,
              "triangle",
              0.5,
            );
          }
          bassNextRef.current += dur;
          bassIdxRef.current++;
        }

        // Arpeggio sparkle (quiet square)
        while (arpNextRef.current < scheduleUntil) {
          const idx = arpIdxRef.current % ARPEGGIO.length;
          const n = ARPEGGIO[idx];
          const dur = n.duration * secPerBeat;
          if (n.note !== null) {
            scheduleNote(
              ctx2,
              master2,
              NOTE[n.note],
              arpNextRef.current,
              dur * 0.6,
              "square",
              0.08,
            );
          }
          arpNextRef.current += dur;
          arpIdxRef.current++;
        }
      }, SCHEDULE_INTERVAL_MS);

      // Auto-recover if the context transitions to suspended
      const onStateChange = () => {
        if (ctx.state === "running") resetScheduleToNow(ctx);
        // If it became "suspended", ensureRunning() will pick it up on the
        // next user gesture or visibility event.
      };
      ctx.addEventListener("statechange", onStateChange);
      // stash the listener remover on the context so stopBGM can clean it up
      // biome-ignore lint/suspicious/noExplicitAny: side-channel cleanup handle
      (ctx as any).__hbCleanup = () => {
        ctx.removeEventListener("statechange", onStateChange);
      };

      isPlayingRef.current = true;
    } catch {
      /* Audio not available */
    }
  }, [getSecondsPerBeat, scheduleNote, resetScheduleToNow]);

  const stopBGM = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    if (ctxRef.current) {
      // biome-ignore lint/suspicious/noExplicitAny: side-channel cleanup handle
      const cleanup = (ctxRef.current as any).__hbCleanup as
        | (() => void)
        | undefined;
      cleanup?.();
      void ctxRef.current.close().catch(() => {
        /* ignore — context may already be closing */
      });
      ctxRef.current = null;
    }
    masterGainRef.current = null;
    isPlayingRef.current = false;
  }, []);

  // Start/stop based on playing/muted. Note: currentSpeed is intentionally
  // NOT in this dep list — it's captured via ref so tempo ramps don't tear
  // down the AudioContext.
  useEffect(() => {
    if (playing && !muted) {
      startBGM();
    } else {
      stopBGM();
    }
    return () => stopBGM();
  }, [playing, muted, startBGM, stopBGM]);

  // Recovery listeners — resume the context on any hint of user activity or
  // returning-visibility. Only attach while we want BGM playing.
  useEffect(() => {
    if (!playing || muted) return;

    const onVisibility = () => {
      if (!document.hidden) ensureRunning();
    };
    const onShow = () => ensureRunning();
    const onFocus = () => ensureRunning();
    const onPointer = () => ensureRunning();
    const onKey = () => ensureRunning();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onShow);
    window.addEventListener("focus", onFocus);
    // Capture phase + passive so we don't interfere with game handlers
    window.addEventListener("pointerdown", onPointer, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", onKey, { capture: true });

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pointerdown", onPointer, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, [playing, muted, ensureRunning]);

  // Update volume when mute changes (without recreating context)
  useEffect(() => {
    if (masterGainRef.current && ctxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        muted ? 0 : BGM_VOLUME,
        ctxRef.current.currentTime,
      );
    }
  }, [muted]);
}
