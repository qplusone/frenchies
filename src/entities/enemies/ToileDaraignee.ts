import { Enemy } from './Enemy';
import { Player } from '../Player';

export class ToileDaraignee extends Enemy {
  readonly enemyType = 'toile_daraignee';
  private slowFactor: number = 0.4;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'brouillard_blob', { hp: 3, speed: 0, damage: 0 });
    this.setTint(0xdddddd); // white-ish for web
    this.setAlpha(0.6);
    this.setScale(1.5);
  }

  initBehavior(properties: Record<string, unknown>): void {
    this.slowFactor = (properties.slowFactor as number) || 0.4;
    // Static — no movement behavior needed
  }

  applySlowEffect(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(body.velocity.x * this.slowFactor);
  }
}
