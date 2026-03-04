import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 2,
  levelNum: 2,
  levelWidth: 72,
  backgroundLayers: [
    { key: 'bg_world2_far', scrollX: 0.1 },
    { key: 'bg_world2_mid', scrollX: 0.3 },
    { key: 'bg_world2_near', scrollX: 0.6 },
  ],
};

/**
 * World 2-2: The Greenhouse
 *
 * Indoor greenhouse feel with enclosed platforms and vine-like
 * vertical sections. Multiple vertical platforming challenges
 * with narrow ground sections between large gaps.
 */
export class World2Level2 extends GameScene {
  constructor() {
    super('World2Level2', config);
  }

  create(): void {
    super.create();

    this.add.text(4, 4, 'World 2-2: The Greenhouse', {
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
    // SECTION 1: Entry corridor (tiles 0-10)
    // Flat ground with a few collectibles to ease in
    // ======================================================
    this.addGroundRow(0, GROUND_Y, 11);

    this.addCollectible('macaron', 3 * TILE_SIZE, GROUND_Y - 12);
    this.addCollectible('macaron', 6 * TILE_SIZE, GROUND_Y - 12);

    // ======================================================
    // SECTION 2: First vertical shaft (tiles 11-19)
    // Tall column of stacked platforms — climb upward
    // ======================================================
    // Narrow ground at the base of the shaft
    this.addGroundRow(11 * TILE_SIZE, GROUND_Y, 9);

    // Wall-like ground blocks on the sides to create the enclosed feel
    this.addGroundBlock(11 * TILE_SIZE, GROUND_Y - 7 * TILE_SIZE, 2, 7); // left wall
    this.addGroundBlock(18 * TILE_SIZE, GROUND_Y - 7 * TILE_SIZE, 2, 7); // right wall

    // Staggered platforms inside the shaft for climbing
    this.addPlatform(13 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 3);  // y=176
    this.addPlatform(15 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE, 3);  // y=144
    this.addPlatform(13 * TILE_SIZE, GROUND_Y - 6 * TILE_SIZE, 3);  // y=112

    // Macarons along the vertical climb
    this.addCollectible('macaron', 14 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE - 12);
    this.addCollectible('macaron', 16 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE - 12);
    this.addCollectible('macaron', 14 * TILE_SIZE, GROUND_Y - 6 * TILE_SIZE - 12);

    // Feuille flotter drifting inside the shaft
    this.addEnemy('feuille_flotter', 15 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE, {
      floatAmplitude: 12,
      floatSpeed: 1.2,
    });

    // ======================================================
    // SECTION 3: Greenhouse canopy bridge (tiles 20-30)
    // Elevated walkway at the top of the shaft
    // ======================================================
    // High ground bridge
    this.addGroundBlock(20 * TILE_SIZE, GROUND_Y - 7 * TILE_SIZE, 11, 1); // y=96

    this.addCollectible('macaron', 23 * TILE_SIZE, GROUND_Y - 7 * TILE_SIZE - 12);
    this.addCollectible('macaron', 27 * TILE_SIZE, GROUND_Y - 7 * TILE_SIZE - 12);

    // Papillon gris swooping across the bridge
    this.addEnemy('papillon_gris', 25 * TILE_SIZE, GROUND_Y - 8 * TILE_SIZE, {
      swoopAmplitude: 24,
      swoopSpeed: 1.8,
    });

    // ======================================================
    // CHECKPOINT 1 (tile ~29, on the canopy bridge)
    // ======================================================
    this.addCheckpoint(29 * TILE_SIZE, GROUND_Y - 7 * TILE_SIZE - 16);

    // ======================================================
    // SECTION 4: Descent into the second greenhouse (tiles 31-40)
    // Drop down from canopy through platforms
    // ======================================================
    // Staggered platforms for descending
    this.addPlatform(31 * TILE_SIZE, GROUND_Y - 5 * TILE_SIZE, 3);  // y=128
    this.addPlatform(34 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE, 3);  // y=160
    this.addPlatform(31 * TILE_SIZE, GROUND_Y - TILE_SIZE, 3);      // y=192

    // Narrow ground section between the two shafts
    this.addGroundRow(34 * TILE_SIZE, GROUND_Y, 7); // tiles 34-40

    // Toile d'araignee (web) in the descent — slows the player
    this.addEnemy('toile_daraignee', 33 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE, {
      webRadius: 32,
    });

    this.addCollectible('macaron', 35 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE - 12);

    // ======================================================
    // SECTION 5: Second vertical shaft with wing powerup (tiles 41-52)
    // Taller shaft, tighter platforms, wing powerup inside
    // ======================================================
    // Ground at base
    this.addGroundRow(41 * TILE_SIZE, GROUND_Y, 12);

    // Walls for the enclosed shaft
    this.addGroundBlock(41 * TILE_SIZE, GROUND_Y - 9 * TILE_SIZE, 2, 9);  // left wall
    this.addGroundBlock(51 * TILE_SIZE, GROUND_Y - 9 * TILE_SIZE, 2, 9);  // right wall

    // Staggered platforms inside — tighter spacing
    this.addPlatform(43 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 3);  // y=176
    this.addPlatform(47 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE, 3);  // y=160
    this.addPlatform(43 * TILE_SIZE, GROUND_Y - 5 * TILE_SIZE, 3);  // y=128
    this.addPlatform(47 * TILE_SIZE, GROUND_Y - 6 * TILE_SIZE, 3);  // y=112
    this.addPlatform(45 * TILE_SIZE, GROUND_Y - 8 * TILE_SIZE, 3);  // y=80 (top)

    // Wing powerup in the tight shaft
    this.addCollectible('wing_powerup', 48 * TILE_SIZE, GROUND_Y - 3 * TILE_SIZE - 12);

    // Feuille flotter in the second shaft
    this.addEnemy('feuille_flotter', 46 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE, {
      floatAmplitude: 14,
      floatSpeed: 1.4,
    });

    // Macaron on the top platform
    this.addCollectible('macaron', 46 * TILE_SIZE, GROUND_Y - 8 * TILE_SIZE - 12);

    // Birthday candle at the very top of the shaft — must climb all the way up
    this.addCollectible('birthday_candle', 46 * TILE_SIZE, GROUND_Y - 9 * TILE_SIZE - 12, {
      candleIndex: 4,
    });

    // ======================================================
    // CHECKPOINT 2 (tile ~52, after the second shaft)
    // ======================================================
    // Small bridge connecting shaft exit to the final area
    this.addGroundBlock(53 * TILE_SIZE, GROUND_Y - 7 * TILE_SIZE, 4, 1); // y=96

    this.addCheckpoint(54 * TILE_SIZE, GROUND_Y - 7 * TILE_SIZE - 16);

    // ======================================================
    // SECTION 6: Exit corridor (tiles 57-72)
    // Final stretch at mid-height, drops to ground for exit
    // ======================================================
    // Mid-height ground
    this.addGroundBlock(57 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE, 8, 1); // y=144

    this.addCollectible('macaron', 59 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE - 12);
    this.addCollectible('macaron', 62 * TILE_SIZE, GROUND_Y - 4 * TILE_SIZE - 12);

    // Step-down platforms to ground level
    this.addPlatform(65 * TILE_SIZE, GROUND_Y - 2 * TILE_SIZE, 3); // y=176

    // Final ground stretch
    this.addGroundRow(65 * TILE_SIZE, GROUND_Y, 7); // tiles 65-71

    this.addCollectible('macaron', 67 * TILE_SIZE, GROUND_Y - 12);

    // ======================================================
    // LEVEL END (tile 70, with 2-tile landing zone before it)
    // ======================================================
    this.addLevelEnd(70 * TILE_SIZE);
  }
}
