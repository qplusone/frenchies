import { Enemy } from './Enemy';

export class PluieSprite extends Enemy {
  readonly enemyType = 'pluie_sprite';
  private spawnX: number;
  private spawnY: number;
  private respawnDelay: number = 3000;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'brouillard_blob', { hp: 1, speed: 60 });
    this.spawnX = x;
    this.spawnY = y;
    this.setTint(0x6b9dab); // blue tint for rain
    this.setScale(0.7);
  }

  initBehavior(properties: Record<string, unknown>): void {
    this.respawnDelay = (properties.respawnDelay as number) || 3000;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setGravityY(100);
    body.setImmovable(false);

    // Check when off-screen to respawn
    this.scene.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (this.active && this.y > this.scene.cameras.main.getBounds().bottom + 32) {
          this.respawn();
        }
      },
    });
  }

  private respawn(): void {
    this.setPosition(this.spawnX, this.spawnY);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }
}
