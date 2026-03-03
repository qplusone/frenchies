import { Enemy } from './Enemy';

export class NuageNoir extends Enemy {
  readonly enemyType = 'nuage_noir';
  private fireInterval: number = 2000;
  private lightningGroup: Phaser.Physics.Arcade.Group | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'brouillard_blob', { hp: 2, speed: 0 });
    this.setTint(0x444466); // dark purple-grey
    this.setScale(1.3);
  }

  initBehavior(properties: Record<string, unknown>): void {
    this.fireInterval = (properties.fireInterval as number) || 2000;

    this.lightningGroup = this.scene.physics.add.group();

    // Fire lightning at intervals
    this.scene.time.addEvent({
      delay: this.fireInterval,
      loop: true,
      callback: () => {
        if (this.active) {
          this.fireLightning();
        }
      },
    });
  }

  private fireLightning(): void {
    if (!this.lightningGroup) return;

    // Flash warning
    this.setTint(0xffff00);
    this.scene.time.delayedCall(300, () => {
      if (!this.active) return;
      this.setTint(0x444466);

      // Spawn lightning bolt below
      const bolt = this.lightningGroup!.create(this.x, this.y + 8, 'pixel');
      bolt.setTint(0xffff44);
      bolt.setScale(1, 3);
      const boltBody = bolt.body as Phaser.Physics.Arcade.Body;
      boltBody.setAllowGravity(false);
      boltBody.setVelocityY(150);

      // Destroy after short lifespan
      this.scene.time.delayedCall(800, () => {
        if (bolt.active) bolt.destroy();
      });
    });
  }

  getLightningGroup(): Phaser.Physics.Arcade.Group | null {
    return this.lightningGroup;
  }
}
