import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../config/GameConfig';

/**
 * World-specific ambient particle systems.
 * Each world has a distinctive atmospheric effect.
 */
export class WorldParticles {
  private scene: Phaser.Scene;
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create particle effects for a given world
   */
  createForWorld(worldNum: number): void {
    this.destroy();

    switch (worldNum) {
      case 1:
        this.createPetals();
        break;
      case 2:
        this.createLightMotes();
        break;
      case 3:
        this.createFogWisps();
        break;
      case 4:
        this.createBubbles();
        break;
    }
  }

  /**
   * World 1: Cherry blossom petals floating down
   */
  private createPetals(): void {
    const emitter = this.scene.add.particles(0, -10, 'pixel', {
      x: { min: 0, max: GAME_WIDTH * 2 },
      y: -10,
      lifespan: 6000,
      speedY: { min: 8, max: 20 },
      speedX: { min: -15, max: 5 },
      scale: { start: 0.6, end: 0.3 },
      alpha: { start: 0.6, end: 0 },
      tint: [PALETTE.lilyPink, 0xffc0cb, 0xffe0e6],
      frequency: 800,
      quantity: 1,
    });
    emitter.setDepth(50);
    this.emitters.push(emitter);
  }

  /**
   * World 2: Warm light motes drifting upward
   */
  private createLightMotes(): void {
    const emitter = this.scene.add.particles(0, GAME_HEIGHT + 10, 'pixel', {
      x: { min: 0, max: GAME_WIDTH * 2 },
      y: GAME_HEIGHT + 10,
      lifespan: 5000,
      speedY: { min: -12, max: -25 },
      speedX: { min: -5, max: 5 },
      scale: { start: 0.4, end: 0.1 },
      alpha: { start: 0.7, end: 0 },
      tint: [PALETTE.softGold, PALETTE.sunAmber, 0xffeedd],
      frequency: 600,
      quantity: 1,
    });
    emitter.setDepth(50);
    this.emitters.push(emitter);
  }

  /**
   * World 3: Mysterious fog wisps
   */
  private createFogWisps(): void {
    const emitter = this.scene.add.particles(0, 0, 'pixel', {
      x: { min: 0, max: GAME_WIDTH * 2 },
      y: { min: GAME_HEIGHT * 0.3, max: GAME_HEIGHT * 0.8 },
      lifespan: 4000,
      speedX: { min: -8, max: 8 },
      speedY: { min: -3, max: 3 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.25, end: 0 },
      tint: [PALETTE.silver, PALETTE.deepPurple, 0x8888aa],
      frequency: 500,
      quantity: 1,
    });
    emitter.setDepth(50);
    this.emitters.push(emitter);
  }

  /**
   * World 4: Colorful bubbles rising
   */
  private createBubbles(): void {
    const emitter = this.scene.add.particles(0, GAME_HEIGHT + 5, 'pixel', {
      x: { min: 0, max: GAME_WIDTH * 2 },
      y: GAME_HEIGHT + 5,
      lifespan: 4000,
      speedY: { min: -15, max: -30 },
      speedX: { min: -8, max: 8 },
      scale: { start: 0.5, end: 0.2 },
      alpha: { start: 0.5, end: 0 },
      tint: [PALETTE.vividGreen, PALETTE.richRose, PALETTE.brightBlue, PALETTE.warmYellow],
      frequency: 400,
      quantity: 1,
    });
    emitter.setDepth(50);
    this.emitters.push(emitter);
  }

  /**
   * Update particles to follow camera (for scrolling levels)
   */
  update(): void {
    const cam = this.scene.cameras.main;
    for (const emitter of this.emitters) {
      emitter.setPosition(cam.scrollX, emitter.y);
    }
  }

  destroy(): void {
    for (const emitter of this.emitters) {
      emitter.destroy();
    }
    this.emitters = [];
  }
}
