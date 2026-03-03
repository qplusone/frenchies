import { Enemy } from './Enemy';

export class FeuilleFlotter extends Enemy {
  readonly enemyType = 'feuille_flotter';
  private floatOriginY: number = 0;
  private floatAmplitude: number = 24;
  private floatFrequency: number = 0.002;
  private floatStartTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'brouillard_blob', { hp: 1, speed: 20 });
    this.floatOriginY = y;
    this.setTint(0x7a9e7e); // green tint for leaf
    this.setScale(0.8);
    this.floatStartTime = scene.time.now;
  }

  initBehavior(properties: Record<string, unknown>): void {
    this.floatAmplitude = (properties.amplitude as number) || 24;
    this.floatFrequency = (properties.frequency as number) || 0.002;

    // Horizontal drift
    const driftDistance = (properties.driftDistance as number) || 30;
    this.scene.tweens.add({
      targets: this,
      x: this.x + driftDistance,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Sine wave vertical movement
    const elapsed = time - this.floatStartTime;
    this.y = this.floatOriginY + Math.sin(elapsed * this.floatFrequency) * this.floatAmplitude;
  }
}
