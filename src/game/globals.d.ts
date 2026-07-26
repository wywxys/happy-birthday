import type { Dispatch } from "react";
import type { CakeKind, GameAction, GameState } from "./types";
declare global {
  interface SfxApi {
    jump: () => void;
    eat: (kind?: CakeKind) => void;
    gameover: () => void;
    victory: () => void;
    setMuted: (m: boolean) => void;
    muted: boolean;
    playCount: number;
  }
  interface GameDebug {
    dispatch: Dispatch<GameAction>;
    getState: () => GameState;
    forceEat: (cakeId: number) => void;
    forceScore: (score: number, cakesEaten: number) => void;
    forceGameover: () => void;
    forceVictory: () => void;
    sfx: SfxApi;
  }
  interface Window {
    __gameDebug?: GameDebug;
    __sfxProbe?: SfxApi;
  }
}
