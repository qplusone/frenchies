import Phaser from 'phaser';
import { BossScene } from '../BossScene';
import { CygneGris } from '../../entities/bosses/CygneGris';
import type { Boss } from '../../entities/bosses/Boss';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/GameConfig';

export class World3Boss extends BossScene {
  private cygne!: CygneGris;

  constructor() {
    super('World3Boss', {
      bossType: 'cygne',
      worldNum: 3,
      arenaWidth: GAME_WIDTH,
      arenaHeight: GAME_HEIGHT,
    });
  }

  protected createBoss(): Boss {
    this.cygne = new CygneGris(this, GAME_WIDTH / 2, GAME_HEIGHT * 0.3);
    this.cygne.initBehavior();
    return this.cygne as unknown as Boss;
  }

  protected getBossProjectiles(): Phaser.Physics.Arcade.Group[] {
    return [this.cygne.getDiveZoneGroup()];
  }

  protected setupArena(): void {
    // Setup clone-attack collision
    this.events.on('player-attack', (hitbox: Phaser.GameObjects.Zone | Phaser.Physics.Arcade.Sprite, _type: string) => {
      const cloneGroup = this.cygne.getCloneGroup();
      this.physics.add.overlap(hitbox, cloneGroup, (_h, cloneObj) => {
        const clone = cloneObj as Phaser.Physics.Arcade.Sprite;
        if (clone.active) {
          this.cygne.shatterClone(clone);
        }
      });
    });

    // Stomp on clones shatters them too
    this.physics.add.overlap(this.player, this.cygne.getCloneGroup(), (_player, cloneObj) => {
      const clone = cloneObj as Phaser.Physics.Arcade.Sprite;
      if (!clone.active) return;
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      if (playerBody.velocity.y > 0 && this.player.y < clone.y - 8) {
        this.cygne.shatterClone(clone);
        playerBody.setVelocityY(-200);
      } else {
        this.player.takeDamage();
      }
    });

    // Platforms for maneuvering
    this.addPlatform(48, GAME_HEIGHT - 64, 24);
    this.addPlatform(128, GAME_HEIGHT - 80, 32);
    this.addPlatform(208, GAME_HEIGHT - 64, 24);
    this.addPlatform(80, GAME_HEIGHT - 120, 20);
    this.addPlatform(176, GAME_HEIGHT - 120, 20);
  }
}
