import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

/**
 * Creates a darkness overlay with a circular light around the player.
 * Used for the foggy arbor level (W2-3).
 * Collectibles can expand the light radius.
 */
export class DarknessMask {
  private scene: Phaser.Scene;
  private overlay!: Phaser.GameObjects.Graphics;
  private lightMask!: Phaser.GameObjects.Graphics;
  private radius: number;
  private baseRadius: number;
  private targetRadius: number;

  constructor(scene: Phaser.Scene, initialRadius: number = 40) {
    this.scene = scene;
    this.radius = initialRadius;
    this.baseRadius = initialRadius;
    this.targetRadius = initialRadius;

    this.createOverlay();
  }

  private createOverlay(): void {
    // Dark overlay that covers the entire screen
    this.overlay = this.scene.add.graphics();
    this.overlay.setDepth(80);
    this.overlay.setScrollFactor(0);

    // Light circle mask (drawn each frame)
    this.lightMask = this.scene.add.graphics();
    this.lightMask.setDepth(80);
    this.lightMask.setScrollFactor(0);
  }

  /**
   * Update the darkness mask to follow the player position
   */
  update(playerX: number, playerY: number): void {
    // Smoothly interpolate radius
    this.radius = Phaser.Math.Linear(this.radius, this.targetRadius, 0.05);

    const cam = this.scene.cameras.main;
    // Convert world coords to screen coords
    const screenX = playerX - cam.scrollX;
    const screenY = playerY - cam.scrollY;

    // Redraw overlay with a hole for the player
    this.overlay.clear();
    this.lightMask.clear();

    // Draw full-screen dark overlay
    this.overlay.fillStyle(0x000000, 0.85);
    this.overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Cut a circular hole using blend mode
    // Since Phaser doesn't have easy bitmap mask on graphics,
    // we'll draw a gradient-like circle by drawing concentric rings
    this.drawLightCircle(screenX, screenY);
  }

  private drawLightCircle(x: number, y: number): void {
    // Erase the center area by drawing over the overlay with clear color
    // Use multiple alpha layers for a soft edge
    const steps = 8;
    for (let i = steps; i >= 0; i--) {
      const fraction = i / steps;
      const r = this.radius * (1 + fraction * 0.5);
      const alpha = fraction * 0.85;

      this.lightMask.fillStyle(0x000000, alpha);
      this.lightMask.fillCircle(x, y, r);
    }

    // Clear the inner circle completely using the overlay
    // We'll use a RenderTexture approach instead for true masking
    // For now, draw a bright circle on the overlay with erase blendmode
    this.overlay.fillStyle(0x000000, 0);
    // Since we can't easily do subtractive blending with Graphics,
    // we'll redraw the overlay with a gap using an alternative approach:

    // Clear and redraw with a radial pattern
    this.overlay.clear();

    // Draw darkness in a grid, skipping the player circle
    const gridSize = 4;
    for (let gx = 0; gx < GAME_WIDTH; gx += gridSize) {
      for (let gy = 0; gy < GAME_HEIGHT; gy += gridSize) {
        const dx = gx + gridSize / 2 - x;
        const dy = gy + gridSize / 2 - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.radius * 1.5) {
          this.overlay.fillStyle(0x000000, 0.9);
          this.overlay.fillRect(gx, gy, gridSize, gridSize);
        } else if (dist > this.radius) {
          // Gradient edge
          const t = (dist - this.radius) / (this.radius * 0.5);
          this.overlay.fillStyle(0x000000, t * 0.9);
          this.overlay.fillRect(gx, gy, gridSize, gridSize);
        }
        // Inside radius = fully clear (no drawing)
      }
    }
  }

  /**
   * Expand the light radius (e.g., when collecting a special item)
   */
  expandRadius(amount: number): void {
    this.targetRadius = Math.min(this.targetRadius + amount, 120);

    // Visual feedback
    this.scene.cameras.main.flash(200, 255, 255, 200);
  }

  /**
   * Reset to base radius
   */
  resetRadius(): void {
    this.targetRadius = this.baseRadius;
  }

  destroy(): void {
    this.overlay.destroy();
    this.lightMask.destroy();
  }
}
