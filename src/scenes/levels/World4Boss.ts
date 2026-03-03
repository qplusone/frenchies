import { BossScene } from '../BossScene';
import { LaBrume } from '../../entities/bosses/LaBrume';
import type { Boss } from '../../entities/bosses/Boss';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/GameConfig';

export class World4Boss extends BossScene {
  private brume!: LaBrume;

  constructor() {
    super('World4Boss', {
      bossType: 'brume',
      worldNum: 4,
      arenaWidth: GAME_WIDTH,
      arenaHeight: GAME_HEIGHT,
    });
  }

  protected createBoss(): Boss {
    this.brume = new LaBrume(this, GAME_WIDTH / 2, GAME_HEIGHT * 0.35);
    this.brume.initBehavior();
    return this.brume as unknown as Boss;
  }

  protected getBossProjectiles(): Phaser.Physics.Arcade.Group[] {
    return [this.brume.getProjectileGroup()];
  }

  protected setupArena(): void {
    // Start the arena grey/foggy
    this.cameras.main.setBackgroundColor(0x444455);

    // Listen for color restoration events from boss phase changes
    this.events.on('color-restore', (phase: number) => {
      const colors: Record<number, number> = {
        2: 0x555566,
        3: 0x667777,
      };
      const targetColor = colors[phase] || 0x667777;
      this.cameras.main.setBackgroundColor(targetColor);
    });

    // Safe-zone platforms
    this.addPlatform(48, GAME_HEIGHT - 56, 24);
    this.addPlatform(128, GAME_HEIGHT - 72, 28);
    this.addPlatform(208, GAME_HEIGHT - 56, 24);
    this.addPlatform(80, GAME_HEIGHT - 104, 20);
    this.addPlatform(176, GAME_HEIGHT - 104, 20);
    this.addPlatform(128, GAME_HEIGHT - 136, 24);
  }

  protected onBossPhaseChange(newPhase: number): void {
    if (newPhase === 3) {
      this.addPlatform(48, GAME_HEIGHT - 136, 20);
      this.addPlatform(208, GAME_HEIGHT - 136, 20);
    }
  }
}
