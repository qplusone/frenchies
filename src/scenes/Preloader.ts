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
    // Poppleton placeholder (fawn/tan rectangle)
    const pg = this.make.graphics({ x: 0, y: 0 });
    pg.fillStyle(0xd4a057); // fawn
    pg.fillRect(0, 0, 16, 16);
    pg.fillStyle(0x4a3728); // dark muzzle
    pg.fillRect(4, 10, 8, 4);
    // ears
    pg.fillStyle(0xd4a057);
    pg.fillRect(2, 0, 4, 4);
    pg.fillRect(10, 0, 4, 4);
    pg.generateTexture('poppleton', 16, 16);
    pg.destroy();

    // Zacko placeholder (black with white chest patch)
    const zg = this.make.graphics({ x: 0, y: 0 });
    zg.fillStyle(0x2a2a2a); // black
    zg.fillRect(0, 0, 16, 16);
    zg.fillStyle(0xffffff); // white chest
    zg.fillRect(5, 8, 6, 5);
    // ears
    zg.fillStyle(0x2a2a2a);
    zg.fillRect(2, 0, 4, 4);
    zg.fillRect(10, 0, 4, 4);
    zg.generateTexture('zacko', 16, 16);
    zg.destroy();

    // Macaron placeholder
    const mg = this.make.graphics({ x: 0, y: 0 });
    mg.fillStyle(0xe8b4b8);
    mg.fillCircle(4, 4, 4);
    mg.generateTexture('macaron', 8, 8);
    mg.destroy();

    // Choquette placeholder
    const cg = this.make.graphics({ x: 0, y: 0 });
    cg.fillStyle(0xf5deb3);
    cg.fillCircle(4, 4, 3);
    cg.fillStyle(0xffffff);
    cg.fillRect(2, 1, 1, 1);
    cg.fillRect(5, 2, 1, 1);
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

    // Soufflé placeholder
    const sg = this.make.graphics({ x: 0, y: 0 });
    sg.fillStyle(PALETTE.softGold);
    sg.fillRect(1, 4, 10, 6);
    sg.fillStyle(0xffeebb);
    sg.fillRect(2, 1, 8, 5);
    sg.generateTexture('souffle', 12, 12);
    sg.destroy();

    // Wing power-up placeholder
    const wg = this.make.graphics({ x: 0, y: 0 });
    wg.fillStyle(0xffffff);
    wg.fillRect(0, 2, 5, 8);
    wg.fillRect(7, 2, 5, 8);
    wg.fillStyle(0xaaddff);
    wg.fillRect(1, 3, 3, 6);
    wg.fillRect(8, 3, 3, 6);
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
}
