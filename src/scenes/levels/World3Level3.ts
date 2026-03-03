import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 3,
  levelNum: 3,
  levelWidth: 80,
  backgroundLayers: [
    { key: 'bg_world3_far', scrollX: 0.1 },
    { key: 'bg_world3_mid', scrollX: 0.3 },
    { key: 'bg_world3_near', scrollX: 0.6 },
  ],
};

export class World3Level3 extends GameScene {
  constructor() {
    super('World3Level3', config);
  }

  create(): void {
    super.create();

    this.add
      .text(4, 4, 'World 3-3: Impressionist Express', {
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
    // TERRAIN - Fast-paced: small platforms, many
    // gaps, few safe spots. Requires rapid jumps.
    // =============================================

    // --- Section 1: Safe start (tiles 0-7) ---
    this.addGroundRow(0, GROUND_Y, 8);

    // --- Section 2: First rapid-jump gauntlet (tiles 9-24) ---
    // Small 2-3 tile platforms with 2-tile gaps between them
    this.addPlatform(9 * T, GROUND_Y - 2 * T, 2);   // low
    this.addPlatform(13 * T, GROUND_Y - 4 * T, 3);   // mid
    this.addPlatform(18 * T, GROUND_Y - 3 * T, 2);   // mid-low
    this.addPlatform(22 * T, GROUND_Y - 5 * T, 2);   // high
    // Small ground island for brief rest
    this.addGroundRow(25 * T, GROUND_Y, 3);

    // --- Section 3: Ascending staircase platforms (tiles 28-38) ---
    // Rapid ascending jumps with tiny platforms
    this.addPlatform(29 * T, GROUND_Y - 2 * T, 2);
    this.addPlatform(32 * T, GROUND_Y - 4 * T, 2);
    this.addPlatform(35 * T, GROUND_Y - 6 * T, 3);
    this.addPlatform(38 * T, GROUND_Y - 8 * T, 2);
    // Descending back down
    this.addPlatform(41 * T, GROUND_Y - 6 * T, 2);
    this.addPlatform(44 * T, GROUND_Y - 4 * T, 2);
    // Landing ground
    this.addGroundRow(47 * T, GROUND_Y, 4);

    // --- Section 4: Zigzag rapid platforms (tiles 51-64) ---
    // Alternating high-low-high pattern, all small
    this.addPlatform(52 * T, GROUND_Y - 3 * T, 2);  // low
    this.addPlatform(55 * T, GROUND_Y - 6 * T, 2);  // high
    this.addPlatform(58 * T, GROUND_Y - 3 * T, 3);  // low
    this.addPlatform(62 * T, GROUND_Y - 5 * T, 2);  // mid
    this.addPlatform(65 * T, GROUND_Y - 2 * T, 2);  // low
    // Small ground island
    this.addGroundRow(68 * T, GROUND_Y, 3);

    // --- Section 5: Final sprint (tiles 71-79) ---
    // Quick succession of tiny platforms to the exit
    this.addPlatform(72 * T, GROUND_Y - 3 * T, 2);
    this.addPlatform(75 * T, GROUND_Y - 4 * T, 2);
    // End ground
    this.addGroundRow(77 * T, GROUND_Y, 3);

    // --- Off-path secret area for birthday candle ---
    // Tiny platform far below and to the side of the ascending section
    // Player must deliberately drop from section 3 into the void area
    // and land on this isolated platform (requires knowing it's there)
    this.addPlatform(34 * T, GROUND_Y - 1 * T, 2);

    // =============================================
    // COLLECTIBLES
    // =============================================

    // Macarons along the main path - spread across all gauntlets
    // Section 1
    this.addCollectible('macaron', 4 * T, GROUND_Y - 12);
    // Section 2 - on rapid platforms
    this.addCollectible('macaron', 10 * T, GROUND_Y - 2 * T - 12);
    this.addCollectible('macaron', 14 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 19 * T, GROUND_Y - 3 * T - 12);
    this.addCollectible('macaron', 23 * T, GROUND_Y - 5 * T - 12);
    // Section 3 - ascending
    this.addCollectible('macaron', 33 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 36 * T, GROUND_Y - 6 * T - 12);
    this.addCollectible('macaron', 39 * T, GROUND_Y - 8 * T - 12);
    this.addCollectible('macaron', 42 * T, GROUND_Y - 6 * T - 12);
    // Section 4 - zigzag
    this.addCollectible('macaron', 53 * T, GROUND_Y - 3 * T - 12);
    this.addCollectible('macaron', 56 * T, GROUND_Y - 6 * T - 12);
    this.addCollectible('macaron', 59 * T, GROUND_Y - 3 * T - 12);
    this.addCollectible('macaron', 63 * T, GROUND_Y - 5 * T - 12);
    // Section 5
    this.addCollectible('macaron', 73 * T, GROUND_Y - 3 * T - 12);

    // Souffle (invincibility) for the hardest section - zigzag gauntlet
    this.addCollectible('souffle', 48 * T, GROUND_Y - 12);

    // Choquette (heal) on the rest island after ascending section
    this.addCollectible('choquette', 26 * T, GROUND_Y - 12);

    // Birthday candle (index 8) - on the hidden platform far off path
    // Player must deliberately fall from the ascending section (section 3)
    // to discover this isolated platform near the bottom of the level
    this.addCollectible('birthday_candle', 35 * T, GROUND_Y - 1 * T - 12, {
      candleIndex: 8,
    });

    // =============================================
    // ENEMIES
    // =============================================

    // Brouillard_blob on the safe start ground
    this.addEnemy('brouillard_blob', 5 * T, GROUND_Y - 8, {
      patrolDistance: 2 * T,
    });

    // Brouillard_blob on the rest island after first gauntlet
    this.addEnemy('brouillard_blob', 26 * T, GROUND_Y - 8, {
      patrolDistance: 2 * T,
    });

    // Feuille_flotter floating near the ascending platforms (section 3)
    this.addEnemy('feuille_flotter', 37 * T, GROUND_Y - 7 * T, {
      patrolDistance: 3 * T,
    });

    // Feuille_flotter in the zigzag section
    this.addEnemy('feuille_flotter', 60 * T, GROUND_Y - 4 * T, {
      patrolDistance: 3 * T,
    });

    // Nuage_noir hovering over the landing ground after section 3
    this.addEnemy('nuage_noir', 49 * T, GROUND_Y - 7 * T, {
      patrolDistance: 3 * T,
    });

    // Pluie_sprite in the final sprint area
    this.addEnemy('pluie_sprite', 74 * T, GROUND_Y - 5 * T, {
      patrolDistance: 2 * T,
    });

    // =============================================
    // CHECKPOINTS & LEVEL END
    // =============================================

    // First checkpoint on the rest island after the ascending section
    this.addCheckpoint(48 * T, GROUND_Y - 16);

    // Second checkpoint on the rest island before the final sprint
    this.addCheckpoint(69 * T, GROUND_Y - 16);

    // Level end trigger (leave 2 tiles as landing zone)
    this.addLevelEnd(78 * T);
  }
}
