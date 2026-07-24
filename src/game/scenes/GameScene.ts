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
const CAKE_SPAWN_DELAY_MS = 1500;
const CAKE_VELOCITY_X = -200;
const CAKE_DISPLAY_SIZE = 50;
const CAKE_BODY_SIZE = 40;
const CAKE_OFFSCREEN_X = -60;

export class GameScene extends Phaser.Scene {
  private bird: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
  private cakeGroup!: Phaser.Physics.Arcade.Group;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private isGameOver = false;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    this.load.image(BIRD_TEXTURE_KEY, "/cloud.png");
    this.load.image(CAKE_TEXTURE_KEY, "/cake.png");
  }

  create(): void {
    const x = this.scale.width * 0.1;
    const y = this.scale.height * 0.5;
    const bird = this.physics.add.sprite(x, y, BIRD_TEXTURE_KEY);

    bird.setDisplaySize(BIRD_DISPLAY_WIDTH, BIRD_DISPLAY_HEIGHT);
    bird.body.setSize(BIRD_BODY_WIDTH, BIRD_BODY_HEIGHT);
    bird.setCollideWorldBounds(true);
    bird.body.setGravityY(BIRD_GRAVITY_Y);
    bird.body.onWorldBounds = true;
    this.bird = bird;

    this.input.on("pointerdown", () => this.jump());
    this.input.keyboard
      ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      .on("down", () => this.jump());

    this.physics.world.on(
      "worldbounds",
      (body: Phaser.Physics.Arcade.Body, _up: boolean, down: boolean) => {
        if (down && body === bird.body && !this.isGameOver) {
          this.gameOver();
        }
      },
    );

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

    this.spawnTimer = this.time.addEvent({
      delay: CAKE_SPAWN_DELAY_MS,
      callback: this.spawnCake,
      callbackScope: this,
      loop: true,
    });

    this.add.text(this.scale.width / 2, this.scale.height * 0.3, "点击屏幕开始", {
      fontSize: "24px",
      color: "#ffffff",
    }).setOrigin(0.5);

    EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
  }

  update(): void {
    if (this.isGameOver) {
      return;
    }

    this.cakeGroup.getChildren().forEach((child) => {
      const cake = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (cake.x < CAKE_OFFSCREEN_X) {
        cake.destroy();
      }
    });
  }

  private jump(): void {
    const bird = this.bird;

    if (this.isGameOver || bird === undefined) {
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
    if (this.isGameOver) {
      return;
    }

    const x = this.scale.width + CAKE_DISPLAY_SIZE;
    const minY = this.scale.height * 0.15;
    const maxY = this.scale.height * 0.75;
    const y = Phaser.Math.Between(minY, maxY);

    const cake = this.cakeGroup.create(
      x,
      y,
      CAKE_TEXTURE_KEY,
    ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cake.setDisplaySize(CAKE_DISPLAY_SIZE, CAKE_DISPLAY_SIZE);
    cake.body.setSize(CAKE_BODY_SIZE, CAKE_BODY_SIZE);
    cake.setVelocityX(CAKE_VELOCITY_X);
    cake.setData("passed", false);

    this.tweens.add({
      targets: cake,
      angle: 360,
      duration: 2000,
      repeat: -1,
    });
  }

  private gameOver(): void {
    const bird = this.bird;

    if (bird === undefined) {
      return;
    }

    this.isGameOver = true;
    this.spawnTimer.destroy();
    this.physics.pause();
    bird.setTint(0xff0000);
    EventBus.emit(GameEvents.GAME_OVER, { score: 0 });
  }
}
