import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 1,
  levelNum: 3,
  levelWidth: 80,
  backgroundLayers: [
    { key: 'bg_world1_far', scrollX: 0.1 },
    { key: 'bg_world1_mid', scrollX: 0.3 },
    { key: 'bg_world1_near', scrollX: 0.6 },
  ],
};

export class World1Level3 extends GameScene {
  constructor() {
    super('World1Level3', config);
  }

  create(): void {
    super.create();

    // Level name label
    this.add
      .text(4, 4, 'World 1-3: Reflection Depths', {
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
    // TERRAIN - Complex with multiple high/low paths
    // =============================================

    // --- LOW ROUTE (main ground path) ---

    // Section 1: Starting ground (tiles 0-10)
    this.addGroundRow(0, GROUND_Y, 11);

    // Gap of 3 tiles (tiles 11-13)

    // Section 2: Lower path (tiles 14-22)
    this.addGroundRow(14 * T, GROUND_Y, 9);

    // Gap of 4 tiles (tiles 23-26) -- dangerous section

    // Section 3: Central island (tiles 27-35)
    this.addGroundRow(27 * T, GROUND_Y, 9);
    // Raised block creating a step-up in the middle
    this.addGroundBlock(30 * T, GROUND_Y - 2 * T, 3, 2);

    // Gap of 3 tiles (tiles 36-38)

    // Section 4: Ground with pit (tiles 39-48)
    this.addGroundRow(39 * T, GROUND_Y, 4);
    // Pit gap: tiles 43-46 (4 tiles wide)
    this.addGroundRow(47 * T, GROUND_Y, 6);

    // Gap of 4 tiles (tiles 53-56) -- long jump

    // Section 5: Final approach (tiles 57-79)
    this.addGroundRow(57 * T, GROUND_Y, 23);
    // Raised fortress-like block near the end
    this.addGroundBlock(64 * T, GROUND_Y - 3 * T, 5, 3);

    // --- HIGH ROUTE platforms (alternative path) ---

    // High route entrance -- stack of platforms starting from section 1
    this.addPlatform(8 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(6 * T, GROUND_Y - 7 * T, 3);

    // High route bridge spanning over section 2
    this.addPlatform(10 * T, GROUND_Y - 9 * T, 4);
    this.addPlatform(15 * T, GROUND_Y - 9 * T, 3);
    this.addPlatform(19 * T, GROUND_Y - 8 * T, 3);

    // High route continues over the dangerous gap (tiles 23-26)
    this.addPlatform(23 * T, GROUND_Y - 7 * T, 2);
    this.addPlatform(26 * T, GROUND_Y - 8 * T, 2);

    // =============================================
    // MID-LEVEL platforms (connecting routes)
    // =============================================

    // Stepping stones over first gap (tiles 11-13) -- low route
    this.addPlatform(11 * T, GROUND_Y - 3 * T, 2);

    // Platform over the dangerous gap for low route
    this.addPlatform(24 * T, GROUND_Y - 3 * T, 2);

    // Platforms around the central island
    this.addPlatform(28 * T, GROUND_Y - 5 * T, 3);
    this.addPlatform(33 * T, GROUND_Y - 4 * T, 3);

    // Stepping stone over gap at tiles 36-38
    this.addPlatform(36 * T, GROUND_Y - 3 * T, 2);
    this.addPlatform(38 * T, GROUND_Y - 5 * T, 2);

    // Platforms over the pit in section 4 (tiles 43-46)
    this.addPlatform(43 * T, GROUND_Y - 3 * T, 2);
    this.addPlatform(45 * T, GROUND_Y - 5 * T, 2);

    // Wing powerup platform -- high above section 4
    this.addPlatform(48 * T, GROUND_Y - 8 * T, 2);

    // Platforms over the long jump (tiles 53-56)
    this.addPlatform(53 * T, GROUND_Y - 4 * T, 2);
    this.addPlatform(55 * T, GROUND_Y - 3 * T, 2);

    // Upper platforms in the final section
    this.addPlatform(60 * T, GROUND_Y - 5 * T, 3);
    this.addPlatform(70 * T, GROUND_Y - 5 * T, 3);

    // SECRET: Hidden platform far below the high route,
    // accessible only by dropping from the high route at tile 19
    // and landing precisely. Tucked under the high-route bridge.
    this.addPlatform(18 * T, GROUND_Y - 12 * T, 2);

    // =============================================
    // COLLECTIBLES
    // =============================================

    // --- Macarons along the LOW route ---
    this.addCollectible('macaron', 5 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 16 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 29 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 41 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 50 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 60 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 74 * T, GROUND_Y - 12);

    // --- Macarons along the HIGH route ---
    this.addCollectible('macaron', 11 * T, GROUND_Y - 9 * T - 12);
    this.addCollectible('macaron', 16 * T, GROUND_Y - 9 * T - 12);
    this.addCollectible('macaron', 20 * T, GROUND_Y - 8 * T - 12);

    // Macarons on mid platforms
    this.addCollectible('macaron', 34 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 46 * T, GROUND_Y - 5 * T - 12);

    // Wing powerup on the high platform above section 4
    this.addCollectible('wing_powerup', 49 * T, GROUND_Y - 8 * T - 12);

    // Souffle (invincibility) placed in the dangerous gap area (tiles 23-26)
    // Rewards players brave enough to take the low route through enemies
    this.addCollectible('souffle', 25 * T, GROUND_Y - 3 * T - 12);

    // Birthday candle (index 2) -- VERY well hidden
    // On the secret platform at tile 18, GROUND_Y - 12T.
    // Player must take the high route, climb to the bridge at GROUND_Y - 9T,
    // then intentionally drop down to this hidden platform below.
    // No visible clue from the low route -- pure exploration reward.
    this.addCollectible('birthday_candle', 19 * T, GROUND_Y - 12 * T - 12, {
      candleIndex: 2,
    });

    // =============================================
    // ENEMIES
    // =============================================

    // Brouillard blob on section 2 ground (low route hazard)
    this.addEnemy('brouillard_blob', 18 * T, GROUND_Y - 8, {
      patrolDistance: 4 * T,
    });

    // Brouillard blob on central island
    this.addEnemy('brouillard_blob', 28 * T, GROUND_Y - 8, {
      patrolDistance: 3 * T,
    });

    // Pluie sprite dropping over the dangerous gap (tiles 23-26)
    this.addEnemy('pluie_sprite', 25 * T, GROUND_Y - 11 * T, {
      fallSpeed: 90,
    });

    // Feuille flotter (floating leaf) -- sine-wave movement
    // over the pit in section 4 (tiles 43-46)
    this.addEnemy('feuille_flotter', 44 * T, GROUND_Y - 5 * T, {
      amplitude: 2 * T,
      speed: 40,
    });

    // Brouillard blob guarding the final stretch
    this.addEnemy('brouillard_blob', 67 * T, GROUND_Y - 3 * T - 8, {
      patrolDistance: 3 * T,
    });

    // Pluie sprite in the final section to keep pressure on
    this.addEnemy('pluie_sprite', 72 * T, GROUND_Y - 10 * T, {
      fallSpeed: 100,
    });

    // =============================================
    // CHECKPOINTS & LEVEL END
    // =============================================

    // First checkpoint at section 3 (central island)
    this.addCheckpoint(28 * T, GROUND_Y - 16);

    // Second checkpoint at start of final section
    this.addCheckpoint(58 * T, GROUND_Y - 16);

    // Level end trigger at right edge (leave 2 tiles as landing zone)
    this.addLevelEnd(78 * T);
  }
}
