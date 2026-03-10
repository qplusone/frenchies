import { GameScene, GameSceneConfig } from '../GameScene';
import { GAME_HEIGHT, TILE_SIZE, PALETTE } from '../../config/GameConfig';
import { AudioManager } from '../../systems/AudioManager';

const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 208
const T = TILE_SIZE; // shorthand

const config: GameSceneConfig = {
  worldNum: 4,
  levelNum: 2,
  levelWidth: 80,
  backgroundLayers: [
    { key: 'bg_world4_far', scrollX: 0.1 },
    { key: 'bg_world4_mid', scrollX: 0.3 },
    { key: 'bg_world4_near', scrollX: 0.6 },
  ],
};

/**
 * World 4-2: Monet's Studio
 *
 * The most technically challenging level in the game. Complex multi-path
 * design with vertical and horizontal sections, tight platforming sequences,
 * and enemies positioned to interfere with jumps. Contains the LAST birthday
 * candle (index 10), hidden behind the hardest detour in the game.
 */
export class World4Level2 extends GameScene {
  constructor() {
    super('World4Level2', config);
  }

  create(): void {
    super.create();

    this.add
      .text(4, 4, 'World 4-2: Monet\'s Studio', {
        fontSize: '7px',
        color: '#6baaab',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // === EASTER EGG: Giant Birthday Soufflé ===
    // An oversized soufflé near the middle of the level
    const souffleX = 40 * T;
    const souffleY = GROUND_Y - 3 * T;
    const bigSouffle = this.add.graphics();
    bigSouffle.setDepth(4);
    // Giant soufflé body
    bigSouffle.fillStyle(PALETTE.softGold);
    bigSouffle.fillRect(souffleX - 10, souffleY - 4, 20, 12);
    bigSouffle.fillStyle(0xffeebb);
    bigSouffle.fillRect(souffleX - 8, souffleY - 10, 16, 10);
    // Rising steam lines
    bigSouffle.lineStyle(1, 0xffffff, 0.4);
    bigSouffle.lineBetween(souffleX - 4, souffleY - 12, souffleX - 3, souffleY - 18);
    bigSouffle.lineBetween(souffleX + 4, souffleY - 12, souffleX + 3, souffleY - 18);

    // Overlap trigger
    const souffleZone = this.add.zone(souffleX, souffleY - 2, 24, 20);
    this.physics.add.existing(souffleZone, true);
    let souffleCollected = false;

    this.physics.add.overlap(this.player, souffleZone, () => {
      if (souffleCollected) return;
      souffleCollected = true;
      AudioManager.getInstance().playSFX('collectRare');

      // Destroy the soufflé graphic
      bigSouffle.destroy();

      // Party hats on both dogs!
      const hatColors = [0xff6b6b, 0x66ccff, 0xffdd44, 0xff88cc, 0x88ff88];
      for (let i = 0; i < 8; i++) {
        const hat = this.add.graphics();
        hat.fillStyle(hatColors[i % hatColors.length]);
        hat.fillTriangle(0, 10, 5, 0, 10, 10);
        hat.fillStyle(0xffdd44);
        hat.fillCircle(5, 0, 2);
        hat.setPosition(
          this.player.x + Phaser.Math.Between(-30, 30),
          this.player.y - Phaser.Math.Between(10, 40),
        );
        hat.setDepth(50);
        this.tweens.add({
          targets: hat,
          y: hat.y + 40,
          angle: Phaser.Math.Between(-180, 180),
          alpha: 0,
          duration: Phaser.Math.Between(1000, 2000),
          onComplete: () => hat.destroy(),
        });
      }

      // Party text
      const txt = this.add.text(this.player.x, this.player.y - 30, 'Party Time!', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#ffdd44',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(50);
      this.tweens.add({
        targets: txt,
        y: txt.y - 20,
        alpha: 0,
        delay: 1500,
        duration: 800,
        onComplete: () => txt.destroy(),
      });

      // Also grant invincibility like a regular soufflé
      this.player.isInvincible = true;
      this.player.setTint(0xffdd44);
      this.time.delayedCall(8000, () => {
        if (this.player.active) {
          this.player.isInvincible = false;
          this.player.clearTint();
        }
      });
    });
  }

  protected buildLevel(): void {
    // --- Player spawn ---
    this.setSpawnPoint(40, GROUND_Y - 16);

    // =============================================
    // SECTION 1: The Foyer (tiles 0-9)
    // Solid ground, short and direct -- calm before the storm
    // =============================================
    this.addGroundRow(0, GROUND_Y, 10);

    // Macarons to ease the player in
    this.addCollectible('macaron', 3 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 7 * T, GROUND_Y - 12);

    // =============================================
    // SECTION 2: The Ascending Gallery (tiles 10-23)
    // Multi-tier vertical climb with enemies on each tier.
    // Two paths: low ground route (harder, enemies), high platform
    // route (requires precision jumps).
    // =============================================

    // --- LOW PATH (ground level) ---
    // Ground with a raised step
    this.addGroundRow(10 * T, GROUND_Y, 6); // tiles 10-15
    this.addGroundBlock(16 * T, GROUND_Y - 2 * T, 4, 3); // raised block y=176, tiles 16-19

    // Papillon gris on ground path -- swoops to interfere
    this.addEnemy('papillon_gris', 13 * T, GROUND_Y - 3 * T, {
      swoopAmplitude: 32,
      swoopSpeed: 1.8,
    });

    // Feuille flotter above the raised block
    this.addEnemy('feuille_flotter', 18 * T, GROUND_Y - 4 * T, {
      floatAmplitude: 20,
      floatSpeed: 1.2,
    });

    // --- HIGH PATH (platforms above) ---
    // Accessible by jumping from the starting ground onto ascending platforms
    this.addPlatform(11 * T, GROUND_Y - 4 * T, 2); // y=144
    this.addPlatform(14 * T, GROUND_Y - 6 * T, 2); // y=112
    this.addPlatform(17 * T, GROUND_Y - 7 * T, 3); // y=96

    // Macaron reward on high path
    this.addCollectible('macaron', 15 * T, GROUND_Y - 6 * T - 12);
    this.addCollectible('macaron', 18 * T, GROUND_Y - 7 * T - 12);

    // Both paths converge at tiles 20-23 -- landing ledge
    this.addGroundBlock(20 * T, GROUND_Y - 3 * T, 4, 4); // y=160, 4 rows deep

    // Macaron on the convergence ledge
    this.addCollectible('macaron', 22 * T, GROUND_Y - 3 * T - 12);

    // =============================================
    // SECTION 3: The Gauntlet (tiles 24-35)
    // Tight platforming over a pit with enemies interfering.
    // Souffle powerup before the gauntlet as a lifeline.
    // =============================================

    // Souffle before the hard part
    this.addCollectible('souffle', 21 * T, GROUND_Y - 3 * T - 12);

    // No ground from tiles 24-35 (12-tile pit!) -- pure platforming
    // Series of small platforms with enemies placed to disrupt jumps

    // Platform chain across the gauntlet
    this.addPlatform(24 * T, GROUND_Y - 4 * T, 2); // y=144
    this.addPlatform(27 * T, GROUND_Y - 3 * T, 2); // y=160
    this.addPlatform(30 * T, GROUND_Y - 5 * T, 2); // y=128
    this.addPlatform(33 * T, GROUND_Y - 3 * T, 2); // y=160

    // Nuage noir over the gauntlet -- lightning threatens the platforms
    this.addEnemy('nuage_noir', 28 * T, GROUND_Y - 8 * T, {
      driftRange: 4 * T,
      lightningInterval: 2500,
    });

    // Papillon gris swooping through the platform chain
    this.addEnemy('papillon_gris', 31 * T, GROUND_Y - 4 * T, {
      swoopAmplitude: 24,
      swoopSpeed: 2.0,
    });

    // Macarons placed on gauntlet platforms
    this.addCollectible('macaron', 25 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 31 * T, GROUND_Y - 5 * T - 12);

    // =============================================
    // CHECKPOINT 1 (tile ~36)
    // =============================================

    // Safe ground after the gauntlet
    this.addGroundRow(36 * T, GROUND_Y, 8); // tiles 36-43

    this.addCheckpoint(37 * T, GROUND_Y - 16);

    // =============================================
    // SECTION 4: The Hidden Detour + Candle (tiles 36-46)
    // Main path continues right at ground level.
    // SECRET: Below tile 40-42, a hidden shaft leads down to an
    // invisible lower chamber with the FINAL birthday candle.
    // The player must leap of faith off the left edge of a gap.
    // =============================================

    // Macarons along the main path (red herring, drawing player right)
    this.addCollectible('macaron', 39 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 41 * T, GROUND_Y - 12);

    // Toile d'araignee web trap in the main path -- slows the player
    this.addEnemy('toile_daraignee', 40 * T, GROUND_Y - 8, {
      webRadius: 24,
    });

    // === SECRET DETOUR: Hidden platform beneath the gap ===
    // Gap in ground at tiles 44-46 (looks like a death pit)
    // tiles 44-46 have NO ground row -- the ground row above stops at 43

    // Ground resumes after the gap at tile 47
    this.addGroundRow(47 * T, GROUND_Y, 6); // tiles 47-52

    // Hidden platform just below the gap edge — player must drop down
    // from tile 43 to find it, then jump back up to tile 47
    this.addPlatform(44 * T, GROUND_Y - 1 * T, 3); // y=192, hidden below gap

    // === BIRTHDAY CANDLE (index 10) -- THE FINAL CANDLE ===
    // On the hidden platform beneath the gap. The player must take a
    // leap of faith off the edge, land on the hidden platform, collect
    // the candle, then jump back up to continue.
    this.addCollectible('birthday_candle', 45 * T, GROUND_Y - 1 * T - 12, {
      candleIndex: 10,
    });

    // =============================================
    // SECTION 5: The Vertical Maze (tiles 47-60)
    // Complex multi-level area with three tiers of platforms
    // and ground, enemies on each level.
    // =============================================

    // Tier 1: Ground level (already placed: tiles 47-52)

    // Tier 2: Mid-level platforms
    this.addGroundBlock(49 * T, GROUND_Y - 4 * T, 6, 1); // y=144, tiles 49-54
    this.addPlatform(56 * T, GROUND_Y - 4 * T, 3); // y=144, tiles 56-58

    // Tier 3: Upper platforms
    this.addPlatform(51 * T, GROUND_Y - 7 * T, 3); // y=96, tiles 51-53
    this.addPlatform(55 * T, GROUND_Y - 8 * T, 2); // y=80, tiles 55-56

    // Ground continues at floor level
    this.addGroundRow(53 * T, GROUND_Y, 8); // tiles 53-60

    // Enemies positioned across the tiers to threaten all routes
    // Feuille flotter between tier 1 and tier 2
    this.addEnemy('feuille_flotter', 50 * T, GROUND_Y - 2 * T, {
      floatAmplitude: 16,
      floatSpeed: 1.5,
    });

    // Nuage noir above tier 2 -- threatens tier 2 and 3
    this.addEnemy('nuage_noir', 54 * T, GROUND_Y - 10 * T, {
      driftRange: 3 * T,
      lightningInterval: 2800,
    });

    // Wing powerup on upper tier 3 -- difficult to reach
    this.addCollectible('wing_powerup', 56 * T, GROUND_Y - 8 * T - 12);

    // Macarons on different tiers
    this.addCollectible('macaron', 50 * T, GROUND_Y - 4 * T - 12); // tier 2
    this.addCollectible('macaron', 52 * T, GROUND_Y - 7 * T - 12); // tier 3
    this.addCollectible('macaron', 57 * T, GROUND_Y - 4 * T - 12); // tier 2 right
    this.addCollectible('macaron', 58 * T, GROUND_Y - 12);         // floor

    // =============================================
    // CHECKPOINT 2 (tile ~60)
    // =============================================
    this.addCheckpoint(60 * T, GROUND_Y - 16);

    // =============================================
    // SECTION 6: The Final Gallery (tiles 61-79)
    // Intense final stretch with tight platform hops and enemies
    // =============================================

    // Ground with gaps
    this.addGroundRow(61 * T, GROUND_Y, 5); // tiles 61-65

    // Gap at tiles 66-68 (3-tile gap)
    this.addPlatform(66 * T, GROUND_Y - 3 * T, 2); // bridge platform

    // Ground resumes
    this.addGroundRow(69 * T, GROUND_Y, 11); // tiles 69-79

    // Elevated walkway over final stretch
    this.addGroundBlock(71 * T, GROUND_Y - 4 * T, 4, 1); // y=144

    // Enemies in the final gallery
    this.addEnemy('feuille_flotter', 64 * T, GROUND_Y - 3 * T, {
      floatAmplitude: 12,
      floatSpeed: 2.0,
    });

    this.addEnemy('papillon_gris', 74 * T, GROUND_Y - 3 * T, {
      swoopAmplitude: 28,
      swoopSpeed: 1.5,
    });

    // Final macarons
    this.addCollectible('macaron', 63 * T, GROUND_Y - 12);
    this.addCollectible('macaron', 73 * T, GROUND_Y - 4 * T - 12);
    this.addCollectible('macaron', 76 * T, GROUND_Y - 12);

    // =============================================
    // LEVEL END (tile 78, with 2-tile landing zone)
    // =============================================
    this.addLevelEnd(78 * T);
  }
}
