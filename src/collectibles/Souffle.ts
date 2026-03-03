import { Collectible } from './Collectible';
import { Player } from '../entities/Player';
import { SOUFFLE_INVINCIBILITY_MS } from '../config/GameConfig';

export class Souffle extends Collectible {
  readonly collectibleType = 'souffle';
  private playerRef: Player;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'souffle');
    this.playerRef = player;
  }

  onCollect(): void {
    this.playerRef.isInvincible = true;

    // Golden glow effect
    this.playerRef.setTint(0xffdd44);

    this.scene.time.delayedCall(SOUFFLE_INVINCIBILITY_MS, () => {
      if (this.playerRef.active) {
        this.playerRef.isInvincible = false;
        this.playerRef.clearTint();
      }
    });
  }
}
