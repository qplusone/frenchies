import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE, PALETTE } from '../../config/GameConfig';
import { AudioManager } from '../../systems/AudioManager';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 2,
  levelNum: 1,
  levelWidth: 64,
  backgroundLayers: [
    { key: 'bg_world2_far', scrollX: 0.1 },
    { key: 'bg_world2_mid', scrollX: 0.3 },
    { key: 'bg_world2_near', scrollX: 0.6 },
  ],
};

/**
 * World 2-1: Sunrise Terrace
 *
 * Introduction to World 2 with ascending terraced terrain.
 * Ground rises in steps like garden terraces, with enemies
 * and collectibles placed along the path.
 */
export class World2Level1 extends GameScene {
  constructor() {
    super('World2Level1', config);
  }

  create(): void {
    super.create();

    this.add.text(4, 4, 'World 2-1: Sunrise Terrace', {
      fontSize: '6px',
      color: '#6baaab',
      fontFamily: 'monospace',
    }).setScrollFactor(0).setDepth(100);

    // === EASTER EGG: Clock Tower at 3:11 (Rachel's birthday March 11) ===
    const clockX = 10 * TILE_SIZE;
    const clockY = GROUND_Y - 7 * TILE_SIZE;
    const clockTower = this.add.graphics();
    clockTower.setDepth(-2);
    // Tower body
    clockTower.fillStyle(0x5c4a3a, 0.6);
    clockTower.fillRect(clockX - 10, clockY - 10, 20, 50);
    // Peaked roof
    clockTower.fillStyle(0x8b5c3a, 0.7);
    clockTower.fillTriangle(clockX - 14, clockY - 10, clockX + 14, clockY - 10, clockX, clockY - 24);
    // Clock face
    clockTower.fillStyle(0xffeedd, 0.8);
    clockTower.fillCircle(clockX, clockY, 8);
    clockTower.lineStyle(1, 0x333333);
    clockTower.strokeCircle(clockX, clockY, 8);
    // Clock hands showing 3:11
    clockTower.lineStyle(1, 0x222222);
    clockTower.lineBetween(clockX, clockY, clockX + 5, clockY);     // hour hand → 3
    clockTower.lineBetween(clockX, clockY, clockX - 1, clockY - 7); // minute hand → 11

    // Easter egg trigger: when near the clock and pressing Up
    let easterEggTriggered = false;
    const clockZone = this.add.zone(clockX, clockY + 20, 40, 80);
    this.physics.add.existing(clockZone, true);

    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    upKey.on('down', () => {
      if (easterEggTriggered) return;
      const dx = Math.abs(this.player.x - clockX);
      const dy = Math.abs(this.player.y - (clockY + 20));
      if (dx < 30 && dy < 50) {
        easterEggTriggered = true;
        AudioManager.getInstance().playSFX('collectRare');

        // Confetti burst
        for (let i = 0; i < 30; i++) {
          const confetti = this.add.graphics();
          const colors = [0xff6b6b, 0xffdd44, 0x66ccff, 0xff88cc, 0x88ff88, PALETTE.softGold];
          confetti.fillStyle(colors[i % colors.length]);
          confetti.fillRect(0, 0, 3, 3);
          confetti.setPosition(clockX + Phaser.Math.Between(-20, 20), clockY - 10);
          confetti.setDepth(50);
          this.tweens.add({
            targets: confetti,
            x: confetti.x + Phaser.Math.Between(-40, 40),
            y: confetti.y + Phaser.Math.Between(30, 80),
            alpha: 0,
            duration: Phaser.Math.Between(800, 1500),
            onComplete: () => confetti.destroy(),
          });
        }

        // Birthday banner
        const banner = this.add.text(clockX, clockY - 30, 'Happy Birthday!\n   March 11', {
          fontSize: '6px',
          fontFamily: 'monospace',
          color: '#ffdd44',
          align: 'center',
        }).setOrigin(0.5).setDepth(50);
        this.tweens.add({
          targets: banner,
          y: banner.y - 15,
          alpha: 0,
          delay: 2500,
          duration: 1000,
          onComplete: () => banner.destroy(),
        });
      }
    });
  }

  protected buildLevel(): void {
    // --- Spawn ---
    this.setSpawnPoint(40, GROUND_Y - 16);

    // ======================================================
    // SECTION 1: Flat start (tiles 0-12)
    // ======================================================
    // Ground floor
    this.addGroundRow(0, GROUND_Y, 13); // tiles 0-12

    // Macarons along the opening stretch
    this.addCollectible('macaron', 4 * TILE_SIZE, GROUND_Y - 12);
    this.addCollectible('macaron', 6 * TILE_SIZE, GROUND_Y - 12);

    // ======================================================
    // SECTION 2: First terrace step-up (tiles 13-22)
    // Step from 208 up to 192 (1 tile rise)
    // ======================================================
    // Terrace 1: ground at y=192, 2 tiles tall to fill down to 208
    this.addGroundBlock(13 * TILE_SIZE, GROUND_Y - TILE_SIZE, 10, 2); // y=192, 2 rows

    // Brouillard blob patrolling terrace 1
    this.addEnemy('brouillard_blob', 17 * TILE_SIZE, GROUND_Y - TILE_SIZE - 8, {
      patrolDistance: 48,
    });

    // Macaron above terrace 1
    this.addCollectible('macaron', 16 * TILE_SIZE, GROUND_Y - TILE_SIZE - 12);

    // ======================================================
    // SECTION 3: Second terrace (tiles 23-32)
    // Step from 192 up to 176 (another tile rise)
    // ======================================================
    this.addGroundBlock(23 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 10, 3); // y=176, 3 rows

    // Floating platform above terrace 2 with a macaron
    this.addPlatform(25 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE, 3); // y=144

    this.addCollectible('macaron', 26 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE - 12);

    // Pierre roulante on terrace 2
    this.addEnemy('pierre_roulante', 28 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE - 8, {
      rollDirection: 'left',
      rollSpeed: 60,
    });

    // Macaron on terrace 2 path
    this.addCollectible('macaron', 30 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE - 12);

    // ======================================================
    // SECTION 4: Third terrace + gap (tiles 33-43)
    // Step from 176 up to 160, with a gap before it
    // ======================================================
    // Small gap (tiles 33-34 have no ground) — player must jump across
    // Terrace 3
    this.addGroundBlock(35 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE, 9, 4); // y=160, 4 rows

    // Feuille flotter hovering over the gap
    this.addEnemy('feuille_flotter', 34 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE - 16, {
      floatAmplitude: 16,
      floatSpeed: 1.5,
    });

    // Paint drop on terrace 3 — behind a high platform
    this.addPlatform(37 * TILE_SIZE, GROUND_Y - 5 * TILE_SIZE, 2); // y=128
    this.addCollectible('paint_drop', 38 * TILE_SIZE, GROUND_Y - 5 * TILE_SIZE - 12);

    // Macaron on terrace 3
    this.addCollectible('macaron', 40 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE - 12);

    // ======================================================
    // CHECKPOINT (tile ~42)
    // ======================================================
    this.addCheckpoint(42 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE - 16);

    // ======================================================
    // SECTION 5: Descent + hidden terrace below (tiles 44-52)
    // Terrain drops back down, with a hidden lower terrace
    // ======================================================
    // Main path drops back to y=192
    this.addGroundBlock(44 * TILE_SIZE, GROUND_Y - TILE_SIZE, 9, 2); // y=192

    // Brouillard blob on the descent path
    this.addEnemy('brouillard_blob', 47 * TILE_SIZE, GROUND_Y - TILE_SIZE - 8, {
      patrolDistance: 32,
    });

    // Macarons along the descent
    this.addCollectible('macaron', 45 * TILE_SIZE, GROUND_Y - TILE_SIZE - 12);
    this.addCollectible('macaron', 49 * TILE_SIZE, GROUND_Y - TILE_SIZE - 12);

    // --- Hidden terrace below the main path (birthday candle) ---
    // A small platform tucked under the main terrace, accessible by dropping down
    // at the edge of section 5
    this.addGroundBlock(46 * TILE_SIZE, GROUND_Y, 4, 1); // floor-level nook at y=208
    this.addCollectible('birthday_candle', 48 * TILE_SIZE, GROUND_Y - 12, {
      candleIndex: 3,
    });

    // ======================================================
    // SECTION 6: Final stretch to level end (tiles 53-64)
    // Flat ground at base level, easy run to the exit
    // ======================================================
    this.addGroundRow(53 * TILE_SIZE, GROUND_Y, 11); // tiles 53-63

    // Macaron near the exit
    this.addCollectible('macaron', 57 * TILE_SIZE, GROUND_Y - 12);

    // ======================================================
    // LEVEL END (tile 62, with 2-tile landing zone before it)
    // ======================================================
    this.addLevelEnd(62 * TILE_SIZE);
  }
}
