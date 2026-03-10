import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE } from '../../config/GameConfig';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208
const T = TILE_SIZE; // shorthand

const config: GameSceneConfig = {
  worldNum: 4,
  levelNum: 1,
  levelWidth: 72,
  backgroundLayers: [
    { key: 'bg_world4_far', scrollX: 0.1 },
    { key: 'bg_world4_mid', scrollX: 0.3 },
    { key: 'bg_world4_near', scrollX: 0.6 },
  ],
};

/**
 * World 4-1: The Grand Alley
 *
 * Grand opening to the final world. Imposing ground columns with platforms
 * spanning between them, alternating terrain punctuated by large gaps, and
 * elevated walkways. A challenging but inviting entrance to the Birthday Garden.
 */
export class World4Level1 extends GameScene {
  constructor() {
    super('World4Level1', config);
  }

  create(): void {
    super.create();

    this.add
      .text(4, 4, 'World 4-1: The Grand Alley', {
        fontSize: '6px',
        color: '#6baaab',
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  protected buildLevel(): void {
    // --- Player spawn ---
    this.setSpawnPoint(40, GROUND_Y - 16);

    // =============================================
    // SECTION 1: Grand entrance (tiles 0-10)
    // Solid ground with tall column on the right
    // =============================================
    this.addGroundRow(0, GROUND_Y, 11);

    // Column 1: imposing pillar at tile 9-10 (2 wide, 4 tall)
    this.addGroundBlock(9 * T, GROUND_Y - 4 * T, 2, 4);

    // Macarons along the opening
    this.addCollectible('macaron', 3 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 6 * T, GROUND_Y - 12);

    // =============================================
    // SECTION 2: First big gap with floating platforms (tiles 11-19)
    // Gap spans tiles 11-18; floating platforms bridge the gap
    // =============================================

    // Platform bridging from column 1 to mid-gap
    this.addPlatform(11 * T, GROUND_Y - 4 * T, 3); // y=144

    // Mid-gap stepping stone
    this.addPlatform(15 * T, GROUND_Y - 3 * T, 2); // y=160

    // Macaron on the floating platforms
    this.addCollectible('macaron', 12 * T, GROUND_Y - 4 * T - 12);

    // Pierre roulante on the bridge platform -- forces quick crossing
    this.addEnemy('pierre_roulante', 12 * T, GROUND_Y - 4 * T - 8, {
      rollDirection: 'right',
      rollSpeed: 50,
    });

    // =============================================
    // SECTION 3: Column 2 + elevated walkway (tiles 19-28)
    // Column at 19-20, elevated ground at mid-height, lower ground beneath
    // =============================================

    // Column 2: pillar (2 wide, 7 tall, reaching up from GROUND_Y)
    this.addGroundBlock(19 * T, GROUND_Y - 7 * T, 2, 7);

    // Elevated walkway at mid-height (y = GROUND_Y - 4T = 144)
    this.addGroundBlock(21 * T, GROUND_Y - 4 * T, 8, 1);

    // Lower ground beneath the walkway
    this.addGroundRow(21 * T, GROUND_Y, 8);

    // Brouillard blob patrolling the elevated walkway
    this.addEnemy('brouillard_blob', 24 * T, GROUND_Y - 4 * T - 8, {
      patrolDistance: 4 * T,
    });

    // Macarons on elevated walkway
    this.addCollectible('macaron', 22 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 26 * T, GROUND_Y - 4 * T - 12);

    // Paint drop hidden on top of column 2
    this.addCollectible('paint_drop', 20 * T, GROUND_Y - 7 * T - 12);

    // =============================================
    // SECTION 4: Second gap + column 3 (tiles 29-37)
    // Gap at tiles 29-32, column 3 at 33-34
    // =============================================

    // Floating platform over second gap
    this.addPlatform(29 * T, GROUND_Y - 3 * T, 2); // y=160
    this.addPlatform(32 * T, GROUND_Y - 5 * T, 2); // y=128, stepping up

    // Column 3 (2 wide, 8 tall)
    this.addGroundBlock(33 * T, GROUND_Y - 8 * T, 2, 8);

    // Platform connecting column 3 to next section
    this.addPlatform(35 * T, GROUND_Y - 5 * T, 3); // y=128

    // Macaron on the ascending platforms
    this.addCollectible('macaron', 33 * T, GROUND_Y - 5 * T - 12);

    // =============================================
    // CHECKPOINT 1 (tile ~35, on the connecting platform)
    // =============================================
    this.addCheckpoint(36 * T, GROUND_Y - 5 * T - 16);

    // =============================================
    // SECTION 5: Descent corridor (tiles 38-46)
    // Ground returns, with columns creating an imposing corridor
    // =============================================

    // Floor
    this.addGroundRow(38 * T, GROUND_Y, 9);

    // Column 4 (left side of corridor)
    this.addGroundBlock(38 * T, GROUND_Y - 5 * T, 2, 5);

    // Column 5 (right side of corridor)
    this.addGroundBlock(45 * T, GROUND_Y - 5 * T, 2, 5);

    // Platform spanning between columns (elevated walkway above corridor)
    this.addPlatform(40 * T, GROUND_Y - 5 * T, 5);

    // Nuage noir hovering above the corridor -- lightning threat
    this.addEnemy('nuage_noir', 42 * T, GROUND_Y - 8 * T, {
      driftRange: 3 * T,
      lightningInterval: 3000,
    });

    // Pierre roulante on the corridor floor
    this.addEnemy('pierre_roulante', 43 * T, GROUND_Y - 8, {
      rollDirection: 'left',
      rollSpeed: 70,
    });

    // Choquette on the upper walkway (reward for braving the corridor)
    this.addCollectible('choquette', 42 * T, GROUND_Y - 5 * T - 12);

    // Macarons on the floor path
    this.addCollectible('macaron', 40 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 44 * T, GROUND_Y - 12);

    // =============================================
    // SECTION 6: Third gap + hidden candle pit (tiles 47-55)
    // Large gap with a hidden platform below sight line
    // =============================================

    // Gap from tiles 47-53 (7-tile gap, very wide)

    // Visible floating platforms to cross the gap
    this.addPlatform(48 * T, GROUND_Y - 3 * T, 2); // y=160
    this.addPlatform(51 * T, GROUND_Y - 4 * T, 2); // y=144

    // Macaron trail encouraging the normal path
    this.addCollectible('macaron', 49 * T, GROUND_Y - 3 * T - 12);

    // === HIDDEN BIRTHDAY CANDLE (index 9) ===
    // A hidden platform sits just below the first floating platform.
    // The player must drop down from the crossing platform to find it,
    // then jump back up to continue.
    this.addPlatform(49 * T, GROUND_Y - 1 * T, 3); // y=192, hidden below crossing
    this.addCollectible('birthday_candle', 50 * T, GROUND_Y - 1 * T - 12, {
      candleIndex: 9,
    });

    // Brouillard blob on the far platform guarding the crossing
    this.addEnemy('brouillard_blob', 52 * T, GROUND_Y - 4 * T - 8, {
      patrolDistance: T,
    });

    // =============================================
    // CHECKPOINT 2 (tile ~55)
    // =============================================

    // Ground resumes at tile 54
    this.addGroundRow(54 * T, GROUND_Y, 8);

    this.addCheckpoint(55 * T, GROUND_Y - 16);

    // =============================================
    // SECTION 7: Final stretch (tiles 54-71)
    // Grand column gateway to the level end
    // =============================================

    // Column 6: gate left pillar (2 wide, 4 tall)
    this.addGroundBlock(60 * T, GROUND_Y - 4 * T, 2, 4);

    // Column 7: gate right pillar (2 wide, 4 tall)
    this.addGroundBlock(66 * T, GROUND_Y - 4 * T, 2, 4);

    // Ground continues through the gate
    this.addGroundRow(62 * T, GROUND_Y, 10);

    // Platform archway between gate pillars
    this.addPlatform(62 * T, GROUND_Y - 4 * T, 4);

    // Final macarons through the gateway
    this.addCollectible('macaron', 63 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 65 * T, GROUND_Y - 12);

    // =============================================
    // LEVEL END (tile 70, with 2-tile landing zone)
    // =============================================
    this.addLevelEnd(70 * T);
  }
}
