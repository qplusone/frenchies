import Phaser from 'phaser';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  damage: number;
  speed: number;
  pointValue: number;

  abstract readonly enemyType: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: { hp?: number; damage?: number; speed?: number; points?: number } = {},
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = config.hp ?? 1;
    this.damage = config.damage ?? 1;
    this.speed = config.speed ?? 30;
    this.pointValue = config.points ?? 10;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  takeDamage(amount: number = 1): void {
    this.hp -= amount;

    // Flash white
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.defeat();
    }
  }

  defeat(): void {
    // Defeat animation — puff effect
    const particles = this.scene.add.particles(this.x, this.y, 'pixel', {
      speed: { min: 30, max: 80 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: 8,
      tint: 0x888888,
      emitting: false,
    });
    particles.explode();
    this.scene.time.delayedCall(500, () => particles.destroy());

    this.destroy();
  }

  abstract initBehavior(properties: Record<string, unknown>): void;
}
