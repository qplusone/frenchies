import { Enemy } from './Enemy';

export class BrouillardBlob extends Enemy {
  readonly enemyType = 'brouillard_blob';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'brouillard_blob', { hp: 1, speed: 30 });
  }

  initBehavior(properties: Record<string, unknown>): void {
    const patrolDistance = (properties.patrolDistance as number) || 40;

    this.scene.tweens.add({
      targets: this,
      x: this.x + patrolDistance,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
