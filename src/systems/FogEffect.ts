import Phaser from 'phaser';
import { PALETTE } from '../config/GameConfig';

/**
 * Manages the fog/desaturation effect on world tiles.
 * Worlds start grey (fogged). Defeating the boss triggers color restoration.
 */
export class FogEffect {
  private scene: Phaser.Scene;
  private foggedLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private isRestored: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Apply fog (greyscale tint) to tile layers
   */
  applyFog(layers: Phaser.Tilemaps.TilemapLayer[]): void {
    this.foggedLayers = layers.filter(l => l !== null);
    for (const layer of this.foggedLayers) {
      layer.setTint(PALETTE.fog);
    }
  }

  /**
   * Restore color to all fogged layers with a tween animation
   */
  restoreColor(duration: number = 2000, onComplete?: () => void): void {
    if (this.isRestored) return;
    this.isRestored = true;

    let completed = 0;
    const totalLayers = this.foggedLayers.length;

    for (const layer of this.foggedLayers) {
      // Tween the tint from grey to white (no tint)
      this.scene.tweens.addCounter({
        from: 0,
        to: 100,
        duration: duration,
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          const t = (tween.getValue() ?? 0) / 100;
          const r = Math.floor(Phaser.Math.Linear(0x88, 0xff, t));
          const g = Math.floor(Phaser.Math.Linear(0x88, 0xff, t));
          const b = Math.floor(Phaser.Math.Linear(0x88, 0xff, t));
          const color = Phaser.Display.Color.GetColor(r, g, b);
          layer.setTint(color);
        },
        onComplete: () => {
          layer.setTint(0xffffff);
          completed++;
          if (completed >= totalLayers && onComplete) {
            onComplete();
          }
        },
      });
    }

    // Screen flash
    this.scene.cameras.main.flash(500);
  }

  /**
   * Partially restore color (for phased boss fights like La Brume)
   */
  partialRestore(fraction: number): void {
    const t = Phaser.Math.Clamp(fraction, 0, 1);
    const r = Math.floor(Phaser.Math.Linear(0x88, 0xff, t));
    const g = Math.floor(Phaser.Math.Linear(0x88, 0xff, t));
    const b = Math.floor(Phaser.Math.Linear(0x88, 0xff, t));
    const color = Phaser.Display.Color.GetColor(r, g, b);

    for (const layer of this.foggedLayers) {
      layer.setTint(color);
    }
  }

  destroy(): void {
    this.foggedLayers = [];
  }
}
