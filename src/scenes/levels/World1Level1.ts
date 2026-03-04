import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 1,
  levelNum: 1,
  levelWidth: 64,
  backgroundLayers: [
    { key: 'bg_world1_far', scrollX: 0.1 },
    { key: 'bg_world1_mid', scrollX: 0.3 },
    { key: 'bg_world1_near', scrollX: 0.6 },
  ],
};

export class World1Level1 extends GameScene {
  constructor() {
    super('World1Level1', config);
  }

  create(): void {
    super.create();

    // Level name label
    this.add
      .text(4, 4, 'World 1-1: Lily Pad Lane', {
        fontSize: '7px',
        color: '#6baaab',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  protected buildLevel(): void {
    const T = TILE_SIZE;

    // --- Player spawn ---
    this.setSpawnPoint(40, GROUND_Y - 16);

    // =============================================
    // TERRAIN - Flat ground with small gaps
    // =============================================

    // Section 1: Starting area (tiles 0-15) - solid ground
    this.addGroundRow(0, GROUND_Y, 16);

    // Gap of 2 tiles (tiles 16-17)

    // Section 2: (tiles 18-30) - ground continues
    this.addGroundRow(18 * T, GROUND_Y, 13);

    // Gap of 3 tiles (tiles 31-33)

    // Section 3: (tiles 34-46) - ground continues
    this.addGroundRow(34 * T, GROUND_Y, 13);

    // Gap of 2 tiles (tiles 47-48)

    // Section 4: (tiles 49-63) - ground to end
    this.addGroundRow(49 * T, GROUND_Y, 15);

    // =============================================
    // PLATFORMS - Floating lily pad platforms
    // =============================================

    // Low platform above first gap to help players cross
    this.addPlatform(15 * T, GROUND_Y - 3 * T, 4);

    // Mid-height platform in section 2 (for macarons)
    this.addPlatform(22 * T, GROUND_Y - 4 * T, 3);

    // Platform over second gap (3-tile gap, tiles 31-33)
    this.addPlatform(31 * T, GROUND_Y - 3 * T, 3);

    // Hidden high platform for birthday candle (section 2 area, hard to see)
    this.addPlatform(26 * T, GROUND_Y - 8 * T, 2);

    // Stepping platform in section 3 area
    this.addPlatform(39 * T, GROUND_Y - 5 * T, 3);

    // Low platform near the third gap
    this.addPlatform(47 * T, GROUND_Y - 3 * T, 3);

    // =============================================
    // COLLECTIBLES
    // =============================================

    // Macarons along the main path
    this.addCollectible('macaron', 8 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 20 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 36 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 52 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 56 * T, GROUND_Y - 12);

    // Macarons on platforms
    this.addCollectible('macaron', 23 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 40 * T, GROUND_Y - 5 * T - 12);

    // Choquette (heal) in section 3 on ground
    this.addCollectible('choquette', 42 * T, GROUND_Y - 12);

    // Birthday candle (index 0) - hidden on the high platform
    // The player must notice the platform at y = GROUND_Y - 8T and jump up
    this.addCollectible('birthday_candle', 27 * T, GROUND_Y - 8 * T - 12, {
      candleIndex: 0,
    });

    // =============================================
    // ENEMIES
    // =============================================

    // Brouillard blob patrolling section 2
    this.addEnemy('brouillard_blob', 24 * T, GROUND_Y - 8, {
      patrolDistance: 3 * T,
    });

    // Brouillard blob patrolling section 4
    this.addEnemy('brouillard_blob', 54 * T, GROUND_Y - 8, {
      patrolDistance: 4 * T,
    });

    // =============================================
    // CHECKPOINT & LEVEL END
    // =============================================

    // Checkpoint roughly halfway through the level (tile 34 area)
    this.addCheckpoint(35 * T, GROUND_Y - 16);

    // Level end trigger at right edge (leave 2 tiles as landing zone)
    this.addLevelEnd(62 * T);
  }
}
