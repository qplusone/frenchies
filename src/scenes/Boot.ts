import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { AudioManager } from '../systems/AudioManager';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Generate a minimal loading bar graphic
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture('pixel', 4, 4);
    graphics.destroy();
  }

  async create(): Promise<void> {
    // Initialize audio system early
    await AudioManager.getInstance().init();
    this.scene.start('Preloader');
  }
}
