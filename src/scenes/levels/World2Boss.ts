import { BossScene } from '../BossScene';
import { MonsieurEscargot } from '../../entities/bosses/MonsieurEscargot';
import type { Boss } from '../../entities/bosses/Boss';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/GameConfig';

export class World2Boss extends BossScene {
  private escargot!: MonsieurEscargot;

  constructor() {
    super('World2Boss', {
      bossType: 'escargot',
      worldNum: 2,
      arenaWidth: GAME_WIDTH,
      arenaHeight: GAME_HEIGHT,
    });
  }

  protected createBoss(): Boss {
    this.escargot = new MonsieurEscargot(this, GAME_WIDTH - 60, GAME_HEIGHT - 48);
    this.escargot.initBehavior();
    return this.escargot as unknown as Boss;
  }

  protected getBossProjectiles(): Phaser.Physics.Arcade.Group[] {
    return [];
  }

  protected setupArena(): void {
    // Elevated platforms to jump over the rolling snail
    this.addPlatform(GAME_WIDTH / 2, GAME_HEIGHT - 64, 32);
    this.addPlatform(64, GAME_HEIGHT - 48, 20);
    this.addPlatform(GAME_WIDTH - 64, GAME_HEIGHT - 48, 20);
  }
}
