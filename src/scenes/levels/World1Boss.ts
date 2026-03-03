import { BossScene } from '../BossScene';
import { GrandGrenouille } from '../../entities/bosses/GrandGrenouille';
import type { Boss } from '../../entities/bosses/Boss';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/GameConfig';

export class World1Boss extends BossScene {
  private grenouille!: GrandGrenouille;

  constructor() {
    super('World1Boss', {
      bossType: 'grenouille',
      worldNum: 1,
      arenaWidth: GAME_WIDTH,
      arenaHeight: GAME_HEIGHT,
    });
  }

  protected createBoss(): Boss {
    this.grenouille = new GrandGrenouille(this, GAME_WIDTH - 60, GAME_HEIGHT - 48);
    this.grenouille.initBehavior();
    return this.grenouille as unknown as Boss;
  }

  protected getBossProjectiles(): Phaser.Physics.Arcade.Group[] {
    return [this.grenouille.getWaveGroup(), this.grenouille.getBubbleGroup()];
  }

  protected setupArena(): void {
    // Lily pad platforms for the frog fight
    this.addPlatform(64, GAME_HEIGHT - 60, 24);
    this.addPlatform(128, GAME_HEIGHT - 80, 24);
    this.addPlatform(192, GAME_HEIGHT - 60, 24);

    // Higher platforms
    this.addPlatform(96, GAME_HEIGHT - 120, 20);
    this.addPlatform(160, GAME_HEIGHT - 120, 20);
  }
}
