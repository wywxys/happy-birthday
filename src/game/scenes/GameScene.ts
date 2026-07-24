import Phaser from "phaser";
import { EventBus, GameEvents } from "../EventBus";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    console.log("GameScene preload started");
  }

  create() {
    this.add.text(400, 300, "Phaser Ready", {
      fontSize: "32px",
      color: "#fff",
    }).setOrigin(0.5);

    EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
  }
}
