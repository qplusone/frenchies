import { Enemy } from './Enemy';

export class PierreRoulante extends Enemy {
  readonly enemyType = 'pierre_roulante';
  private direction: number = 1;
  private rollSpeed: number = 50;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'brouillard_blob', { hp: 2, speed: 50 });
    this.setTint(0x999999); // stone grey
  }

  initBehavior(properties: Record<string, unknown>): void {
    this.rollSpeed = (properties.speed as number) || 50;
    this.direction = (properties.direction as number) || 1;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setImmovable(false);
    body.setVelocityX(this.rollSpeed * this.direction);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Reverse direction at edges (check if blocked)
    if (body.blocked.left) {
      this.direction = 1;
      body.setVelocityX(this.rollSpeed);
    } else if (body.blocked.right) {
      this.direction = -1;
      body.setVelocityX(-this.rollSpeed);
    }

    // Roll animation (rotation)
    this.rotation += delta * 0.005 * this.direction;
  }
}
