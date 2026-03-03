import { Collectible } from './Collectible';
import { Player } from '../entities/Player';

export class Choquette extends Collectible {
  readonly collectibleType = 'choquette';
  private playerRef: Player;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'choquette');
    this.playerRef = player;
  }

  onCollect(): void {
    this.playerRef.heal(1);
  }
}
