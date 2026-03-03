import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 3,
  levelNum: 2,
  levelWidth: 72,
  backgroundLayers: [
    { key: 'bg_world3_far', scrollX: 0.1 },
    { key: 'bg_world3_mid', scrollX: 0.3 },
    { key: 'bg_world3_near', scrollX: 0.6 },
  ],
};

export class World3Level2 extends GameScene {
  constructor() {
    super('World3Level2', config);
  }

  create(): void {
    super.create();

    this.add
      .text(4, 4, 'World 3-2: Palette Shift', {
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
    // TERRAIN - Alternating high/low sections with
    // vertical drops and multiple route choices
    // =============================================

    // --- Section 1: Starting plateau (tiles 0-9) ---
    // Normal ground to begin
    this.addGroundRow(0, GROUND_Y, 10);

    // --- Section 2: First vertical drop (tiles 10-20) ---
    // Ground rises to a high shelf, then drops to a low valley
    // Upper route: high shelf with platforms
    this.addGroundBlock(10 * T, GROUND_Y - 6 * T, 5, 1); // raised shelf
    this.addPlatform(11 * T, GROUND_Y - 9 * T, 3);        // upper route platform
    // Lower route: ground drops to a pit with platforms on the walls
    this.addGroundRow(16 * T, GROUND_Y, 5);                // valley floor
    this.addPlatform(14 * T, GROUND_Y - 3 * T, 2);        // stepping stone down

    // --- Section 3: Midfield corridor (tiles 21-33) ---
    // Low ground with platforms overhead creating route choices
    this.addGroundRow(21 * T, GROUND_Y, 13);
    // High route platforms
    this.addPlatform(22 * T, GROUND_Y - 5 * T, 3);
    this.addPlatform(26 * T, GROUND_Y - 7 * T, 4);
    this.addPlatform(31 * T, GROUND_Y - 5 * T, 3);
    // Mid route platform
    this.addPlatform(27 * T, GROUND_Y - 3 * T, 3);

    // --- Section 4: Chasm with pillars (tiles 34-46) ---
    // No continuous ground; tall pillars of varying height
    // Player must hop between pillar tops
    this.addGroundBlock(34 * T, GROUND_Y - 2 * T, 2, 3); // short pillar
    this.addGroundBlock(38 * T, GROUND_Y - 5 * T, 2, 6); // tall pillar
    this.addGroundBlock(42 * T, GROUND_Y - 3 * T, 2, 4); // medium pillar
    this.addGroundBlock(46 * T, GROUND_Y - 6 * T, 2, 7); // tallest pillar
    // Connecting platforms between pillars
    this.addPlatform(36 * T, GROUND_Y - 4 * T, 2);
    this.addPlatform(40 * T, GROUND_Y - 4 * T, 2);
    this.addPlatform(44 * T, GROUND_Y - 5 * T, 2);
    // Low hidden route beneath the pillars
    this.addGroundRow(35 * T, GROUND_Y, 3);
    this.addPlatform(39 * T, GROUND_Y - 1 * T, 2);

    // --- Section 5: Recovery zone (tiles 48-55) ---
    this.addGroundRow(48 * T, GROUND_Y, 8);
    this.addPlatform(50 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(54 * T, GROUND_Y - 6 * T, 2);

    // --- Section 6: Final gauntlet (tiles 56-71) ---
    // Raised ground with gaps and precarious platforms
    this.addGroundBlock(56 * T, GROUND_Y - 3 * T, 4, 4); // raised start
    // Gap (tiles 60-61)
    this.addGroundBlock(62 * T, GROUND_Y - 2 * T, 4, 3); // mid-height
    this.addPlatform(60 * T, GROUND_Y - 4 * T, 2);       // gap bridge
    // Final approach
    this.addGroundRow(66 * T, GROUND_Y, 6);
    this.addPlatform(67 * T, GROUND_Y - 4 * T, 3);

    // =============================================
    // COLLECTIBLES
    // =============================================

    // Macarons along the ground path
    this.addCollectible('macaron', 4 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 8 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 18 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 24 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 30 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 49 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 68 * T, GROUND_Y - 12);

    // Macarons on high route platforms
    this.addCollectible('macaron', 12 * T, GROUND_Y - 9 * T - 12);
    this.addCollectible('macaron', 27 * T, GROUND_Y - 7 * T - 12);
    this.addCollectible('macaron', 47 * T, GROUND_Y - 6 * T - 12);
    this.addCollectible('macaron', 55 * T, GROUND_Y - 6 * T - 12);
    this.addCollectible('macaron', 63 * T, GROUND_Y - 2 * T - 12);

    // Wing powerup in a precarious spot - on top of the tallest pillar
    this.addCollectible('wing_powerup', 47 * T, GROUND_Y - 6 * T - 12);

    // Choquette (heal) after the tough pillar section
    this.addCollectible('choquette', 51 * T, GROUND_Y - 4 * T - 12);

    // Birthday candle (index 7) - hidden behind the nuage_noir in section 4
    // Player must brave the storm cloud on the low hidden route beneath pillars
    this.addCollectible('birthday_candle', 40 * T, GROUND_Y - 1 * T - 12, {
      candleIndex: 7,
    });

    // =============================================
    // ENEMIES
    // =============================================

    // Nuage_noir (lightning) hovering over the midfield corridor
    this.addEnemy('nuage_noir', 25 * T, GROUND_Y - 10 * T, {
      patrolDistance: 5 * T,
    });

    // Nuage_noir guarding the hidden path beneath pillars (near birthday candle)
    this.addEnemy('nuage_noir', 38 * T, GROUND_Y - 3 * T, {
      patrolDistance: 3 * T,
    });

    // Papillon_gris patrolling the starting plateau
    this.addEnemy('papillon_gris', 6 * T, GROUND_Y - 8, {
      patrolDistance: 3 * T,
    });

    // Papillon_gris in the recovery zone
    this.addEnemy('papillon_gris', 52 * T, GROUND_Y - 8, {
      patrolDistance: 3 * T,
    });

    // Pierre_roulante on the raised ground of the final gauntlet
    this.addEnemy('pierre_roulante', 58 * T, GROUND_Y - 3 * T - 8, {
      patrolDistance: 2 * T,
    });

    // =============================================
    // CHECKPOINTS & LEVEL END
    // =============================================

    // First checkpoint after the midfield corridor
    this.addCheckpoint(33 * T, GROUND_Y - 16);

    // Second checkpoint at the recovery zone
    this.addCheckpoint(49 * T, GROUND_Y - 16);

    // Level end trigger (leave 2 tiles as landing zone)
    this.addLevelEnd(70 * T);
  }
}
