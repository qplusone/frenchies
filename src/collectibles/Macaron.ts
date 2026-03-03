import { Collectible } from './Collectible';
import { GameManager } from '../systems/GameManager';

export class Macaron extends Collectible {
  readonly collectibleType = 'macaron';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'macaron');
  }

  onCollect(): void {
    GameManager.instance.collectMacaron();
  }
}
