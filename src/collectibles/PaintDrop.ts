import { Collectible } from './Collectible';
import { GameManager } from '../systems/GameManager';

export class PaintDrop extends Collectible {
  readonly collectibleType = 'paint_drop';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'paint_drop');
  }

  onCollect(): void {
    GameManager.instance.collectPaintDrop();
  }
}
