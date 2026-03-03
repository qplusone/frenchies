import { Collectible } from './Collectible';
import { Player } from '../entities/Player';

export class WingPowerUp extends Collectible {
  readonly collectibleType = 'wing_powerup';
  private playerRef: Player;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'wing_powerup');
    this.playerRef = player;
  }

  onCollect(): void {
    this.playerRef.activateWings();
  }
}
