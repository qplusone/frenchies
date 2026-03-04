import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208

const config: GameSceneConfig = {
  worldNum: 3,
  levelNum: 1,
  levelWidth: 64,
  backgroundLayers: [
    { key: 'bg_world3_far', scrollX: 0.1 },
    { key: 'bg_world3_mid', scrollX: 0.3 },
    { key: 'bg_world3_near', scrollX: 0.6 },
  ],
};

export class World3Level1 extends GameScene {
  constructor() {
    super('World3Level1', config);
  }

  create(): void {
    super.create();

    this.add
      .text(4, 4, 'World 3-1: The Mirror Pond', {
        fontSize: '7px',
        color: '#6baaab',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // === EASTER EGG: Rachel's Pâtisserie — custom checkpoint sign ===
    // Placed near the checkpoint at tile 27
    const signX = 27 * TILE_SIZE - 20;
    const signY = GROUND_Y - 4 * TILE_SIZE;
    const sign = this.add.graphics();
    sign.setDepth(5);
    // Wooden signpost
    sign.fillStyle(0x8b6914);
    sign.fillRect(signX + 8, signY, 2, 32); // post
    // Sign board
    sign.fillStyle(0xdeb887);
    sign.fillRect(signX - 8, signY - 4, 36, 18);
    sign.lineStyle(1, 0x8b6914);
    sign.strokeRect(signX - 8, signY - 4, 36, 18);
    // Sign text
    this.add.text(signX + 10, signY + 1, "Rachel's\nPâtisserie", {
      fontSize: '5px',
      fontFamily: 'monospace',
      color: '#5c3a1a',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5, 0).setDepth(6);
  }

  protected buildLevel(): void {
    const T = TILE_SIZE;

    // --- Player spawn ---
    this.setSpawnPoint(40, GROUND_Y - 16);

    // =============================================
    // TERRAIN - Symmetrical "mirror pond" layout
    // Ground at bottom with arched bridges and
    // mirrored platform arrangements above/below
    // =============================================

    // --- Section 1: Starting shore (tiles 0-10) ---
    // Solid ground to ease the player in
    this.addGroundRow(0, GROUND_Y, 11);

    // --- Section 2: First arch bridge (tiles 11-22) ---
    // Ground drops away; elevated ground block forms a bridge at mid-height
    // "Reflection" platforms appear above and below the bridge
    this.addGroundBlock(13 * T, GROUND_Y - 5 * T, 8, 1); // bridge deck at y=128
    // Upper mirror platforms (above bridge)
    this.addPlatform(14 * T, GROUND_Y - 8 * T, 3); // high mirror
    this.addPlatform(18 * T, GROUND_Y - 8 * T, 3); // high mirror
    // Lower mirror platforms (below bridge, above the void)
    this.addPlatform(14 * T, GROUND_Y - 2 * T, 3); // low mirror
    this.addPlatform(18 * T, GROUND_Y - 2 * T, 3); // low mirror
    // Small ground at base of bridge sides for safety
    this.addGroundRow(11 * T, GROUND_Y, 2);
    this.addGroundRow(21 * T, GROUND_Y, 2);

    // --- Section 3: Pond clearing (tiles 23-33) ---
    // Open area with ground and symmetrical platforms
    this.addGroundRow(23 * T, GROUND_Y, 11);
    // Mirrored pair of platforms (like reflections in water)
    this.addPlatform(25 * T, GROUND_Y - 4 * T, 3); // left, mid-height
    this.addPlatform(30 * T, GROUND_Y - 4 * T, 3); // right, mid-height (mirror)
    // High center platform bridging the two
    this.addPlatform(27 * T, GROUND_Y - 7 * T, 4);

    // --- Section 4: Second arch bridge (tiles 34-47) ---
    // Taller bridge with deeper "pond" beneath
    this.addGroundRow(34 * T, GROUND_Y, 2); // left shore
    this.addGroundBlock(37 * T, GROUND_Y - 6 * T, 7, 1); // tall bridge deck at y=112
    this.addGroundRow(45 * T, GROUND_Y, 3); // right shore
    // Upper mirror platforms
    this.addPlatform(38 * T, GROUND_Y - 9 * T, 2);
    this.addPlatform(42 * T, GROUND_Y - 9 * T, 2);
    // Lower mirror platforms (hidden path beneath the bridge)
    this.addPlatform(37 * T, GROUND_Y - 3 * T, 3);
    this.addPlatform(41 * T, GROUND_Y - 3 * T, 3);
    // Tiny hidden platform under the bridge center (for birthday candle)
    this.addPlatform(39 * T, GROUND_Y - 1 * T, 2);

    // --- Section 5: Exit shore (tiles 48-63) ---
    this.addGroundRow(48 * T, GROUND_Y, 16);
    // Final decorative mirrored platforms
    this.addPlatform(51 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(56 * T, GROUND_Y - 4 * T, 3);

    // =============================================
    // COLLECTIBLES
    // =============================================

    // Macarons on the lower path (ground level / low platforms)
    this.addCollectible('macaron', 5 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 15 * T, GROUND_Y - 2 * T - 12);
    this.addCollectible('macaron', 20 * T, GROUND_Y - 2 * T - 12);
    this.addCollectible('macaron', 26 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 50 * T, GROUND_Y - 12);

    // Macarons on the upper path (high platforms)
    this.addCollectible('macaron', 15 * T, GROUND_Y - 8 * T - 12);
    this.addCollectible('macaron', 19 * T, GROUND_Y - 8 * T - 12);
    this.addCollectible('macaron', 28 * T, GROUND_Y - 7 * T - 12);
    this.addCollectible('macaron', 39 * T, GROUND_Y - 9 * T - 12);
    this.addCollectible('macaron', 57 * T, GROUND_Y - 4 * T - 12);

    // Paint drop on the harder upper path (high center platform, section 3)
    this.addCollectible('paint_drop', 29 * T, GROUND_Y - 7 * T - 12);

    // Birthday candle (index 6) - hidden beneath the tall bridge
    // Player must drop down from the bridge and land on the tiny platform at GROUND_Y - T
    this.addCollectible('birthday_candle', 40 * T, GROUND_Y - 1 * T - 12, {
      candleIndex: 6,
    });

    // =============================================
    // ENEMIES
    // =============================================

    // Feuille_flotter drifting across the first bridge area
    this.addEnemy('feuille_flotter', 16 * T, GROUND_Y - 5 * T - 8, {
      patrolDistance: 4 * T,
    });

    // Feuille_flotter on the pond clearing ground
    this.addEnemy('feuille_flotter', 31 * T, GROUND_Y - 8, {
      patrolDistance: 3 * T,
    });

    // Toile_daraignee (web) guarding upper path in section 3
    this.addEnemy('toile_daraignee', 28 * T, GROUND_Y - 6 * T, {});

    // Papillon_gris patrolling section 5
    this.addEnemy('papillon_gris', 54 * T, GROUND_Y - 8, {
      patrolDistance: 4 * T,
    });

    // =============================================
    // CHECKPOINT & LEVEL END
    // =============================================

    // Checkpoint at the pond clearing (roughly halfway)
    this.addCheckpoint(27 * T, GROUND_Y - 16);

    // Level end trigger (leave 2 tiles as landing zone)
    this.addLevelEnd(62 * T);
  }
}
