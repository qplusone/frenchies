import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE, PALETTE } from '../../config/GameConfig';
import { GameManager } from '../../systems/GameManager';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208
const T = TILE_SIZE; // shorthand

const config: GameSceneConfig = {
  worldNum: 4,
  levelNum: 3,
  levelWidth: 64,
  backgroundLayers: [
    { key: 'bg_world4_far', scrollX: 0.1 },
    { key: 'bg_world4_mid', scrollX: 0.3 },
    { key: 'bg_world4_near', scrollX: 0.6 },
  ],
};

/**
 * World 4-3: The Birthday Garden
 *
 * The celebration level — final non-boss stage.
 * Generous with collectibles, moderate difficulty.
 * Platforms suggest party/garden elements.
 */
export class World4Level3 extends GameScene {
  constructor() {
    super('World4Level3', config);
  }

  create(): void {
    super.create();
    this.add.text(4, 4, 'World 4-3: The Birthday Garden', {
      fontSize: '7px',
      color: '#ffaacc',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setScrollFactor(0).setDepth(100);

    // === EASTER EGG: Birthday flower arrangement ===
    // If all 11 candles are collected, show "RACHEL" in flowers
    const gm = GameManager.instance;
    if (gm.allCandlesFound) {
      this.drawBirthdayFlowers();
    }
  }

  private drawBirthdayFlowers(): void {
    // Draw "RACHEL" in small flower sprites at the celebration area (section 3)
    const baseX = 36 * T;
    const baseY = GROUND_Y - 10 * T;
    const flowerColors = [0xff6b6b, 0xff88cc, PALETTE.lilyPink, 0xffaadd, 0xff99bb];

    // Simplified 5x5 pixel letters for "RACHEL"
    const letters: Record<string, number[][]> = {
      R: [[1,1,1,0,0],[1,0,0,1,0],[1,1,1,0,0],[1,0,1,0,0],[1,0,0,1,0]],
      A: [[0,1,1,0,0],[1,0,0,1,0],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,1,0]],
      C: [[0,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,0]],
      H: [[1,0,0,1,0],[1,0,0,1,0],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,1,0]],
      E: [[1,1,1,1,0],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[1,1,1,1,0]],
      L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0]],
    };

    const word = 'RACHEL';
    const spacing = 5; // pixels between letter columns
    let offsetX = 0;
    for (const char of word) {
      const grid = letters[char];
      if (!grid) continue;
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (grid[row][col]) {
            const flower = this.add.graphics();
            const c = flowerColors[(row + col + offsetX) % flowerColors.length];
            flower.fillStyle(c);
            flower.fillCircle(1, 1, 1.5);
            flower.fillStyle(0xffdd44);
            flower.fillCircle(1, 1, 0.5);
            flower.setPosition(baseX + offsetX + col * 3, baseY + row * 3);
            flower.setDepth(2);
          }
        }
      }
      offsetX += spacing * 3;
    }

    // Celebratory text below
    this.add.text(baseX + 40, baseY + 20, 'Happy Birthday!', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#ffdd44',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(2);
  }

  protected buildLevel(): void {
    // === Spawn ===
    this.setSpawnPoint(40, GROUND_Y - 16);

    // === Ground sections — garden path with small scenic gaps ===

    // Section 1: Garden entrance (tiles 0-14)
    this.addGroundRow(0, GROUND_Y, 15);

    // Small decorative gap (tiles 15-16)

    // Section 2: Flower beds (tiles 17-30)
    this.addGroundRow(17 * T, GROUND_Y, 14);

    // Small gap (tiles 31-32)

    // Section 3: The party area (tiles 33-48)
    this.addGroundRow(33 * T, GROUND_Y, 16);

    // Small gap (tiles 49-50)

    // Section 4: Finale walkway (tiles 51-63)
    this.addGroundRow(51 * T, GROUND_Y, 13);

    // === Platforms — arranged in festive arches ===

    // Section 1: Stepping stones over entrance
    this.addPlatform(3 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(8 * T, GROUND_Y - 5 * T, 3);
    this.addPlatform(12 * T, GROUND_Y - 3 * T, 2);

    // Bridge over first gap
    this.addPlatform(15 * T, GROUND_Y - 3 * T, 2);

    // Section 2: Tiered garden platforms
    this.addPlatform(19 * T, GROUND_Y - 3 * T, 4);
    this.addPlatform(21 * T, GROUND_Y - 6 * T, 3);
    this.addPlatform(25 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(28 * T, GROUND_Y - 7 * T, 2);

    // Bridge over second gap
    this.addPlatform(31 * T, GROUND_Y - 3 * T, 2);

    // Section 3: Party platforms — cake-tier arrangement
    this.addPlatform(35 * T, GROUND_Y - 3 * T, 6);
    this.addPlatform(37 * T, GROUND_Y - 6 * T, 4);
    this.addPlatform(38 * T, GROUND_Y - 9 * T, 2);
    this.addPlatform(43 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(46 * T, GROUND_Y - 6 * T, 2);

    // Bridge over third gap
    this.addPlatform(49 * T, GROUND_Y - 3 * T, 2);

    // Section 4: Final platforms
    this.addPlatform(53 * T, GROUND_Y - 4 * T, 3);
    this.addPlatform(57 * T, GROUND_Y - 3 * T, 3);

    // === Macarons — generous celebration rewards (16 total) ===

    // Section 1 ground path
    this.addCollectible('macaron', 4 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 7 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 11 * T, GROUND_Y - 12);

    // Section 1 platforms
    this.addCollectible('macaron', 4 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 9 * T, GROUND_Y - 5 * T - 12);

    // Section 2 ground
    this.addCollectible('macaron', 19 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 23 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 27 * T, GROUND_Y - 12);

    // Section 2 platforms
    this.addCollectible('macaron', 22 * T, GROUND_Y - 6 * T - 12);
    this.addCollectible('macaron', 29 * T, GROUND_Y - 7 * T - 12);

    // Section 3 — party area, lots of macarons
    this.addCollectible('macaron', 36 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 40 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 44 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 38 * T, GROUND_Y - 6 * T - 12);
    this.addCollectible('macaron', 39 * T, GROUND_Y - 9 * T - 12);

    // Section 4
    this.addCollectible('macaron', 56 * T, GROUND_Y - 12);

    // === Choquettes (3 heals) ===
    this.addCollectible('choquette', 14 * T, GROUND_Y - 12);
    this.addCollectible('choquette', 33 * T, GROUND_Y - 12);
    this.addCollectible('choquette', 54 * T, GROUND_Y - 4 * T - 12);

    // === Paint drop ===
    this.addCollectible('paint_drop', 28 * T, GROUND_Y - 7 * T - 12);

    // === Souffle near the end ===
    this.addCollectible('souffle', 46 * T, GROUND_Y - 6 * T - 12);

    // === Enemies — light difficulty for celebration ===
    this.addEnemy('brouillard_blob', 8 * T, GROUND_Y - 8, { patrolDistance: 32 });
    this.addEnemy('brouillard_blob', 42 * T, GROUND_Y - 8, { patrolDistance: 40 });
    this.addEnemy('feuille_flotter', 26 * T, GROUND_Y - 5 * T, { amplitude: 20, driftDistance: 30 });

    // === Checkpoints ===
    this.addCheckpoint(24 * T, GROUND_Y - 8);
    this.addCheckpoint(48 * T, GROUND_Y - 8);

    // === Level end ===
    this.addLevelEnd(62 * T);
  }
}
