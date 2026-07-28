"use client";

import { useCallback, useEffect, useRef } from "react";
import { CAKE_SPEED_BASE } from "../game/constants";

/**
 * 8-bit chiptune BGM hook.
 *
 * Generates a procedural looping birthday-themed melody using Web Audio API
 * square/triangle waves (classic NES/Game Boy feel). The playback tempo
 * increases proportionally with the game's current speed.
 */

// ─── Musical Data ────────────────────────────────────────────────────────────

// Note frequencies (Hz) — one octave around middle C
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
  // Lower octave for bass
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
  note: NoteName | null; // null = rest
  duration: number; // in beats (1 = quarter note)
}

// "Happy Birthday" melody adapted for 8-bit loop — key of C
const MELODY: MelodyNote[] = [
  // "Happy Birthday to you" (phrase 1)
  { note: "C4", duration: 0.75 },
  { note: "C4", duration: 0.25 },
  { note: "D4", duration: 1 },
  { note: "C4", duration: 1 },
  { note: "F4", duration: 1 },
  { note: "E4", duration: 2 },
  // "Happy Birthday to you" (phrase 2)
  { note: "C4", duration: 0.75 },
  { note: "C4", duration: 0.25 },
  { note: "D4", duration: 1 },
  { note: "C4", duration: 1 },
  { note: "G4", duration: 1 },
  { note: "F4", duration: 2 },
  // "Happy Birthday dear ..." (phrase 3)
  { note: "C4", duration: 0.75 },
  { note: "C4", duration: 0.25 },
  { note: "C5", duration: 1 },
  { note: "A4", duration: 1 },
  { note: "F4", duration: 1 },
  { note: "E4", duration: 1 },
  { note: "D4", duration: 1 },
  { note: null, duration: 0.5 },
  // "Happy Birthday to you" (phrase 4)
  { note: "Bb4", duration: 0.75 },
  { note: "Bb4", duration: 0.25 },
  { note: "A4", duration: 1 },
  { note: "F4", duration: 1 },
  { note: "G4", duration: 1 },
  { note: "F4", duration: 2 },
  // A little ending flourish
  { note: null, duration: 0.5 },
  { note: "C5", duration: 0.25 },
  { note: "E5", duration: 0.25 },
  { note: "G5", duration: 0.5 },
  { note: null, duration: 0.5 },
];

// Bass line accompaniment — simple root notes following the chord progression
const BASS: MelodyNote[] = [
  // F major context
  { note: "F2", duration: 2 },
  { note: "F2", duration: 2 },
  { note: "F2", duration: 2 },
  // C major
  { note: "C2", duration: 2 },
  { note: "C2", duration: 2 },
  { note: "C2", duration: 2 },
  // F → Bb
  { note: "F2", duration: 2 },
  { note: "F2", duration: 1 },
  { note: "Bb2", duration: 1 },
  { note: "F2", duration: 1.5 },
  { note: "G2", duration: 0.5 },
  // C → F ending
  { note: "C2", duration: 2 },
  { note: "F2", duration: 2 },
  { note: "C2", duration: 1 },
  { note: "F2", duration: 1 },
];

// Arpeggio pattern for sparkle layer (high pitched, quiet)
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

export function useBGM({ playing, muted, currentSpeed }: UseBGMOptions) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);

  // Track scheduling state for each voice
  const melodyNextRef = useRef(0); // audioContext time for next melody note
  const melodyIdxRef = useRef(0);
  const bassNextRef = useRef(0);
  const bassIdxRef = useRef(0);
  const arpNextRef = useRef(0);
  const arpIdxRef = useRef(0);

  // Tempo: base 120 BPM, scales with speed
  const getSecondsPerBeat = useCallback(() => {
    const speedRatio = currentSpeed / CAKE_SPEED_BASE;
    // Map speed 1.0→2.0 to BPM 120→180
    const bpm = 120 + (speedRatio - 1) * 60;
    return 60 / Math.min(bpm, 200); // cap at 200 BPM
  }, [currentSpeed]);

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

      // 8-bit style: snappy attack, slight sustain, quick release
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

  const startBGM = useCallback(() => {
    if (isPlayingRef.current) return;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.12, ctx.currentTime); // Keep BGM quiet so SFX stand out
      master.connect(ctx.destination);
      masterGainRef.current = master;

      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime + 0.1;
      melodyNextRef.current = now;
      bassNextRef.current = now;
      arpNextRef.current = now;
      melodyIdxRef.current = 0;
      bassIdxRef.current = 0;
      arpIdxRef.current = 0;

      // Schedule ahead in a loop (look-ahead scheduler pattern)
      const LOOK_AHEAD = 0.3; // seconds to schedule ahead

      schedulerRef.current = setInterval(() => {
        const ctx2 = ctxRef.current;
        const master2 = masterGainRef.current;
        if (!ctx2 || !master2) return;

        const secPerBeat = getSecondsPerBeat();
        const scheduleUntil = ctx2.currentTime + LOOK_AHEAD;

        // Schedule melody (square wave — classic 8-bit lead)
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
              dur * 0.85, // slight staccato
              "square",
              0.35,
            );
          }

          melodyNextRef.current += dur;
          melodyIdxRef.current++;
        }

        // Schedule bass (triangle wave — deep 8-bit bass)
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

        // Schedule arpeggio sparkle (pulse/square at very low volume)
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
              0.08, // very quiet sparkle
            );
          }

          arpNextRef.current += dur;
          arpIdxRef.current++;
        }
      }, 100); // Check every 100ms

      isPlayingRef.current = true;
    } catch {
      /* Audio not available */
    }
  }, [getSecondsPerBeat, scheduleNote]);

  const stopBGM = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    masterGainRef.current = null;
    isPlayingRef.current = false;
  }, []);

  // Start/stop based on playing state
  useEffect(() => {
    if (playing && !muted) {
      startBGM();
    } else {
      stopBGM();
    }
    return () => stopBGM();
  }, [playing, muted, startBGM, stopBGM]);

  // Update volume based on mute
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        muted ? 0 : 0.12,
        ctxRef.current?.currentTime ?? 0,
      );
    }
  }, [muted]);
}
