import Phaser from "phaser";

export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  SCORE_UPDATE: "score-update",
  GAME_OVER: "game-over",
  GAME_START: "game-start",
  GAME_STATE_CHANGE: "game-state-change",
  VICTORY: "victory",
  CURRENT_SCENE_READY: "current-scene-ready",
} as const;

export type GameEventType = (typeof GameEvents)[keyof typeof GameEvents];
