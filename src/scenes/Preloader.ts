import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../config/GameConfig';
import { generateAllSprites } from '../assets/SpriteGenerator';
import { generateAnimations } from '../assets/AnimationGenerator';

export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload(): void {
    // Loading bar
    const barWidth = GAME_WIDTH * 0.6;
    const barHeight = 8;
    const barX = (GAME_WIDTH - barWidth) / 2;
    const barY = GAME_HEIGHT / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x333333);
    bg.fillRect(barX, barY, barWidth, barHeight);

    const bar = this.add.graphics();
    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(PALETTE.softGold);
      bar.fillRect(barX, barY, barWidth * value, barHeight);
    });

    this.load.on('complete', () => {
      bar.destroy();
      bg.destroy();
    });

    // Generate placeholder sprites
    this.generatePlaceholders();

    // Generate additional detailed sprites (enemies, tilesets, backgrounds, UI)
    generateAllSprites(this);
  }

  create(): void {
    // Generate sprite sheet animations (after textures are created in preload)
    generateAnimations(this);
    this.scene.start('TitleScreen');
  }

  private generatePlaceholders(): void {
    // Poppleton placeholder — fawn French Bulldog
    const pg = this.make.graphics({ x: 0, y: 0 });
    this.drawFrenchiePlaceholder(pg, 0xd4a057, 0xb8883a, 0xe8c47a, 0x4a3728, false);
    pg.generateTexture('poppleton', 16, 16);
    pg.destroy();

    // Zacko placeholder — black & white French Bulldog
    const zg = this.make.graphics({ x: 0, y: 0 });
    this.drawFrenchiePlaceholder(zg, 0x2a2a2a, 0x1a1a1a, 0x3a3a3a, 0xdddddd, true);
    zg.generateTexture('zacko', 16, 16);
    zg.destroy();

    // Macaron placeholder — oval shape with top shell, filling, bottom shell
    const mg = this.make.graphics({ x: 0, y: 0 });
    const mPink = 0xe8b4b8;
    const mCream = 0xfff0e0;
    const mDark = 0xc89498;
    // Top shell (rounded)
    mg.fillStyle(mPink);
    mg.fillRect(1, 0, 6, 1);
    mg.fillRect(0, 1, 8, 2);
    // Filling layer with "feet" texture
    mg.fillStyle(mCream);
    mg.fillRect(0, 3, 8, 2);
    // Feet texture (bumpy edge on filling)
    mg.fillStyle(mDark);
    mg.fillRect(0, 3, 1, 1); mg.fillRect(2, 3, 1, 1); mg.fillRect(4, 3, 1, 1); mg.fillRect(6, 3, 1, 1);
    mg.fillRect(1, 4, 1, 1); mg.fillRect(3, 4, 1, 1); mg.fillRect(5, 4, 1, 1); mg.fillRect(7, 4, 1, 1);
    // Bottom shell
    mg.fillStyle(mPink);
    mg.fillRect(0, 5, 8, 2);
    mg.fillRect(1, 7, 6, 1);
    // Highlight on top shell
    mg.fillStyle(0xf0ccd0);
    mg.fillRect(2, 0, 3, 1);
    mg.fillRect(1, 1, 3, 1);
    mg.generateTexture('macaron', 8, 8);
    mg.destroy();

    // Choquette placeholder — round puff with sugar crystal dots
    const cg = this.make.graphics({ x: 0, y: 0 });
    const cBase = 0xf5deb3;
    const cShadow = 0xd4bc91;
    const cHi = 0xfff5e0;
    // Round puff shape
    cg.fillStyle(cBase);
    cg.fillRect(2, 0, 4, 1);
    cg.fillRect(1, 1, 6, 1);
    cg.fillRect(0, 2, 8, 4);
    cg.fillRect(1, 6, 6, 1);
    cg.fillRect(2, 7, 4, 1);
    // Highlight on upper-left
    cg.fillStyle(cHi);
    cg.fillRect(2, 1, 2, 1);
    cg.fillRect(1, 2, 2, 1);
    // Shadow on lower-right
    cg.fillStyle(cShadow);
    cg.fillRect(5, 5, 2, 1);
    cg.fillRect(4, 6, 2, 1);
    // Sugar crystal dots (scattered white pixels)
    cg.fillStyle(0xffffff);
    cg.fillRect(2, 1, 1, 1);
    cg.fillRect(5, 2, 1, 1);
    cg.fillRect(1, 3, 1, 1);
    cg.fillRect(4, 3, 1, 1);
    cg.fillRect(6, 4, 1, 1);
    cg.fillRect(3, 5, 1, 1);
    cg.generateTexture('choquette', 8, 8);
    cg.destroy();

    // Generic tile placeholder
    const tg = this.make.graphics({ x: 0, y: 0 });
    tg.fillStyle(PALETTE.willowGreen);
    tg.fillRect(0, 0, 16, 16);
    tg.lineStyle(1, 0x5a7e5e);
    tg.strokeRect(0, 0, 16, 16);
    tg.generateTexture('ground_tile', 16, 16);
    tg.destroy();

    // Platform tile
    const ptg = this.make.graphics({ x: 0, y: 0 });
    ptg.fillStyle(0x7a9e7e);
    ptg.fillRect(0, 0, 16, 16);
    ptg.fillStyle(0x9abe9e);
    ptg.fillRect(0, 0, 16, 4);
    ptg.generateTexture('platform_tile', 16, 16);
    ptg.destroy();

    // Bark projectile
    const bg = this.make.graphics({ x: 0, y: 0 });
    bg.fillStyle(0xffffff);
    bg.fillCircle(3, 3, 3);
    bg.generateTexture('bark_projectile', 6, 6);
    bg.destroy();

    // Souffle placeholder — puffy rising top with ramekin base
    const sg = this.make.graphics({ x: 0, y: 0 });
    const sGold = 0xdec87a;
    const sRamekin = 0xc49047;
    const sRamekinDark = 0xa07030;
    const sHi = 0xf0e0a0;
    // Puffy risen top (wider than ramekin)
    sg.fillStyle(sGold);
    sg.fillRect(3, 0, 6, 1);
    sg.fillRect(1, 1, 10, 1);
    sg.fillRect(0, 2, 12, 2);
    sg.fillRect(1, 4, 10, 1);
    // Highlight on top
    sg.fillStyle(sHi);
    sg.fillRect(3, 0, 3, 1);
    sg.fillRect(2, 1, 3, 1);
    sg.fillRect(1, 2, 2, 1);
    // Ramekin body (slightly narrower)
    sg.fillStyle(sRamekin);
    sg.fillRect(2, 5, 8, 1);
    sg.fillRect(2, 6, 8, 3);
    sg.fillRect(3, 9, 6, 1);
    // Ramekin ridges
    sg.fillStyle(sRamekinDark);
    sg.fillRect(2, 5, 8, 1);
    sg.fillRect(2, 7, 1, 2);
    sg.fillRect(4, 7, 1, 2);
    sg.fillRect(6, 7, 1, 2);
    sg.fillRect(8, 7, 1, 2);
    // Ramekin bottom rim
    sg.fillRect(3, 9, 6, 1);
    // Tiny highlight on risen top
    sg.fillStyle(0xffffff);
    sg.fillRect(4, 1, 1, 1);
    sg.generateTexture('souffle', 12, 12);
    sg.destroy();

    // Wing power-up placeholder — two wing silhouettes
    const wg = this.make.graphics({ x: 0, y: 0 });
    const wBlue = 0xaaddff;
    const wEdge = 0xffffff;
    // Left wing (curved shape)
    wg.fillStyle(wEdge);
    wg.fillRect(0, 2, 1, 1);
    wg.fillRect(0, 3, 5, 1);
    wg.fillRect(0, 4, 6, 1);
    wg.fillRect(0, 5, 6, 1);
    wg.fillRect(1, 6, 5, 1);
    wg.fillRect(2, 7, 4, 1);
    wg.fillRect(3, 8, 3, 1);
    wg.fillRect(4, 9, 2, 1);
    // Left wing fill
    wg.fillStyle(wBlue);
    wg.fillRect(1, 4, 4, 1);
    wg.fillRect(1, 5, 4, 1);
    wg.fillRect(2, 6, 3, 1);
    wg.fillRect(3, 7, 2, 1);
    wg.fillRect(4, 8, 1, 1);
    // Right wing (mirror)
    wg.fillStyle(wEdge);
    wg.fillRect(11, 2, 1, 1);
    wg.fillRect(7, 3, 5, 1);
    wg.fillRect(6, 4, 6, 1);
    wg.fillRect(6, 5, 6, 1);
    wg.fillRect(6, 6, 5, 1);
    wg.fillRect(6, 7, 4, 1);
    wg.fillRect(6, 8, 3, 1);
    wg.fillRect(6, 9, 2, 1);
    // Right wing fill
    wg.fillStyle(wBlue);
    wg.fillRect(7, 4, 4, 1);
    wg.fillRect(7, 5, 4, 1);
    wg.fillRect(7, 6, 3, 1);
    wg.fillRect(7, 7, 2, 1);
    wg.fillRect(7, 8, 1, 1);
    wg.generateTexture('wing_powerup', 12, 12);
    wg.destroy();

    // Paint drop placeholder
    const pdg = this.make.graphics({ x: 0, y: 0 });
    pdg.fillStyle(PALETTE.brightBlue);
    pdg.fillCircle(3, 4, 3);
    pdg.fillTriangle(3, 0, 1, 3, 5, 3);
    pdg.generateTexture('paint_drop', 7, 8);
    pdg.destroy();

    // Birthday candle placeholder
    const bcg = this.make.graphics({ x: 0, y: 0 });
    bcg.fillStyle(0xff6b6b);
    bcg.fillRect(2, 3, 3, 8);
    bcg.fillStyle(0xffdd44);
    bcg.fillCircle(3, 2, 2);
    bcg.generateTexture('birthday_candle', 7, 12);
    bcg.destroy();

    // Checkpoint (pâtisserie) placeholder
    const cpg = this.make.graphics({ x: 0, y: 0 });
    cpg.fillStyle(0x8B4513);
    cpg.fillRect(0, 8, 16, 8);
    cpg.fillStyle(0xDEB887);
    cpg.fillRect(0, 0, 16, 10);
    cpg.fillStyle(0xff6b6b);
    cpg.fillRect(2, 1, 12, 2);
    cpg.generateTexture('checkpoint', 16, 16);
    cpg.destroy();

    // Enemy: Brouillard Blob
    const bbg = this.make.graphics({ x: 0, y: 0 });
    bbg.fillStyle(PALETTE.fog);
    bbg.fillCircle(8, 10, 7);
    bbg.fillCircle(5, 7, 4);
    bbg.fillCircle(11, 7, 4);
    bbg.fillStyle(0xffffff);
    bbg.fillCircle(5, 8, 2);
    bbg.fillCircle(11, 8, 2);
    bbg.fillStyle(0x333333);
    bbg.fillCircle(5, 8, 1);
    bbg.fillCircle(11, 8, 1);
    bbg.generateTexture('brouillard_blob', 16, 16);
    bbg.destroy();

    // Boss: Le Grand Grenouille (big green frog)
    const frog = this.make.graphics({ x: 0, y: 0 });
    frog.fillStyle(0x3a7a3a);
    frog.fillRect(0, 8, 32, 20);
    frog.fillCircle(8, 10, 6);
    frog.fillCircle(24, 10, 6);
    frog.fillStyle(0xffff00);
    frog.fillCircle(8, 8, 3);
    frog.fillCircle(24, 8, 3);
    frog.fillStyle(0x000000);
    frog.fillCircle(8, 8, 1);
    frog.fillCircle(24, 8, 1);
    frog.fillStyle(0x5a2a2a);
    frog.fillRect(6, 22, 20, 4);
    frog.generateTexture('boss_grenouille', 32, 32);
    frog.destroy();

    // Boss: Monsieur Escargot (snail)
    const snail = this.make.graphics({ x: 0, y: 0 });
    snail.fillStyle(0xd4a057);
    snail.fillRect(0, 18, 16, 14);
    snail.fillStyle(0x8B6914);
    snail.fillCircle(20, 16, 12);
    snail.fillStyle(0xC4A035);
    snail.fillCircle(20, 16, 8);
    snail.fillStyle(0xd4a057);
    snail.fillCircle(6, 12, 4);
    snail.fillStyle(0x000000);
    snail.fillCircle(4, 11, 1);
    snail.generateTexture('boss_escargot', 32, 32);
    snail.destroy();

    // Boss: Le Cygne Gris (grey swan)
    const swan = this.make.graphics({ x: 0, y: 0 });
    swan.fillStyle(0xaaaaaa);
    swan.fillRect(8, 8, 20, 18);
    swan.fillStyle(0xcccccc);
    swan.fillRect(2, 2, 8, 14);
    swan.fillStyle(0xff6600);
    swan.fillRect(0, 6, 4, 3);
    swan.fillStyle(0x000000);
    swan.fillCircle(5, 4, 1);
    swan.generateTexture('boss_cygne', 32, 32);
    swan.destroy();

    // Boss: La Brume (fog entity)
    const brume = this.make.graphics({ x: 0, y: 0 });
    brume.fillStyle(0x666677);
    brume.fillCircle(16, 16, 14);
    brume.fillStyle(0x888899);
    brume.fillCircle(10, 12, 8);
    brume.fillCircle(22, 12, 8);
    brume.fillStyle(0xbb0000);
    brume.fillCircle(10, 12, 2);
    brume.fillCircle(22, 12, 2);
    brume.generateTexture('boss_brume', 32, 32);
    brume.destroy();

    // Boss projectiles
    const waveProj = this.make.graphics({ x: 0, y: 0 });
    waveProj.fillStyle(0x3a7a5c);
    waveProj.fillCircle(4, 4, 4);
    waveProj.generateTexture('wave_projectile', 8, 8);
    waveProj.destroy();

    const fogBubble = this.make.graphics({ x: 0, y: 0 });
    fogBubble.fillStyle(0x777788);
    fogBubble.fillCircle(4, 4, 3);
    fogBubble.fillStyle(0xaaaabb, 0.5);
    fogBubble.fillCircle(3, 3, 1);
    fogBubble.generateTexture('fog_bubble', 8, 8);
    fogBubble.destroy();

    // Lily pad platform
    const lilyPad = this.make.graphics({ x: 0, y: 0 });
    lilyPad.fillStyle(0x4a8c4a);
    lilyPad.fillRect(0, 2, 24, 6);
    lilyPad.fillStyle(0x5aac5a);
    lilyPad.fillRect(2, 0, 20, 4);
    lilyPad.generateTexture('lily_pad', 24, 8);
    lilyPad.destroy();

    // Swan clone (slightly darker)
    const cloneSwan = this.make.graphics({ x: 0, y: 0 });
    cloneSwan.fillStyle(0x999999);
    cloneSwan.fillRect(8, 8, 20, 18);
    cloneSwan.fillStyle(0xbbbbbb);
    cloneSwan.fillRect(2, 2, 8, 14);
    cloneSwan.fillStyle(0xcc5500);
    cloneSwan.fillRect(0, 6, 4, 3);
    cloneSwan.fillStyle(0x000000);
    cloneSwan.fillCircle(5, 4, 1);
    cloneSwan.generateTexture('boss_cygne_clone', 32, 32);
    cloneSwan.destroy();

    // Fog projectile (for La Brume)
    const fogProj = this.make.graphics({ x: 0, y: 0 });
    fogProj.fillStyle(0x555566);
    fogProj.fillCircle(3, 3, 3);
    fogProj.generateTexture('fog_projectile', 6, 6);
    fogProj.destroy();
  }

  /**
   * Draw a French Bulldog placeholder sprite (16x16) on the given Graphics.
   * Matches the style used by AnimationGenerator's drawFrenchieBase.
   */
  private drawFrenchiePlaceholder(
    g: Phaser.GameObjects.Graphics,
    bodyColor: number,
    darkColor: number,
    lightColor: number,
    muzzleColor: number,
    hasWhiteChest: boolean,
  ): void {
    const fill = (c: number, x: number, y: number, w = 1, h = 1) => {
      g.fillStyle(c);
      g.fillRect(x, y, w, h);
    };

    // --- Body (rounder torso with tapered edges) ---
    fill(bodyColor, 5, 6, 6, 1);    // top of body (narrow)
    fill(bodyColor, 4, 7, 8, 1);    // slightly wider
    fill(bodyColor, 3, 8, 10, 2);   // widest rows y=8..9
    fill(bodyColor, 4, 10, 8, 1);   // taper back
    fill(bodyColor, 5, 11, 6, 1);   // bottom of torso (narrow)
    fill(lightColor, 5, 6, 6, 1);   // top highlight
    fill(darkColor, 5, 11, 6, 1);   // bottom shadow

    // --- Head ---
    fill(bodyColor, 4, 3, 8, 4);    // main head block y=3..6
    fill(bodyColor, 5, 2, 6, 1);    // top of head y=2
    fill(lightColor, 5, 2, 6, 1);   // highlight

    // --- Bat ears (triangular) ---
    // Left ear
    fill(bodyColor, 3, 2, 3, 1);    // base y=2
    fill(bodyColor, 3, 1, 2, 1);    // mid y=1
    fill(bodyColor, 3, 0, 1, 1);    // tip y=0
    fill(darkColor, 3, 0, 1, 1);    // dark tip
    fill(lightColor, 4, 1, 1, 1);   // inner ear
    fill(lightColor, 4, 2, 1, 1);
    // Right ear
    fill(bodyColor, 10, 2, 3, 1);
    fill(bodyColor, 11, 1, 2, 1);
    fill(bodyColor, 12, 0, 1, 1);
    fill(darkColor, 12, 0, 1, 1);
    fill(lightColor, 11, 1, 1, 1);
    fill(lightColor, 11, 2, 1, 1);

    // --- Flat muzzle ---
    fill(muzzleColor, 5, 7, 6, 3);
    fill(muzzleColor, 6, 6, 4, 1);

    // --- Eyes (with highlights) ---
    fill(0x1a1a1a, 5, 4, 2, 2);     // left eye
    fill(0x1a1a1a, 9, 4, 2, 2);     // right eye
    fill(0xffffff, 5, 4, 1, 1);     // left eye shine
    fill(0xcccccc, 6, 5, 1, 1);
    fill(0xffffff, 9, 4, 1, 1);     // right eye shine
    fill(0xcccccc, 10, 5, 1, 1);

    // --- Nose (3px wide) ---
    fill(0x2a1a0e, 6, 6, 3, 1);

    // --- Jowl marks ---
    fill(0x3a2818, 5, 9, 1, 1);
    fill(0x3a2818, 10, 9, 1, 1);

    // --- Stubby tail ---
    fill(bodyColor, 12, 9, 2, 1);
    fill(bodyColor, 13, 8, 1, 1);

    // --- White chest for Zacko ---
    if (hasWhiteChest) {
      fill(0xffffff, 6, 7, 4, 1);
      fill(0xffffff, 5, 8, 6, 3);
    }

    // --- Legs ---
    fill(darkColor, 4, 12, 2, 3);   // left leg
    fill(darkColor, 10, 12, 2, 3);  // right leg

    // --- Feet (slightly wider) ---
    fill(darkColor, 3, 14, 3, 2);   // left foot
    fill(darkColor, 10, 14, 3, 2);  // right foot
  }
}
