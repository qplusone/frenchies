import Phaser from 'phaser';

export abstract class Collectible extends Phaser.Physics.Arcade.Sprite {
  abstract readonly collectibleType: string;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    // Gentle bob animation
    scene.tweens.add({
      targets: this,
      y: y - 3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  collect(): void {
    // Sparkle effect
    const particles = this.scene.add.particles(this.x, this.y, 'pixel', {
      speed: { min: 20, max: 60 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      quantity: 6,
      emitting: false,
    });
    particles.explode();
    this.scene.time.delayedCall(400, () => particles.destroy());

    this.onCollect();
    this.destroy();
  }

  abstract onCollect(): void;
}
