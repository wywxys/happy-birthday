import Phaser from "phaser";
import { EventBus, GameEvents } from "../EventBus";

const BIRD_TEXTURE_KEY = "bird";
const BIRD_GRAVITY_Y = 800;
const BIRD_JUMP_VELOCITY_Y = -350;
const BIRD_DISPLAY_WIDTH = 60;
const BIRD_DISPLAY_HEIGHT = 45;
const BIRD_BODY_WIDTH = 50;
const BIRD_BODY_HEIGHT = 35;
const CAKE_TEXTURE_KEY = "cake";
const CAKE_DISPLAY_SIZE = 50;
const CAKE_BODY_SIZE = 40;
const CAKE_OFFSCREEN_X = -60;

enum GameState {
  IDLE = "idle",
  PLAYING = "playing",
  GAME_OVER = "game_over",
  VICTORY = "victory",
}

type ArcadeOverlapObject =
  | Phaser.Physics.Arcade.Body
  | Phaser.Physics.Arcade.StaticBody
  | Phaser.Tilemaps.Tile
  | Phaser.Types.Physics.Arcade.GameObjectWithBody;

export class GameScene extends Phaser.Scene {
  private bird: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
  private cakeGroup!: Phaser.Physics.Arcade.Group;
  private spawnTimer: Phaser.Time.TimerEvent | undefined;
  private startText: Phaser.GameObjects.Text | undefined;
  private gameState: GameState = GameState.IDLE;
  private score = 0;
  private victoryThreshold = 20;
  private currentSpeed = 200;
  private currentDelay = 1500;
  private readonly baseSpeed = 200;
  private readonly baseDelay = 1500;
  private readonly speedIncrement = 20;
  private readonly delayDecrement = 100;
  private readonly maxSpeed = 400;
  private readonly minDelay = 800;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    this.load.image(BIRD_TEXTURE_KEY, "/cloud.png");
    this.load.image(CAKE_TEXTURE_KEY, "/cake.png");
  }

  create(): void {
    this.resetState();
    this.physics.resume();

    const x = this.scale.width * 0.1;
    const y = this.scale.height * 0.5;
    const bird = this.physics.add.sprite(x, y, BIRD_TEXTURE_KEY);

    bird.setDisplaySize(BIRD_DISPLAY_WIDTH, BIRD_DISPLAY_HEIGHT);
    bird.body.setSize(BIRD_BODY_WIDTH, BIRD_BODY_HEIGHT);
    bird.setCollideWorldBounds(true);
    bird.body.setGravityY(0);
    bird.body.onWorldBounds = true;
    this.bird = bird;

    this.input.on("pointerdown", () => this.handleAction());
    this.input.keyboard
      ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      .on("down", () => this.handleAction());

    this.physics.world.off("worldbounds", this.handleWorldBounds, this);
    this.physics.world.on("worldbounds", this.handleWorldBounds, this);

    this.tweens.add({
      targets: bird,
      angle: { from: -10, to: 10 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.cakeGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.physics.add.overlap(bird, this.cakeGroup, this.eatCake, undefined, this);

    this.startText = this.add
      .text(this.scale.width / 2, this.scale.height * 0.3, "点击屏幕开始", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    EventBus.off("restart-game", this.restartGame, this);
    EventBus.on("restart-game", this.restartGame, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off("restart-game", this.restartGame, this);
      this.physics.world.off("worldbounds", this.handleWorldBounds, this);
    });

    EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
  }

  update(): void {
    const bird = this.bird;

    if (this.gameState !== GameState.PLAYING || bird === undefined) {
      return;
    }

    this.cakeGroup.getChildren().forEach((child) => {
      const cake = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (
        cake.active &&
        !cake.getData("passed") &&
        cake.x < bird.x - bird.width / 2
      ) {
        cake.setData("passed", true);
        this.gameOver();
        return;
      }

      if (cake.x < CAKE_OFFSCREEN_X) {
        cake.destroy();
      }
    });
  }

  private resetState(): void {
    this.gameState = GameState.IDLE;
    this.score = 0;
    this.currentSpeed = this.baseSpeed;
    this.currentDelay = this.baseDelay;
    this.spawnTimer = undefined;
    this.startText = undefined;
  }

  private handleAction(): void {
    switch (this.gameState) {
      case GameState.IDLE:
        this.startGame();
        return;
      case GameState.PLAYING:
        this.jump();
        return;
      case GameState.GAME_OVER:
      case GameState.VICTORY:
        return;
    }
  }

  private startGame(): void {
    const bird = this.bird;

    if (bird === undefined) {
      return;
    }

    this.gameState = GameState.PLAYING;
    bird.body.setGravityY(BIRD_GRAVITY_Y);
    this.startText?.setVisible(false);
    this.spawnTimer = this.time.addEvent({
      delay: this.currentDelay,
      callback: this.spawnCake,
      callbackScope: this,
      loop: true,
    });
    EventBus.emit(GameEvents.GAME_START);
  }

  private jump(): void {
    const bird = this.bird;

    if (this.gameState !== GameState.PLAYING || bird === undefined) {
      return;
    }

    bird.setVelocityY(BIRD_JUMP_VELOCITY_Y);
    this.tweens.add({
      targets: bird,
      angle: -20,
      duration: 150,
      ease: "Power2",
    });
  }

  private spawnCake(): void {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }

    const x = this.scale.width + CAKE_DISPLAY_SIZE;
    const minY = this.scale.height * 0.15;
    const maxY = this.scale.height * 0.75;
    const y = Phaser.Math.Between(minY, maxY);

    const cake = this.cakeGroup.create(x, y, CAKE_TEXTURE_KEY) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cake.setDisplaySize(CAKE_DISPLAY_SIZE, CAKE_DISPLAY_SIZE);
    cake.body.setSize(CAKE_BODY_SIZE, CAKE_BODY_SIZE);
    cake.setVelocityX(-this.currentSpeed);
    cake.setData("passed", false);

    this.tweens.add({
      targets: cake,
      angle: 360,
      duration: 2000,
      repeat: -1,
    });
  }

  private eatCake(_bird: ArcadeOverlapObject, cakeObj: ArcadeOverlapObject): void {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }

    const cake = cakeObj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cake.destroy();
    this.score++;
    EventBus.emit(GameEvents.SCORE_UPDATE, this.score);

    if (this.score >= this.victoryThreshold) {
      this.victory();
      return;
    }

    if (this.score % 5 === 0) {
      this.increaseDifficulty();
    }
  }

  private increaseDifficulty(): void {
    this.currentSpeed = Math.min(this.currentSpeed + this.speedIncrement, this.maxSpeed);
    this.currentDelay = Math.max(this.currentDelay - this.delayDecrement, this.minDelay);

    if (this.spawnTimer !== undefined) {
      this.spawnTimer.reset({
        delay: this.currentDelay,
        callback: this.spawnCake,
        callbackScope: this,
        loop: true,
      });
    }
  }

  private gameOver(): void {
    const bird = this.bird;

    if (this.gameState !== GameState.PLAYING || bird === undefined) {
      return;
    }

    this.gameState = GameState.GAME_OVER;
    this.spawnTimer?.destroy();
    this.physics.pause();
    bird.setTint(0xff0000);
    EventBus.emit(GameEvents.GAME_OVER, { score: this.score });
  }

  private victory(): void {
    this.gameState = GameState.VICTORY;
    this.spawnTimer?.destroy();
    this.physics.pause();
    EventBus.emit(GameEvents.VICTORY, { score: this.score, time: this.time.now });
  }

  private handleWorldBounds(body: Phaser.Physics.Arcade.Body, _up: boolean, down: boolean): void {
    if (
      down &&
      body.gameObject === this.bird &&
      this.gameState === GameState.PLAYING
    ) {
      this.gameOver();
    }
  }

  private restartGame(): void {
    this.scene.restart();
  }
}
