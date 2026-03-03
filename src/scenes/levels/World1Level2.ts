import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 1,
  levelNum: 2,
  levelWidth: 72,
  backgroundLayers: [
    { key: 'bg_world1_far', scrollX: 0.1 },
    { key: 'bg_world1_mid', scrollX: 0.3 },
    { key: 'bg_world1_near', scrollX: 0.6 },
  ],
};

export class World1Level2 extends GameScene {
  constructor() {
    super('World1Level2', config);
  }

  create(): void {
    super.create();

    // Level name label
    this.add
      .text(4, 4, 'World 1-2: Willow Bridge', {
        fontSize: '6px',
        color: '#6baaab',
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  protected buildLevel(): void {
    const T = TILE_SIZE;

    // --- Player spawn ---
    this.setSpawnPoint(40, GROUND_Y - 16);

    // =============================================
    // TERRAIN - Ground with wider gaps, more variety
    // =============================================

    // Section 1: Starting ground (tiles 0-11)
    this.addGroundRow(0, GROUND_Y, 12);

    // Gap of 3 tiles (tiles 12-14)

    // Section 2: Narrow island (tiles 15-20)
    this.addGroundRow(15 * T, GROUND_Y, 6);

    // Gap of 4 tiles (tiles 21-24) -- wider gap, need platform help

    // Section 3: Ground with raised block (tiles 25-36)
    this.addGroundRow(25 * T, GROUND_Y, 12);
    // Raised terrain block creating a hill
    this.addGroundBlock(29 * T, GROUND_Y - 2 * T, 4, 2);

    // Gap of 3 tiles (tiles 37-39)

    // Section 4: Ground (tiles 40-50)
    this.addGroundRow(40 * T, GROUND_Y, 11);

    // Gap of 4 tiles (tiles 51-54) -- longest gap

    // Section 5: Final stretch (tiles 55-71)
    this.addGroundRow(55 * T, GROUND_Y, 17);

    // =============================================
    // PLATFORMS - More complex vertical sections
    // =============================================

    // Stepping stone over first gap (tiles 12-14)
    this.addPlatform(12 * T, GROUND_Y - 3 * T, 2);

    // Stacked platforms in section 2 creating a vertical climb
    this.addPlatform(17 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(16 * T, GROUND_Y - 7 * T, 2);

    // Platform over wide gap (tiles 21-24)
    this.addPlatform(21 * T, GROUND_Y - 4 * T, 2);
    this.addPlatform(23 * T, GROUND_Y - 3 * T, 2);

    // High platform above the hill for paint_drop
    this.addPlatform(30 * T, GROUND_Y - 6 * T, 3);

    // Platform chain over third gap (tiles 37-39)
    this.addPlatform(37 * T, GROUND_Y - 3 * T, 3);

    // Vertical section in section 4 -- stacked platforms
    this.addPlatform(43 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(45 * T, GROUND_Y - 7 * T, 3);

    // Hidden platform for birthday candle -- off the main path,
    // tucked behind the vertical section, requires backtracking
    // from the high platform at tile 45
    this.addPlatform(41 * T, GROUND_Y - 9 * T, 2);

    // Stepping platforms over the longest gap (tiles 51-54)
    this.addPlatform(51 * T, GROUND_Y - 3 * T, 2);
    this.addPlatform(53 * T, GROUND_Y - 5 * T, 2);

    // Platform in final section for variety
    this.addPlatform(60 * T, GROUND_Y - 4 * T, 3);

    // =============================================
    // COLLECTIBLES
    // =============================================

    // Macarons along the main ground path
    this.addCollectible('macaron', 5 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 9 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 17 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 27 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 43 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 58 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 63 * T, GROUND_Y - 12);

    // Macarons on platforms (reward exploration)
    this.addCollectible('macaron', 18 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 46 * T, GROUND_Y - 7 * T - 12);
    this.addCollectible('macaron', 61 * T, GROUND_Y - 4 * T - 12);

    // Paint drop on the high platform above the hill (hard to reach)
    this.addCollectible('paint_drop', 31 * T, GROUND_Y - 6 * T - 12);

    // Birthday candle (index 1) -- hidden on the tucked-away platform
    // Player must climb the stacked platforms at tiles 43/45 then
    // jump left to the hidden platform at tile 41, GROUND_Y - 9T
    this.addCollectible('birthday_candle', 42 * T, GROUND_Y - 9 * T - 12, {
      candleIndex: 1,
    });

    // =============================================
    // ENEMIES
    // =============================================

    // Brouillard blob patrolling section 2
    this.addEnemy('brouillard_blob', 17 * T, GROUND_Y - 8, {
      patrolDistance: 3 * T,
    });

    // Brouillard blob patrolling section 3 ground
    this.addEnemy('brouillard_blob', 33 * T, GROUND_Y - 8, {
      patrolDistance: 4 * T,
    });

    // Brouillard blob in the final stretch
    this.addEnemy('brouillard_blob', 62 * T, GROUND_Y - 8, {
      patrolDistance: 3 * T,
    });

    // Pluie sprite (rain drop enemy) falling in the gap area (tiles 37-39)
    // Positioned above the platform so it drops down on the player
    this.addEnemy('pluie_sprite', 38 * T, GROUND_Y - 10 * T, {
      fallSpeed: 80,
    });

    // =============================================
    // CHECKPOINTS & LEVEL END
    // =============================================

    // First checkpoint at start of section 3
    this.addCheckpoint(26 * T, GROUND_Y - 16);

    // Second checkpoint at start of section 5
    this.addCheckpoint(56 * T, GROUND_Y - 16);

    // Level end trigger at right edge (leave 2 tiles as landing zone)
    this.addLevelEnd(70 * T);
  }
}
