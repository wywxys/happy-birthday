import Phaser from "phaser";

export class BackgroundScene extends Phaser.Scene {
  private cloudsFar!: Phaser.GameObjects.TileSprite;
  private cloudsMid!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.TileSprite;

  constructor() {
    super("BackgroundScene");
  }

  create(): void {
    const { width, height } = this.scale;

    const skyKey = "sky-gradient";
    if (!this.textures.exists(skyKey)) {
      const skyCanvas = this.textures.createCanvas(skyKey, width, height);
      if (skyCanvas) {
        const ctx = skyCanvas.getContext();
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "#46b2c0");
        grad.addColorStop(0.5, "#3c5fa0");
        grad.addColorStop(1, "#2a1f5e");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        skyCanvas.refresh();
      }
    }
    this.add.image(width / 2, height / 2, skyKey).setDepth(-10);

    const farKey = "clouds-far";
    if (!this.textures.exists(farKey)) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff, 0.3);
      gfx.fillEllipse(50, 30, 80, 40);
      gfx.fillEllipse(150, 40, 100, 50);
      gfx.fillEllipse(280, 35, 70, 35);
      gfx.fillEllipse(380, 45, 90, 45);
      gfx.generateTexture(farKey, 450, 80);
      gfx.destroy();
    }
    this.cloudsFar = this.add.tileSprite(
      width / 2,
      height * 0.12,
      width,
      80,
      farKey,
    );
    this.cloudsFar.setDepth(-8);

    const midKey = "clouds-mid";
    if (!this.textures.exists(midKey)) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff, 0.35);
      gfx.fillEllipse(60, 35, 100, 50);
      gfx.fillEllipse(200, 40, 120, 60);
      gfx.fillEllipse(350, 30, 80, 40);
      gfx.generateTexture(midKey, 420, 80);
      gfx.destroy();
    }
    this.cloudsMid = this.add.tileSprite(
      width / 2,
      height * 0.28,
      width,
      80,
      midKey,
    );
    this.cloudsMid.setDepth(-7);

    const groundKey = "ground-tile";
    const groundH = Math.floor(height * 0.15);
    if (!this.textures.exists(groundKey)) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0x4a8c3f);
      gfx.fillRect(0, 0, width, 5);
      gfx.fillStyle(0x835511);
      gfx.fillRect(0, 5, width, groundH - 5);
      gfx.generateTexture(groundKey, width, groundH);
      gfx.destroy();
    }
    this.ground = this.add.tileSprite(
      width / 2,
      height - groundH / 2,
      width,
      groundH,
      groundKey,
    );
    this.ground.setDepth(-5);
  }

  update(_time: number, delta: number): void {
    const speed = delta * 0.05;
    this.cloudsFar.tilePositionX += speed * 0.3;
    this.cloudsMid.tilePositionX += speed * 0.6;
    this.ground.tilePositionX += speed;
  }
}
