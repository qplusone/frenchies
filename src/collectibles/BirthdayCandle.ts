import { Collectible } from './Collectible';
import { GameManager } from '../systems/GameManager';

export class BirthdayCandle extends Collectible {
  readonly collectibleType = 'birthday_candle';
  private candleIndex: number;

  constructor(scene: Phaser.Scene, x: number, y: number, candleIndex: number) {
    super(scene, x, y, 'birthday_candle');
    this.candleIndex = candleIndex;

    // Candles have a subtle flicker animation
    scene.tweens.add({
      targets: this,
      alpha: { from: 0.8, to: 1 },
      duration: 200,
      yoyo: true,
      repeat: -1,
    });
  }

  onCollect(): void {
    GameManager.instance.collectCandle(this.candleIndex);

    // Special celebration effect for candles
    const text = this.scene.add.text(this.x, this.y - 16, `Candle ${this.candleIndex + 1}!`, {
      fontSize: '7px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }
}
