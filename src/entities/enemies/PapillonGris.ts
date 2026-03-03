import { Enemy } from './Enemy';

export class PapillonGris extends Enemy {
  readonly enemyType = 'papillon_gris';
  private pathPoints: { x: number; y: number }[] = [];
  private pathIndex: number = 0;
  private pathSpeed: number = 1500;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'brouillard_blob', { hp: 1, speed: 40 });
    this.setTint(0xaaaaaa); // grey tint
    this.setScale(0.75);
  }

  initBehavior(properties: Record<string, unknown>): void {
    const swoopWidth = (properties.swoopWidth as number) || 48;
    const swoopHeight = (properties.swoopHeight as number) || 32;
    this.pathSpeed = (properties.pathSpeed as number) || 1500;

    // Create bezier-like swoop path points
    this.pathPoints = [
      { x: this.x, y: this.y },
      { x: this.x + swoopWidth / 2, y: this.y + swoopHeight },
      { x: this.x + swoopWidth, y: this.y },
      { x: this.x + swoopWidth / 2, y: this.y - swoopHeight / 2 },
    ];

    this.followPath();
  }

  private followPath(): void {
    if (!this.active) return;

    const target = this.pathPoints[this.pathIndex];
    this.scene.tweens.add({
      targets: this,
      x: target.x,
      y: target.y,
      duration: this.pathSpeed / this.pathPoints.length,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.pathIndex = (this.pathIndex + 1) % this.pathPoints.length;
        this.followPath();
      },
    });
  }
}
