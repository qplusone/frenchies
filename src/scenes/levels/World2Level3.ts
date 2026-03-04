import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 2,
  levelNum: 3,
  levelWidth: 80,
  backgroundLayers: [
    { key: 'bg_world2_far', scrollX: 0.1 },
    { key: 'bg_world2_mid', scrollX: 0.3 },
    { key: 'bg_world2_near', scrollX: 0.6 },
  ],
};

/**
 * World 2-3: Foggy Arbor
 *
 * The most challenging level in World 2. Dense fog theme with
 * tricky platforming across long gaps, small platforms, and
 * clusters of enemies guarding key areas.
 */
export class World2Level3 extends GameScene {
  constructor() {
    super('World2Level3', config);
  }

  create(): void {
    super.create();

    this.add.text(4, 4, 'World 2-3: Foggy Arbor', {
      fontSize: '7px',
      color: '#6baaab',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setScrollFactor(0).setDepth(100);
  }

  protected buildLevel(): void {
    // --- Spawn ---
    this.setSpawnPoint(40, GROUND_Y - 16);

    // ======================================================
    // SECTION 1: Foggy entrance (tiles 0-11)
    // Solid ground with an early enemy to set the tone
    // ======================================================
    this.addGroundRow(0, GROUND_Y, 12);

    this.addCollectible('macaron', 3 * TILE_SIZE, GROUND_Y - 12);
    this.addCollectible('macaron', 7 * TILE_SIZE, GROUND_Y - 12);

    // Brouillard blob right at the start to establish the foggy theme
    this.addEnemy('brouillard_blob', 9 * TILE_SIZE, GROUND_Y - 8, {
      patrolDistance: 32,
    });

    // ======================================================
    // SECTION 2: First gap gauntlet (tiles 12-24)
    // Small platforms over a pit, requiring precise jumps
    // ======================================================
    // Gap — no ground from tile 12-13
    // Small platform
    this.addPlatform(14 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 2); // y=176, 2 tiles wide

    this.addCollectible('macaron', 15 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE - 12);

    // Gap — tiles 16-17
    // Another small platform
    this.addPlatform(18 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE, 2); // y=160

    this.addCollectible('macaron', 19 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE - 12);

    // Gap — tiles 20-21
    // Landing platform
    this.addPlatform(22 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 3); // y=176

    // Papillon gris swooping between the gap platforms
    this.addEnemy('papillon_gris', 20 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE, {
      swoopAmplitude: 28,
      swoopSpeed: 2.0,
    });

    // ======================================================
    // SECTION 3: Breather + souffle reward (tiles 25-33)
    // Solid ground section with a tough gauntlet ahead
    // ======================================================
    this.addGroundRow(25 * TILE_SIZE, GROUND_Y, 9);

    // Elevated platform with souffle for the upcoming challenge
    this.addPlatform(27 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE, 3); // y=160
    this.addCollectible('souffle', 28 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE - 12);

    this.addCollectible('macaron', 30 * TILE_SIZE, GROUND_Y - 12);

    // Brouillard blob guarding the ground
    this.addEnemy('brouillard_blob', 31 * TILE_SIZE, GROUND_Y - 8, {
      patrolDistance: 40,
    });

    // ======================================================
    // CHECKPOINT 1 (tile ~33)
    // ======================================================
    this.addCheckpoint(33 * TILE_SIZE, GROUND_Y - 16);

    // ======================================================
    // SECTION 4: Nuage noir gauntlet (tiles 34-46)
    // Lightning cloud overhead with platforms underneath
    // ======================================================
    this.addGroundRow(34 * TILE_SIZE, GROUND_Y, 5); // short ground strip

    // Nuage noir (lightning cloud) hovering over this section
    this.addEnemy('nuage_noir', 39 * TILE_SIZE, GROUND_Y - 8 * TILE_SIZE, {
      patrolDistance: 80,
      lightningInterval: 2500,
    });

    // Gap — tiles 39-40
    // Platform chain under the storm cloud
    this.addPlatform(41 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 2); // y=176

    this.addCollectible('macaron', 42 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE - 12);

    // Gap — tiles 43-44
    this.addPlatform(45 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE, 2); // y=160

    this.addCollectible('macaron', 46 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE - 12);

    // ======================================================
    // SECTION 5: Enemy wall + hidden birthday candle (tiles 47-58)
    // Wall of enemies guarding a birthday candle
    // ======================================================
    // Solid ground for the enemy-dense area
    this.addGroundRow(47 * TILE_SIZE, GROUND_Y, 12);

    // Choquette (health restore) before the enemy gauntlet
    this.addCollectible('choquette', 48 * TILE_SIZE, GROUND_Y - 12);

    // Brouillard blob patrol
    this.addEnemy('brouillard_blob', 51 * TILE_SIZE, GROUND_Y - 8, {
      patrolDistance: 48,
    });

    // Papillon gris swooping in the upper area
    this.addEnemy('papillon_gris', 54 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE, {
      swoopAmplitude: 20,
      swoopSpeed: 1.6,
    });

    // Elevated platforms forming a wall — candle is behind them
    this.addPlatform(53 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 3); // y=176
    this.addPlatform(53 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE, 3); // y=144

    this.addCollectible('macaron', 54 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE - 12);

    // Birthday candle hidden behind the wall of enemies
    // Player must fight through or sneak past to reach it
    this.addCollectible('birthday_candle', 57 * TILE_SIZE, GROUND_Y - 12, {
      candleIndex: 5,
    });

    this.addCollectible('macaron', 56 * TILE_SIZE, GROUND_Y - 12);

    // ======================================================
    // CHECKPOINT 2 (tile ~58)
    // ======================================================
    this.addCheckpoint(58 * TILE_SIZE, GROUND_Y - 16);

    // ======================================================
    // SECTION 6: Final fog run (tiles 59-80)
    // Tricky platforming finale with gaps and enemies
    // ======================================================
    // Short ground section
    this.addGroundRow(59 * TILE_SIZE, GROUND_Y, 5);

    this.addCollectible('macaron', 61 * TILE_SIZE, GROUND_Y - 12);

    // Gap — tiles 64-66 (long gap!)
    // Small stepping-stone platforms
    this.addPlatform(67 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 2); // y=176

    this.addCollectible('macaron', 68 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE - 12);

    // Gap — tiles 69-70
    this.addPlatform(71 * TILE_SIZE, GROUND_Y - TILE_SIZE, 2); // y=192

    this.addCollectible('macaron', 72 * TILE_SIZE, GROUND_Y - TILE_SIZE - 12);

    // Final ground stretch to the exit
    this.addGroundRow(73 * TILE_SIZE, GROUND_Y, 7); // tiles 73-79

    this.addCollectible('macaron', 75 * TILE_SIZE, GROUND_Y - 12);

    // ======================================================
    // LEVEL END (tile 78, with 2-tile landing zone before it)
    // ======================================================
    this.addLevelEnd(78 * TILE_SIZE);
  }
}
