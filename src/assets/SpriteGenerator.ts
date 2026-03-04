import Phaser from 'phaser';
import { PALETTE, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

// ---------------------------------------------------------------------------
// Helper: shorthand for placing a single pixel (1x1 fillRect)
// ---------------------------------------------------------------------------
function px(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
  g.fillStyle(color);
  g.fillRect(x, y, 1, 1);
}

// Helper: draw a filled rectangle
function rect(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
): void {
  g.fillStyle(color);
  g.fillRect(x, y, w, h);
}

// Helper: horizontal gradient via thin vertical strips
function hGradient(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  colorTop: number,
  colorBottom: number,
  steps: number,
): void {
  const r1 = (colorTop >> 16) & 0xff;
  const g1 = (colorTop >> 8) & 0xff;
  const b1 = colorTop & 0xff;
  const r2 = (colorBottom >> 16) & 0xff;
  const g2 = (colorBottom >> 8) & 0xff;
  const b2 = colorBottom & 0xff;

  const stripH = Math.ceil(h / steps);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1 || 1);
    const r = Math.round(r1 + (r2 - r1) * t);
    const gv = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    const color = (r << 16) | (gv << 8) | b;
    g.fillStyle(color);
    g.fillRect(x, y + i * stripH, w, stripH);
  }
}

// ---------------------------------------------------------------------------
// Main generator function
// ---------------------------------------------------------------------------
export function generateAllSprites(scene: Phaser.Scene): void {
  generateEnemySprites(scene);
  generateTilesetSprites(scene);
  generatePlatformTiles(scene);
  generateBackgroundSprites(scene);
  generateUISprites(scene);
  generateMiscSprites(scene);
}

// ===========================================================================
// ENEMY SPRITES (16x16 each)
// ===========================================================================
function generateEnemySprites(scene: Phaser.Scene): void {
  generatePluieSprite(scene);
  generateFeuilleFlotter(scene);
  generatePapillonGris(scene);
  generatePierreRoulante(scene);
  generateToileAraignee(scene);
  generateNuageNoir(scene);
}

// 1. pluie_sprite  --  Rain droplet creature
function generatePluieSprite(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const body = 0x6b9dab;
  const dark = 0x4a7a8a;
  const hi = 0xaaccdd;
  const outline = 0x3a5a6a;

  // Dark outline (drawn first, body overwrites interior)
  // Outline top point
  px(g, 6, 0, outline); px(g, 9, 0, outline);
  px(g, 6, 1, outline); px(g, 9, 1, outline);
  // Outline widening rows
  px(g, 5, 2, outline); px(g, 10, 2, outline);
  px(g, 4, 3, outline); px(g, 11, 3, outline);
  px(g, 3, 4, outline); px(g, 12, 4, outline);
  px(g, 2, 5, outline); px(g, 13, 5, outline);
  // Outline main body sides
  for (let r = 6; r <= 10; r++) { px(g, 2, r, outline); px(g, 13, r, outline); }
  // Outline bottom
  px(g, 3, 11, outline); px(g, 12, 11, outline);
  for (let x = 4; x <= 11; x++) px(g, x, 12, outline);

  // Teardrop shape: narrow top, wide bottom
  // Row 0-1: top point
  px(g, 7, 0, hi);
  px(g, 8, 0, hi);
  px(g, 7, 1, body);
  px(g, 8, 1, body);

  // Row 2-3: widen
  rect(g, 6, 2, 4, 1, body);
  px(g, 6, 2, hi);
  rect(g, 5, 3, 6, 1, body);
  px(g, 5, 3, hi);

  // Row 4-5: wider
  rect(g, 4, 4, 8, 1, body);
  px(g, 4, 4, hi);
  rect(g, 3, 5, 10, 1, body);
  px(g, 3, 5, hi);

  // Row 6-9: main body
  rect(g, 3, 6, 10, 4, body);
  // Highlight left edge
  for (let r = 6; r <= 9; r++) px(g, 3, r, hi);
  // Extra shimmer highlights on left side
  px(g, 4, 4, hi);
  px(g, 4, 6, hi);
  px(g, 4, 8, hi);
  // Shadow right edge
  for (let r = 6; r <= 9; r++) px(g, 12, r, dark);

  // Eyes on row 6-8 (larger: 3x2 whites)
  rect(g, 5, 6, 3, 2, 0xffffff);
  rect(g, 9, 6, 3, 2, 0xffffff);
  // Pupils
  px(g, 6, 7, 0x222233);
  px(g, 10, 7, 0x222233);

  // Row 10-11: bottom of body
  rect(g, 3, 10, 10, 1, body);
  rect(g, 4, 11, 8, 1, dark);

  // Dripping droplets beneath
  px(g, 5, 13, dark);
  px(g, 8, 14, dark);
  px(g, 10, 13, dark);
  px(g, 6, 15, 0x4a7a8a);
  px(g, 9, 15, 0x4a7a8a);

  g.generateTexture('pluie_sprite', 16, 16);
  g.destroy();
}

// 2. feuille_flotter  --  Floating autumn leaf with a face
function generateFeuilleFlotter(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const main = 0xc98040;
  const light = 0xd4a057;
  const dark = 0x8a5a30;
  const outline = 0x6a4a20;

  // Dark outline around leaf edges (drawn first)
  // Top outline
  px(g, 4, 1, outline); px(g, 5, 1, outline); px(g, 6, 1, outline);
  px(g, 7, 1, outline); px(g, 8, 1, outline); px(g, 9, 1, outline); px(g, 10, 1, outline);
  // Left edge outline
  px(g, 3, 2, outline); px(g, 2, 3, outline);
  for (let r = 4; r <= 9; r++) px(g, 2, r, outline);
  px(g, 3, 10, outline); px(g, 4, 11, outline);
  // Right edge outline
  px(g, 11, 2, outline); px(g, 12, 3, outline);
  for (let r = 4; r <= 9; r++) px(g, 13, r, outline);
  px(g, 12, 10, outline); px(g, 11, 11, outline);
  // Bottom outline
  for (let x = 5; x <= 10; x++) px(g, x, 12, outline);

  // Leaf body -- oval shape with curled tips
  // Row 2-3: leaf top
  rect(g, 5, 2, 6, 1, light);
  rect(g, 4, 3, 8, 1, main);

  // Row 4-9: main leaf body
  rect(g, 3, 4, 10, 6, main);
  // Highlight top half
  rect(g, 4, 4, 3, 2, light);
  // Vein line down center
  for (let r = 3; r <= 10; r++) px(g, 8, r, dark);

  // Side veins (original 3 pairs + 2 more)
  px(g, 5, 5, dark); px(g, 6, 4, dark);
  px(g, 11, 5, dark); px(g, 10, 4, dark);
  px(g, 4, 7, dark); px(g, 5, 6, dark);
  px(g, 12, 7, dark); px(g, 11, 6, dark);
  px(g, 5, 9, dark); px(g, 4, 8, dark);
  px(g, 11, 9, dark); px(g, 12, 8, dark);

  // Row 10-11: bottom taper
  rect(g, 4, 10, 8, 1, main);
  rect(g, 5, 11, 6, 1, dark);

  // Curled edges (left curl up, right curl down)
  px(g, 2, 5, dark);
  px(g, 1, 4, dark);
  px(g, 13, 8, dark);
  px(g, 14, 9, dark);

  // Stem at bottom
  px(g, 7, 12, dark);
  px(g, 7, 13, dark);
  px(g, 6, 14, dark);

  // Face: bigger eyes (2x2 whites) and a smile
  rect(g, 5, 6, 2, 2, 0xffeedd);
  rect(g, 9, 6, 2, 2, 0xffeedd);
  // Pupils
  px(g, 6, 7, 0x332211);
  px(g, 10, 7, 0x332211);
  // Smile
  px(g, 6, 9, 0x332211);
  px(g, 7, 10, 0x332211);
  // (vein at 8 already there)
  px(g, 9, 10, 0x332211);
  px(g, 10, 9, 0x332211);

  g.generateTexture('feuille_flotter', 16, 16);
  g.destroy();
}

// 3. papillon_gris  --  Grey butterfly
function generatePapillonGris(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const wing = 0x888888;
  const light = 0xaaaaaa;
  const dark = 0x666666;
  const bodyColor = 0x444444;
  const outline = 0x555555;

  // Wing outlines (drawn first, wings overwrite interior)
  // Left wing upper outline
  px(g, 1, 2, outline); px(g, 1, 3, outline); px(g, 0, 4, outline); px(g, 0, 5, outline);
  px(g, 0, 6, outline); px(g, 1, 7, outline);
  for (let x = 2; x <= 6; x++) { px(g, x, 2, outline); px(g, x, 7, outline); }
  // Left wing lower outline
  px(g, 1, 8, outline); px(g, 0, 9, outline); px(g, 1, 11, outline);
  for (let x = 2; x <= 6; x++) px(g, x, 11, outline);
  // Right wing upper outline
  px(g, 14, 2, outline); px(g, 14, 3, outline); px(g, 15, 4, outline); px(g, 15, 5, outline);
  px(g, 15, 6, outline); px(g, 14, 7, outline);
  for (let x = 9; x <= 13; x++) { px(g, x, 2, outline); px(g, x, 7, outline); }
  // Right wing lower outline
  px(g, 14, 8, outline); px(g, 15, 9, outline); px(g, 14, 11, outline);
  for (let x = 9; x <= 13; x++) px(g, x, 11, outline);

  // Body (3 segments instead of solid column)
  rect(g, 7, 3, 2, 3, bodyColor);  // Thorax
  rect(g, 7, 7, 2, 1, 0x555555);   // Segment gap
  rect(g, 7, 8, 2, 2, bodyColor);  // Abdomen upper
  rect(g, 7, 10, 2, 1, 0x555555);  // Segment gap
  rect(g, 7, 11, 2, 2, bodyColor); // Abdomen lower

  // Antennae
  px(g, 6, 1, dark);
  px(g, 5, 0, dark);
  px(g, 9, 1, dark);
  px(g, 10, 0, dark);

  // Left wing upper
  rect(g, 2, 3, 5, 4, wing);
  rect(g, 3, 4, 3, 2, light);
  px(g, 1, 4, dark);
  px(g, 1, 5, dark);

  // Left wing lower
  rect(g, 2, 8, 5, 3, wing);
  rect(g, 3, 9, 2, 1, light);
  px(g, 1, 9, dark);

  // Right wing upper (mirror)
  rect(g, 9, 3, 5, 4, wing);
  rect(g, 10, 4, 3, 2, light);
  px(g, 14, 4, dark);
  px(g, 14, 5, dark);

  // Right wing lower
  rect(g, 9, 8, 5, 3, wing);
  rect(g, 11, 9, 2, 1, light);
  px(g, 14, 9, dark);

  // Wing spots (3 per wing)
  px(g, 3, 4, dark); px(g, 4, 6, dark); px(g, 3, 9, dark);
  px(g, 12, 4, dark); px(g, 11, 6, dark); px(g, 12, 9, dark);

  // Eyes on body
  px(g, 7, 4, 0xffffff);
  px(g, 8, 4, 0xffffff);

  g.generateTexture('papillon_gris', 16, 16);
  g.destroy();
}

// 4. pierre_roulante  --  Rolling stone / boulder with grumpy face
function generatePierreRoulante(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const main = 0x777777;
  const light = 0x999999;
  const dark = 0x555555;
  const vdark = 0x444444;

  // Rounded boulder shape
  // Top
  rect(g, 4, 1, 8, 1, light);
  rect(g, 3, 2, 10, 1, main);
  rect(g, 2, 3, 12, 1, main);
  // Middle rows
  rect(g, 1, 4, 14, 8, main);
  // Bottom
  rect(g, 2, 12, 12, 1, main);
  rect(g, 3, 13, 10, 1, dark);
  rect(g, 4, 14, 8, 1, dark);

  // Highlight on top-left
  rect(g, 4, 2, 3, 2, light);
  px(g, 3, 4, light);
  px(g, 2, 5, light);

  // Shadow on bottom-right
  rect(g, 10, 10, 3, 2, dark);
  px(g, 12, 9, dark);
  px(g, 13, 8, dark);

  // Crack lines (more cracks for texture)
  // Crack 1: diagonal upper-left
  px(g, 3, 5, vdark); px(g, 4, 6, vdark); px(g, 4, 7, vdark);
  // Crack 2: upper-right
  px(g, 11, 4, vdark); px(g, 12, 5, vdark); px(g, 12, 6, vdark);
  // Crack 3: middle horizontal
  px(g, 2, 8, vdark); px(g, 3, 8, vdark); px(g, 4, 9, vdark);
  // Crack 4: lower right
  px(g, 10, 11, vdark); px(g, 11, 10, vdark); px(g, 12, 10, vdark);
  // Crack 5: lower center
  px(g, 7, 12, vdark); px(g, 8, 12, vdark);

  // Grumpy face - more expressive
  // Larger angry eyes (2x2 whites)
  rect(g, 5, 6, 2, 2, 0xffffff);
  rect(g, 9, 6, 2, 2, 0xffffff);
  // Pupils (2px)
  px(g, 6, 7, 0x222222);
  px(g, 5, 7, 0x222222);
  px(g, 9, 7, 0x222222);
  px(g, 10, 7, 0x222222);
  // Prominent brow lines (thicker, angry)
  rect(g, 4, 4, 3, 1, 0x333333);
  px(g, 4, 5, 0x333333);
  rect(g, 9, 4, 3, 1, 0x333333);
  px(g, 11, 5, 0x333333);
  // Frown (wider)
  px(g, 5, 10, 0x333333);
  px(g, 6, 11, 0x333333);
  px(g, 7, 11, 0x333333);
  px(g, 8, 11, 0x333333);
  px(g, 9, 11, 0x333333);
  px(g, 10, 10, 0x333333);

  g.generateTexture('pierre_roulante', 16, 16);
  g.destroy();
}

// 5. toile_araignee  --  Spider web with spider in center
function generateToileAraignee(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const web = 0xddddee;
  const webDim = 0xbbbbcc;
  const spider = 0x333333;
  const spiderHi = 0x555555;

  // Concentric web rings (drawn as pixels for retro feel)
  // Outer ring (edges of 16x16)
  // Top/bottom horizontal lines
  for (let x = 2; x <= 13; x++) { px(g, x, 0, webDim); px(g, x, 15, webDim); }
  // Left/right vertical lines
  for (let y = 2; y <= 13; y++) { px(g, 0, y, webDim); px(g, 15, y, webDim); }
  // Corners
  px(g, 1, 1, webDim); px(g, 14, 1, webDim); px(g, 1, 14, webDim); px(g, 14, 14, webDim);

  // Middle ring (brighter)
  for (let x = 5; x <= 10; x++) { px(g, x, 3, web); px(g, x, 12, web); }
  for (let y = 5; y <= 10; y++) { px(g, 3, y, web); px(g, 12, y, web); }
  px(g, 4, 4, web); px(g, 11, 4, web); px(g, 4, 11, web); px(g, 11, 11, web);

  // Inner ring (brightest)
  for (let x = 6; x <= 9; x++) { px(g, x, 5, web); px(g, x, 10, web); }
  for (let y = 6; y <= 9; y++) { px(g, 5, y, web); px(g, 10, y, web); }

  // Radial threads (diagonals and cardinals)
  // Vertical center
  for (let y = 0; y <= 15; y++) px(g, 7, y, web);
  // Horizontal center
  for (let x = 0; x <= 15; x++) px(g, x, 7, web);
  // Diagonals
  for (let i = 0; i <= 15; i++) {
    px(g, i, i, web);
    px(g, 15 - i, i, web);
  }

  // Spider body in center (4x4 block)
  rect(g, 6, 6, 4, 4, spider);
  // Spider head (larger)
  rect(g, 6, 5, 4, 1, spider);
  px(g, 7, 4, spider); px(g, 8, 4, spider);
  // Body highlight
  px(g, 7, 7, spiderHi); px(g, 8, 7, spiderHi);

  // Legs (longer, 4 on each side extending further)
  // Left legs
  px(g, 5, 5, spider); px(g, 4, 4, spider); px(g, 3, 3, spider);
  px(g, 5, 6, spider); px(g, 4, 6, spider); px(g, 3, 5, spider);
  px(g, 5, 8, spider); px(g, 4, 8, spider); px(g, 3, 9, spider);
  px(g, 5, 9, spider); px(g, 4, 10, spider); px(g, 3, 11, spider);
  // Right legs
  px(g, 10, 5, spider); px(g, 11, 4, spider); px(g, 12, 3, spider);
  px(g, 10, 6, spider); px(g, 11, 6, spider); px(g, 12, 5, spider);
  px(g, 10, 8, spider); px(g, 11, 8, spider); px(g, 12, 9, spider);
  px(g, 10, 9, spider); px(g, 11, 10, spider); px(g, 12, 11, spider);

  // Spider eyes (brighter red)
  px(g, 7, 5, 0xee0000); px(g, 8, 5, 0xee0000);
  px(g, 7, 4, 0xcc0000); px(g, 8, 4, 0xcc0000);

  g.generateTexture('toile_araignee', 16, 16);
  g.destroy();
}

// 6. nuage_noir  --  Storm cloud with angry eyes and lightning
function generateNuageNoir(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const mid = 0x505566;
  const dark = 0x444455;
  const darker = 0x333344;
  const darkest = 0x222233;
  const hi = 0x666677;
  const lightning = 0xffdd44;
  const lightningBright = 0xffffaa;

  // Cloud puffs with better shading gradients
  // Left puff (rounded top)
  rect(g, 4, 2, 3, 1, hi);
  rect(g, 3, 3, 4, 1, mid);
  // Right puff (taller)
  rect(g, 9, 0, 3, 1, hi);
  rect(g, 8, 1, 5, 1, hi);
  rect(g, 8, 2, 5, 1, mid);
  // Center connection
  rect(g, 2, 2, 2, 2, mid);

  // Main cloud body with gradient shading (light top to dark bottom)
  rect(g, 1, 3, 14, 1, mid);
  rect(g, 1, 4, 14, 1, dark);
  rect(g, 1, 5, 14, 1, dark);
  rect(g, 1, 6, 14, 1, darker);
  rect(g, 2, 7, 12, 1, darker);
  rect(g, 3, 8, 10, 1, darkest);

  // Top highlight pixels on puffs
  px(g, 4, 2, 0x777788); px(g, 5, 2, 0x777788);
  px(g, 9, 0, 0x777788); px(g, 10, 0, 0x777788); px(g, 11, 0, 0x777788);

  // Larger angry eyes (3x2 whites)
  rect(g, 3, 4, 3, 2, 0xdddddd);
  rect(g, 10, 4, 3, 2, 0xdddddd);
  // Red pupils (2px each)
  px(g, 4, 5, 0xcc2222); px(g, 5, 5, 0xcc2222);
  px(g, 10, 5, 0xcc2222); px(g, 11, 5, 0xcc2222);
  // Thicker angry brows
  rect(g, 2, 3, 3, 1, 0x222233);
  rect(g, 11, 3, 3, 1, 0x222233);
  px(g, 4, 4, 0x222233);
  px(g, 11, 4, 0x222233);

  // Primary lightning bolt (thicker, brighter center)
  px(g, 8, 9, lightningBright);
  px(g, 7, 10, lightningBright); px(g, 8, 10, lightning);
  px(g, 6, 11, lightningBright); px(g, 7, 11, lightning); px(g, 8, 11, lightning);
  px(g, 7, 12, lightningBright);
  px(g, 6, 13, lightningBright); px(g, 7, 13, lightning);
  px(g, 5, 14, lightningBright); px(g, 6, 14, lightning);

  // Secondary smaller lightning bolt
  px(g, 3, 9, lightning);
  px(g, 2, 10, lightning);
  px(g, 3, 10, lightning);
  px(g, 2, 11, lightning);
  px(g, 1, 12, lightning);

  g.generateTexture('nuage_noir', 16, 16);
  g.destroy();
}

// ===========================================================================
// TILESET SPRITES (16x16 each)
// ===========================================================================
function generateTilesetSprites(scene: Phaser.Scene): void {
  generateTilesetWorld1(scene);
  generateTilesetWorld2(scene);
  generateTilesetWorld3(scene);
  generateTilesetWorld4(scene);
}

// 7. tileset_world1  --  Water lily themed blue-green tile
function generateTilesetWorld1(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const blue = PALETTE.waterBlue;
  const teal = PALETTE.pondTeal;

  // Base teal fill
  rect(g, 0, 0, 16, 16, teal);

  // Water ripple pattern (horizontal wavy lines)
  for (let x = 0; x < 16; x++) {
    const offset = (x % 4 < 2) ? 0 : 1;
    px(g, x, 3 + offset, blue);
    px(g, x, 7 + offset, blue);
    px(g, x, 11 + offset, blue);
  }

  // Lighter highlight on top rows (surface light)
  rect(g, 0, 0, 16, 2, 0x5aa8a8);

  // Lily pad edge detail on top-right corner
  px(g, 12, 1, 0x4a8c4a);
  px(g, 13, 1, 0x4a8c4a);
  px(g, 14, 1, 0x4a8c4a);
  px(g, 13, 2, 0x4a8c4a);

  // Subtle darker edge on bottom
  rect(g, 0, 14, 16, 2, 0x3a6c6c);

  // Tile border
  g.lineStyle(1, 0x3a6c6c);
  g.strokeRect(0, 0, 16, 16);

  g.generateTexture('tileset_world1', 16, 16);
  g.destroy();
}

// 8. tileset_world2  --  Morning garden stone/brick with moss
function generateTilesetWorld2(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const amber = PALETTE.sunAmber;
  const peach = PALETTE.peach;

  // Base warm stone
  rect(g, 0, 0, 16, 16, amber);

  // Brick pattern: horizontal mortar lines
  rect(g, 0, 4, 16, 1, 0xc49047);
  rect(g, 0, 9, 16, 1, 0xc49047);
  rect(g, 0, 14, 16, 1, 0xc49047);

  // Vertical mortar (offset per row for brick pattern)
  px(g, 7, 0, 0xc49047); px(g, 7, 1, 0xc49047); px(g, 7, 2, 0xc49047); px(g, 7, 3, 0xc49047);
  px(g, 3, 5, 0xc49047); px(g, 3, 6, 0xc49047); px(g, 3, 7, 0xc49047); px(g, 3, 8, 0xc49047);
  px(g, 11, 5, 0xc49047); px(g, 11, 6, 0xc49047); px(g, 11, 7, 0xc49047); px(g, 11, 8, 0xc49047);
  px(g, 7, 10, 0xc49047); px(g, 7, 11, 0xc49047); px(g, 7, 12, 0xc49047); px(g, 7, 13, 0xc49047);

  // Peach highlight on top-left of each brick
  rect(g, 1, 1, 2, 1, peach);
  rect(g, 9, 1, 2, 1, peach);
  rect(g, 5, 6, 2, 1, peach);
  rect(g, 13, 6, 2, 1, peach);

  // Moss accents (small green spots)
  px(g, 0, 4, 0x6a9a5a);
  px(g, 1, 4, 0x6a9a5a);
  px(g, 14, 9, 0x6a9a5a);
  px(g, 15, 9, 0x6a9a5a);
  px(g, 6, 14, 0x6a9a5a);
  px(g, 7, 14, 0x7aaa6a);

  g.generateTexture('tileset_world2', 16, 16);
  g.destroy();
}

// 9. tileset_world3  --  Misty reflections: purple-blue with mirror sheen
function generateTilesetWorld3(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const purple = PALETTE.deepPurple;
  const blue = PALETTE.midnightBlue;

  // Base deep blue
  rect(g, 0, 0, 16, 16, blue);

  // Purple overtone on upper half
  rect(g, 0, 0, 16, 8, purple);

  // Mirror-like sheen: diagonal highlight streak
  px(g, 2, 2, 0x8a7a9a);
  px(g, 3, 3, 0x8a7a9a);
  px(g, 4, 4, 0x9a8aaa);
  px(g, 5, 5, 0x9a8aaa);
  px(g, 6, 6, 0xaa9abb);
  px(g, 7, 7, 0xaa9abb);
  px(g, 8, 8, 0x9a8aaa);
  px(g, 9, 9, 0x8a7a9a);
  px(g, 10, 10, 0x7a6a8a);

  // Subtle reflection ripples
  for (let x = 1; x < 15; x += 3) {
    px(g, x, 12, 0x3e4a6c);
    px(g, x + 1, 13, 0x3e4a6c);
  }

  // Silver sparkle dots
  px(g, 4, 1, PALETTE.silver);
  px(g, 11, 5, PALETTE.silver);
  px(g, 2, 10, PALETTE.silver);
  px(g, 13, 13, PALETTE.silver);

  // Tile edge
  g.lineStyle(1, 0x1e2a4c);
  g.strokeRect(0, 0, 16, 16);

  g.generateTexture('tileset_world3', 16, 16);
  g.destroy();
}

// 10. tileset_world4  --  Vibrant garden: green grass with flowers
function generateTilesetWorld4(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const green = PALETTE.vividGreen;
  const rose = PALETTE.richRose;

  // Base vivid green grass
  rect(g, 0, 0, 16, 16, green);

  // Grass texture: slightly varied greens
  for (let y = 0; y < 16; y += 2) {
    for (let x = 0; x < 16; x += 3) {
      px(g, x + (y % 4 === 0 ? 0 : 1), y, 0x3c9f40);
    }
  }

  // Darker grass blades at top (soil line)
  rect(g, 0, 0, 16, 2, 0x3a8a3a);
  // Individual grass blade tips
  px(g, 1, 0, 0x5abf5a);
  px(g, 5, 0, 0x5abf5a);
  px(g, 9, 0, 0x5abf5a);
  px(g, 13, 0, 0x5abf5a);

  // Small flowers
  // Flower 1 (rose)
  px(g, 3, 5, rose);
  px(g, 2, 6, rose);
  px(g, 4, 6, rose);
  px(g, 3, 7, rose);
  px(g, 3, 6, PALETTE.warmYellow); // center

  // Flower 2 (yellow)
  px(g, 11, 10, PALETTE.warmYellow);
  px(g, 10, 11, PALETTE.warmYellow);
  px(g, 12, 11, PALETTE.warmYellow);
  px(g, 11, 12, PALETTE.warmYellow);
  px(g, 11, 11, rose); // center

  // Soil base at bottom
  rect(g, 0, 14, 16, 2, 0x6a5a3a);
  rect(g, 0, 15, 16, 1, 0x5a4a2a);

  g.generateTexture('tileset_world4', 16, 16);
  g.destroy();
}

// ===========================================================================
// WORLD-SPECIFIC PLATFORM TILES (16x16 each)
// ===========================================================================
function generatePlatformTiles(scene: Phaser.Scene): void {
  generatePlatformWorld1(scene);
  generatePlatformWorld2(scene);
  generatePlatformWorld3(scene);
  generatePlatformWorld4(scene);
}

// Platform World 1: Lily pad platform — green oval with highlight
function generatePlatformWorld1(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const padGreen = 0x4a8c4a;
  const padLight = 0x5aac5a;
  const padDark = 0x3a6c3a;

  // Rounded lily pad shape
  rect(g, 1, 2, 14, 12, padGreen);
  rect(g, 2, 1, 12, 14, padGreen);
  // Top surface highlight
  rect(g, 2, 1, 12, 3, padLight);
  rect(g, 3, 0, 10, 2, padLight);
  // Shadow edge at bottom
  rect(g, 2, 13, 12, 2, padDark);
  rect(g, 3, 14, 10, 2, padDark);
  // Leaf vein
  for (let y = 3; y <= 12; y++) px(g, 8, y, padDark);
  // Notch detail
  px(g, 7, 1, 0x000000);

  g.generateTexture('platform_world1', 16, 16);
  g.destroy();
}

// Platform World 2: Wooden plank — warm brown tones
function generatePlatformWorld2(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const wood = 0xb08050;
  const woodLight = 0xc8a070;
  const woodDark = 0x8a6040;

  rect(g, 0, 0, 16, 16, wood);
  // Wood grain horizontal lines
  rect(g, 0, 3, 16, 1, woodDark);
  rect(g, 0, 7, 16, 1, woodDark);
  rect(g, 0, 11, 16, 1, woodDark);
  // Top highlight
  rect(g, 0, 0, 16, 2, woodLight);
  // Bottom shadow
  rect(g, 0, 14, 16, 2, woodDark);
  // Knot detail
  px(g, 5, 5, woodDark);
  px(g, 6, 5, woodDark);
  px(g, 5, 6, woodDark);
  px(g, 11, 9, woodDark);
  px(g, 12, 9, woodDark);

  g.generateTexture('platform_world2', 16, 16);
  g.destroy();
}

// Platform World 3: Crystal/mirror slab — purple-blue with shimmer
function generatePlatformWorld3(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const crystal = 0x5c4a72;
  const crystalLight = 0x8a7a9a;
  const crystalDark = 0x3a2a52;

  rect(g, 0, 0, 16, 16, crystal);
  // Top bevel
  rect(g, 0, 0, 16, 3, crystalLight);
  // Bottom shadow
  rect(g, 0, 13, 16, 3, crystalDark);
  // Shimmer streak
  px(g, 3, 2, 0xc0c0c0);
  px(g, 4, 3, 0xc0c0c0);
  px(g, 5, 4, PALETTE.silver);
  px(g, 6, 5, PALETTE.silver);
  px(g, 7, 6, 0xc0c0c0);
  // Reflection dots
  px(g, 10, 4, 0xaa9abb);
  px(g, 12, 8, 0xaa9abb);

  g.generateTexture('platform_world3', 16, 16);
  g.destroy();
}

// Platform World 4: Flower garden brick — vivid with flower accent
function generatePlatformWorld4(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const brick = 0x6a8a5a;
  const brickLight = 0x8aaa7a;
  const brickDark = 0x4a6a3a;

  rect(g, 0, 0, 16, 16, brick);
  // Top grassy highlight
  rect(g, 0, 0, 16, 3, brickLight);
  // Grass blade tips
  px(g, 2, 0, 0x5abf5a);
  px(g, 6, 0, 0x5abf5a);
  px(g, 10, 0, 0x5abf5a);
  px(g, 14, 0, 0x5abf5a);
  // Bottom soil
  rect(g, 0, 13, 16, 3, brickDark);
  // Small flower
  px(g, 4, 5, PALETTE.richRose);
  px(g, 3, 6, PALETTE.richRose);
  px(g, 5, 6, PALETTE.richRose);
  px(g, 4, 7, PALETTE.richRose);
  px(g, 4, 6, PALETTE.warmYellow);
  // Another small flower
  px(g, 11, 8, PALETTE.warmYellow);
  px(g, 10, 9, PALETTE.warmYellow);
  px(g, 12, 9, PALETTE.warmYellow);
  px(g, 11, 10, PALETTE.warmYellow);
  px(g, 11, 9, PALETTE.richRose);

  g.generateTexture('platform_world4', 16, 16);
  g.destroy();
}

// ===========================================================================
// PARALLAX BACKGROUND LAYERS (256x224 each)
// ===========================================================================
function generateBackgroundSprites(scene: Phaser.Scene): void {
  generateBgWorld1(scene);
  generateBgWorld2(scene);
  generateBgWorld3(scene);
  generateBgWorld4(scene);
}

// ---- World 1: Water Lily Pond ----

// 11. bg_world1_far  --  Distant blue pond, soft willows
function generateBgWorld1(scene: Phaser.Scene): void {
  const W = GAME_WIDTH;
  const H = GAME_HEIGHT;

  // -- FAR --
  let g = scene.make.graphics({ x: 0, y: 0 });
  // Sky gradient: soft pale blue to blue
  hGradient(g, 0, 0, W, H * 0.4, 0xb0d0e8, PALETTE.waterBlue, 12);
  // Water gradient: blue to deeper teal
  hGradient(g, 0, H * 0.4, W, H * 0.6, PALETTE.waterBlue, PALETTE.pondTeal, 10);

  // Distant willow silhouettes
  const willowDark = 0x5a8a6a;
  const willowLight = 0x6a9e7e;
  drawWillow(g, 30, Math.floor(H * 0.3), willowDark, willowLight);
  drawWillow(g, 130, Math.floor(H * 0.28), willowLight, willowDark);
  drawWillow(g, 210, Math.floor(H * 0.32), willowDark, willowLight);

  // Horizon line highlight
  rect(g, 0, Math.floor(H * 0.4) - 1, W, 2, 0x8abccc);

  g.generateTexture('bg_world1_far', W, H);
  g.destroy();

  // -- MID --
  g = scene.make.graphics({ x: 0, y: 0 });
  // Transparent-ish layer: mostly clear with mid-ground elements
  // Pale wash
  rect(g, 0, 0, W, H, 0x000000);
  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, W, H);

  // Subtle mist band
  g.fillStyle(PALETTE.waterBlue, 0.3);
  rect(g, 0, Math.floor(H * 0.35), W, 20, PALETTE.waterBlue);

  // Lily pads floating on water surface
  const padY = Math.floor(H * 0.55);
  drawLilyPad(g, 20, padY, 0x4a8c4a, 0x5aac5a);
  drawLilyPad(g, 80, padY + 8, 0x3a7c3a, 0x4a9c4a);
  drawLilyPad(g, 150, padY - 4, 0x4a8c4a, 0x5aac5a);
  drawLilyPad(g, 200, padY + 12, 0x3a7c3a, 0x4a9c4a);

  // Reeds on left and right edges
  drawReeds(g, 5, padY - 30, 0x5a8a5a);
  drawReeds(g, 10, padY - 25, 0x6a9a6a);
  drawReeds(g, 240, padY - 28, 0x5a8a5a);
  drawReeds(g, 248, padY - 22, 0x6a9a6a);

  // Additional reeds scattered
  drawReeds(g, 100, padY - 20, 0x6a9a6a);
  drawReeds(g, 180, padY - 26, 0x5a8a5a);

  g.generateTexture('bg_world1_mid', W, H);
  g.destroy();

  // -- NEAR --
  g = scene.make.graphics({ x: 0, y: 0 });
  // Water reflections: wavy lines at bottom
  const refY = Math.floor(H * 0.75);
  for (let row = refY; row < H; row += 3) {
    const shade = 0x3a6c7c + ((row - refY) * 0x010101);
    for (let x = 0; x < W; x += 2) {
      const wobble = Math.sin((x + row) * 0.3) > 0 ? 1 : 0;
      px(g, x, row + wobble, Math.min(shade, 0x5a9cac));
    }
  }

  // Sparkle dots on water
  px(g, 40, refY + 5, 0xeeffff);
  px(g, 100, refY + 10, 0xeeffff);
  px(g, 170, refY + 3, 0xeeffff);
  px(g, 220, refY + 8, 0xeeffff);
  px(g, 60, refY + 20, 0xddeeff);
  px(g, 140, refY + 15, 0xddeeff);

  g.generateTexture('bg_world1_near', W, H);
  g.destroy();
}

// ---- World 2: Morning Garden ----

// 14-16. bg_world2_far/mid/near
function generateBgWorld2(scene: Phaser.Scene): void {
  const W = GAME_WIDTH;
  const H = GAME_HEIGHT;

  // -- FAR: Sunrise sky --
  let g = scene.make.graphics({ x: 0, y: 0 });
  // Warm amber-peach gradient
  hGradient(g, 0, 0, W, H, 0xf0d8b0, PALETTE.sunAmber, 16);
  // Peachy band near horizon
  hGradient(g, 0, Math.floor(H * 0.3), W, Math.floor(H * 0.2), PALETTE.peach, PALETTE.sunAmber, 8);

  // Soft sun glow (circle of light pixels)
  const sunX = Math.floor(W * 0.7);
  const sunY = Math.floor(H * 0.2);
  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      if (dx * dx + dy * dy <= 64) {
        const bright = dx * dx + dy * dy <= 25 ? 0xfff8e0 : 0xffe8c0;
        px(g, sunX + dx, sunY + dy, bright);
      }
    }
  }

  // Distant treeline
  const treeY = Math.floor(H * 0.55);
  for (let x = 0; x < W; x += 6) {
    const h = 10 + (((x * 7) % 11) - 5);
    rect(g, x, treeY - h, 5, h, 0x8aaa7a);
    px(g, x + 2, treeY - h - 1, 0x9aba8a);
  }

  g.generateTexture('bg_world2_far', W, H);
  g.destroy();

  // -- MID: Garden greenhouse silhouettes --
  g = scene.make.graphics({ x: 0, y: 0 });

  // Greenhouse 1 (left)
  const ghColor = 0x9a8a6a;
  const ghLight = 0xb0a080;
  rect(g, 20, 90, 60, 50, ghColor);
  // Peaked roof
  for (let i = 0; i < 20; i++) {
    rect(g, 20 + i, 90 - i, 60 - i * 2, 1, ghColor);
  }
  // Window panes
  rect(g, 28, 100, 10, 12, ghLight);
  rect(g, 44, 100, 10, 12, ghLight);
  rect(g, 60, 100, 10, 12, ghLight);
  // Window cross-bars
  for (const wx of [28, 44, 60]) {
    rect(g, wx + 4, 100, 2, 12, ghColor);
    rect(g, wx, 105, 10, 2, ghColor);
  }

  // Greenhouse 2 (right, smaller)
  rect(g, 170, 110, 50, 40, ghColor);
  for (let i = 0; i < 15; i++) {
    rect(g, 170 + i, 110 - i, 50 - i * 2, 1, ghColor);
  }
  rect(g, 178, 118, 8, 10, ghLight);
  rect(g, 194, 118, 8, 10, ghLight);

  // Garden path
  rect(g, 0, 150, W, 6, 0xc8b898);

  g.generateTexture('bg_world2_mid', W, H);
  g.destroy();

  // -- NEAR: Flower stalks foreground --
  g = scene.make.graphics({ x: 0, y: 0 });

  // Flower stalks from bottom
  for (let i = 0; i < 8; i++) {
    const sx = i * 34 + 8;
    const stalkH = 40 + ((i * 13) % 20);
    const stalkY = H - stalkH;
    // Green stem
    rect(g, sx, stalkY, 2, stalkH, 0x5a8a5a);
    // Leaf
    rect(g, sx - 2, stalkY + 15, 3, 2, 0x6a9a6a);
    rect(g, sx + 2, stalkY + 25, 3, 2, 0x6a9a6a);
    // Flower head
    const flowerColors = [PALETTE.lilyPink, PALETTE.richRose, PALETTE.warmYellow, PALETTE.lavender];
    const fc = flowerColors[i % flowerColors.length];
    rect(g, sx - 2, stalkY - 3, 6, 5, fc);
    px(g, sx, stalkY - 1, PALETTE.warmYellow); // center
  }

  g.generateTexture('bg_world2_near', W, H);
  g.destroy();
}

// ---- World 3: Misty Reflections ----

// 17-19. bg_world3_far/mid/near
function generateBgWorld3(scene: Phaser.Scene): void {
  const W = GAME_WIDTH;
  const H = GAME_HEIGHT;

  // -- FAR: Deep purple night sky with stars --
  let g = scene.make.graphics({ x: 0, y: 0 });
  hGradient(g, 0, 0, W, H, 0x1a1a3a, PALETTE.deepPurple, 14);

  // Stars
  const starPositions = [
    [20, 15], [55, 30], [80, 8], [110, 22], [140, 12],
    [170, 35], [200, 18], [230, 28], [45, 50], [95, 45],
    [155, 55], [190, 48], [220, 60], [30, 70], [120, 62],
    [70, 40], [250, 10], [15, 55], [180, 5], [240, 42],
    [100, 80], [60, 90], [210, 75], [130, 95], [25, 100],
  ];
  for (const [sx, sy] of starPositions) {
    const brightness = ((sx * 7 + sy * 3) % 3 === 0) ? 0xffffff : 0xccccdd;
    px(g, sx, sy, brightness);
  }
  // A few brighter stars (2x2)
  rect(g, 80, 8, 2, 2, 0xffffff);
  rect(g, 200, 18, 2, 2, 0xeeeeff);
  rect(g, 140, 12, 2, 2, 0xffffff);

  // Moon (crescent)
  const moonX = 200;
  const moonY = 30;
  for (let dy = -6; dy <= 6; dy++) {
    for (let dx = -6; dx <= 6; dx++) {
      if (dx * dx + dy * dy <= 36 && (dx - 2) * (dx - 2) + dy * dy > 25) {
        px(g, moonX + dx, moonY + dy, PALETTE.silver);
      }
    }
  }

  g.generateTexture('bg_world3_far', W, H);
  g.destroy();

  // -- MID: Misty bridge reflections --
  g = scene.make.graphics({ x: 0, y: 0 });

  // Japanese-style bridge silhouette
  const bridgeY = Math.floor(H * 0.45);
  const bridgeColor = 0x3a3a5a;
  const bridgeLight = 0x4a4a6a;

  // Arch of bridge
  for (let x = 60; x <= 196; x++) {
    const t = (x - 60) / 136;
    const archY = bridgeY - Math.floor(Math.sin(t * Math.PI) * 25);
    rect(g, x, archY, 1, 4, bridgeColor);
    // Railing
    px(g, x, archY - 2, bridgeLight);
  }
  // Bridge pillars
  rect(g, 62, bridgeY - 10, 4, 40, bridgeColor);
  rect(g, 192, bridgeY - 10, 4, 40, bridgeColor);
  rect(g, 126, bridgeY - 30, 4, 20, bridgeColor);

  // Water reflection of bridge (mirrored, dimmer)
  const refStartY = bridgeY + 30;
  for (let x = 70; x <= 186; x += 2) {
    const t = (x - 60) / 136;
    const reflY = refStartY + Math.floor(Math.sin(t * Math.PI) * 15);
    px(g, x, reflY, 0x2a2a4a);
    px(g, x + 1, reflY + 1, 0x2a2a4a);
  }

  // Distant hills
  for (let x = 0; x < W; x++) {
    const hillH = Math.floor(8 + Math.sin(x * 0.03) * 6 + Math.sin(x * 0.07) * 3);
    rect(g, x, H - 50 - hillH, 1, hillH, 0x2e2e4e);
  }

  g.generateTexture('bg_world3_mid', W, H);
  g.destroy();

  // -- NEAR: Fog wisps foreground --
  g = scene.make.graphics({ x: 0, y: 0 });

  // Wispy fog bands
  drawFogWisp(g, 0, Math.floor(H * 0.6), W, 0x555566, 0.4);
  drawFogWisp(g, 0, Math.floor(H * 0.75), W, 0x444455, 0.5);
  drawFogWisp(g, 0, Math.floor(H * 0.88), W, 0x666677, 0.3);

  // Floating particles / fireflies
  const particles = [
    [30, 100], [80, 130], [140, 110], [200, 140], [50, 160],
    [120, 180], [180, 150], [230, 170], [20, 190], [160, 200],
  ];
  for (const [fx, fy] of particles) {
    px(g, fx, fy, 0xaabbcc);
    px(g, fx + 1, fy, 0x8899aa);
  }

  g.generateTexture('bg_world3_near', W, H);
  g.destroy();
}

// ---- World 4: Vibrant Garden ----

// 20-22. bg_world4_far/mid/near
function generateBgWorld4(scene: Phaser.Scene): void {
  const W = GAME_WIDTH;
  const H = GAME_HEIGHT;

  // -- FAR: Clear blue sky with white clouds --
  let g = scene.make.graphics({ x: 0, y: 0 });
  hGradient(g, 0, 0, W, H, 0x87ceeb, PALETTE.brightBlue, 14);

  // Clouds
  drawCloud(g, 30, 25, 40, 0xffffff, 0xeeeeff);
  drawCloud(g, 120, 40, 50, 0xffffff, 0xeeeeff);
  drawCloud(g, 200, 20, 35, 0xffffff, 0xeeeeff);
  drawCloud(g, 70, 60, 30, 0xeeeeff, 0xddddee);
  drawCloud(g, 180, 55, 45, 0xffffff, 0xeeeeff);

  // Distant green hills
  for (let x = 0; x < W; x++) {
    const hillH = Math.floor(
      20 + Math.sin(x * 0.02) * 12 + Math.sin(x * 0.05) * 8 + Math.sin(x * 0.1) * 3,
    );
    const hillY = H - 60 - hillH;
    rect(g, x, hillY, 1, hillH + 60, 0x5aaf5a);
    // Lighter tops
    px(g, x, hillY, 0x6abf6a);
    px(g, x, hillY + 1, 0x5aaf5a);
  }

  g.generateTexture('bg_world4_far', W, H);
  g.destroy();

  // -- MID: Vibrant garden landscape --
  g = scene.make.graphics({ x: 0, y: 0 });

  // Rolling garden beds
  const bedY = Math.floor(H * 0.5);
  for (let x = 0; x < W; x++) {
    const bed1H = Math.floor(6 + Math.sin(x * 0.04) * 4);
    const bed2H = Math.floor(8 + Math.sin(x * 0.06 + 2) * 5);
    rect(g, x, bedY - bed1H, 1, bed1H, 0x3a8a40);
    rect(g, x, bedY + 20 - bed2H, 1, bed2H, 0x4a9a50);
  }

  // Garden rows with flowers
  for (let x = 10; x < W; x += 16) {
    // Flower stalks
    const baseY = bedY + 10;
    rect(g, x, baseY - 12, 1, 12, 0x4a8a4a);
    rect(g, x + 6, baseY - 10, 1, 10, 0x4a8a4a);
    rect(g, x + 12, baseY - 14, 1, 14, 0x4a8a4a);

    // Flowers at top
    const colors = [PALETTE.richRose, PALETTE.warmYellow, PALETTE.lilyPink, PALETTE.brightBlue];
    rect(g, x - 1, baseY - 14, 3, 3, colors[(x / 16) % 4 | 0]);
    rect(g, x + 5, baseY - 12, 3, 3, colors[((x / 16) + 1) % 4 | 0]);
    rect(g, x + 11, baseY - 16, 3, 3, colors[((x / 16) + 2) % 4 | 0]);
  }

  // Garden fence
  const fenceY = bedY + 30;
  rect(g, 0, fenceY, W, 2, 0x8a7a5a);
  for (let x = 0; x < W; x += 12) {
    rect(g, x, fenceY - 8, 2, 10, 0x9a8a6a);
    // Fence post cap
    px(g, x, fenceY - 9, 0xaa9a7a);
    px(g, x + 1, fenceY - 9, 0xaa9a7a);
  }

  g.generateTexture('bg_world4_mid', W, H);
  g.destroy();

  // -- NEAR: Colorful flower border --
  g = scene.make.graphics({ x: 0, y: 0 });

  // Dense flower border at bottom of screen
  const borderY = H - 40;

  // Leaf/grass base
  for (let x = 0; x < W; x += 2) {
    const h = 20 + ((x * 3) % 15);
    rect(g, x, H - h, 2, h, 0x3a7a3a);
    // Lighter blade tips
    px(g, x, H - h, 0x5aaa5a);
  }

  // Scattered large flowers
  for (let x = 5; x < W; x += 20) {
    const fy = borderY + ((x * 7) % 12);
    const fColors = [PALETTE.richRose, PALETTE.warmYellow, PALETTE.lilyPink, 0xff8844, PALETTE.lavender];
    const fc = fColors[(x / 20) % fColors.length | 0];
    // Petals (cross shape)
    rect(g, x, fy - 2, 4, 6, fc);
    rect(g, x - 1, fy, 6, 2, fc);
    // Center
    px(g, x + 1, fy, PALETTE.warmYellow);
    px(g, x + 2, fy, PALETTE.warmYellow);
    px(g, x + 1, fy + 1, PALETTE.warmYellow);
    px(g, x + 2, fy + 1, PALETTE.warmYellow);
  }

  // Small butterflies (tiny colored dots)
  px(g, 40, borderY - 15, PALETTE.lilyPink);
  px(g, 42, borderY - 15, PALETTE.lilyPink);
  px(g, 150, borderY - 20, PALETTE.warmYellow);
  px(g, 152, borderY - 20, PALETTE.warmYellow);
  px(g, 210, borderY - 10, PALETTE.lavender);
  px(g, 212, borderY - 10, PALETTE.lavender);

  g.generateTexture('bg_world4_near', W, H);
  g.destroy();
}

// ===========================================================================
// UI SPRITES
// ===========================================================================
function generateUISprites(scene: Phaser.Scene): void {
  generateHpIconFull(scene);
  generateHpIconEmpty(scene);
  generateMacaronIcon(scene);
  generateCandleIcon(scene);
  generatePaintIcon(scene);
}

// 23. hp_icon_full (10x10) -- Happy Frenchie face
function generateHpIconFull(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const fawn = 0xd4a057;
  const darkFawn = 0xb08040;
  const nose = 0x4a3728;

  // Face circle (filled)
  // Row 0: ears
  rect(g, 1, 0, 2, 2, fawn);  // left ear
  rect(g, 7, 0, 2, 2, fawn);  // right ear
  // Ear inner
  px(g, 1, 1, darkFawn);
  px(g, 8, 1, darkFawn);

  // Row 1-2: top of head
  rect(g, 2, 1, 6, 2, fawn);

  // Row 3-7: face body
  rect(g, 1, 3, 8, 5, fawn);

  // Row 8: chin
  rect(g, 2, 8, 6, 1, fawn);
  // Row 9: bottom
  rect(g, 3, 9, 4, 1, darkFawn);

  // Eyes (happy - open)
  px(g, 3, 4, 0x222222);
  px(g, 6, 4, 0x222222);
  // Eye highlights
  px(g, 3, 3, 0xffffff);
  px(g, 6, 3, 0xffffff);

  // Nose
  px(g, 4, 6, nose);
  px(g, 5, 6, nose);

  // Smile
  px(g, 3, 7, nose);
  px(g, 4, 7, nose);
  px(g, 5, 7, nose);
  px(g, 6, 7, nose);

  // Cheek blush
  px(g, 2, 5, 0xe8a0a0);
  px(g, 7, 5, 0xe8a0a0);

  g.generateTexture('hp_icon_full', 10, 10);
  g.destroy();
}

// 24. hp_icon_empty (10x10) -- Sad/greyed-out Frenchie face
function generateHpIconEmpty(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const grey = 0x777777;
  const darkGrey = 0x555555;
  const nose = 0x444444;

  // Face circle (same shape, greyed)
  rect(g, 1, 0, 2, 2, grey);
  rect(g, 7, 0, 2, 2, grey);
  px(g, 1, 1, darkGrey);
  px(g, 8, 1, darkGrey);

  rect(g, 2, 1, 6, 2, grey);
  rect(g, 1, 3, 8, 5, grey);
  rect(g, 2, 8, 6, 1, grey);
  rect(g, 3, 9, 4, 1, darkGrey);

  // Sad eyes (X shape or closed)
  px(g, 3, 4, 0x333333);
  px(g, 6, 4, 0x333333);
  // Closed/sad -- horizontal line eyes
  px(g, 2, 4, 0x333333);
  px(g, 4, 4, 0x333333);
  px(g, 5, 4, 0x333333);
  px(g, 7, 4, 0x333333);

  // Nose
  px(g, 4, 6, nose);
  px(g, 5, 6, nose);

  // Frown (inverted smile)
  px(g, 3, 8, nose);
  px(g, 4, 7, nose);
  px(g, 5, 7, nose);
  px(g, 6, 8, nose);

  g.generateTexture('hp_icon_empty', 10, 10);
  g.destroy();
}

// 25. macaron_icon (8x8) -- Small macaron for HUD
function generateMacaronIcon(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const pink = PALETTE.lilyPink;
  const cream = 0xfff0e0;
  const darkPink = 0xc89498;

  // Top shell
  rect(g, 2, 0, 4, 1, pink);
  rect(g, 1, 1, 6, 2, pink);
  // Highlight
  px(g, 2, 1, 0xf0c8cc);

  // Filling (cream band)
  rect(g, 1, 3, 6, 2, cream);
  // Ruffle edge on filling
  px(g, 0, 3, cream);
  px(g, 7, 3, cream);
  px(g, 0, 4, cream);
  px(g, 7, 4, cream);

  // Bottom shell
  rect(g, 1, 5, 6, 2, darkPink);
  rect(g, 2, 7, 4, 1, darkPink);

  g.generateTexture('macaron_icon', 8, 8);
  g.destroy();
}

// 26. candle_icon (8x8) -- Small birthday candle for HUD
function generateCandleIcon(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });

  // Flame
  px(g, 3, 0, 0xffee66);
  px(g, 4, 0, 0xffee66);
  px(g, 3, 1, 0xffaa33);
  px(g, 4, 1, 0xffaa33);

  // Wick
  px(g, 3, 2, 0x333333);

  // Candle body (striped)
  rect(g, 2, 3, 4, 4, 0xff6b6b);
  rect(g, 2, 4, 4, 1, 0xffffff); // white stripe
  rect(g, 2, 6, 4, 1, 0xffffff); // white stripe

  // Base
  rect(g, 1, 7, 6, 1, 0xdddddd);

  g.generateTexture('candle_icon', 8, 8);
  g.destroy();
}

// 27. paint_icon (8x8) -- Small paint drop for HUD
function generatePaintIcon(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const blue = PALETTE.brightBlue;
  const lightBlue = 0x6aa5ff;

  // Teardrop shape pointing up
  // Top point
  px(g, 3, 0, blue);
  px(g, 4, 0, blue);

  // Widening
  rect(g, 2, 1, 4, 1, blue);
  rect(g, 1, 2, 6, 1, blue);

  // Body
  rect(g, 1, 3, 6, 3, blue);

  // Bottom round
  rect(g, 2, 6, 4, 1, blue);
  rect(g, 3, 7, 2, 1, blue);

  // Highlight
  px(g, 2, 2, lightBlue);
  px(g, 2, 3, lightBlue);

  g.generateTexture('paint_icon', 8, 8);
  g.destroy();
}

// ===========================================================================
// MISC SPRITES
// ===========================================================================
function generateMiscSprites(scene: Phaser.Scene): void {
  generateLightningBolt(scene);
}

// 28. lightning_bolt (6x16) -- Yellow zigzag lightning for NuageNoir
function generateLightningBolt(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const bright = 0xffdd44;
  const core = 0xffffaa;
  const edge = 0xcc9900;

  // Zigzag pattern: top to bottom
  // Segment 1: top right going left
  px(g, 3, 0, bright);
  px(g, 4, 0, edge);
  px(g, 2, 1, bright);
  px(g, 3, 1, core);

  // Segment 2: going right
  px(g, 1, 2, bright);
  px(g, 2, 2, core);
  px(g, 2, 3, bright);
  px(g, 3, 3, core);
  px(g, 4, 3, edge);

  // Wide horizontal bar in middle
  rect(g, 1, 4, 4, 2, bright);
  rect(g, 2, 4, 2, 2, core);

  // Segment 3: going left
  px(g, 3, 6, bright);
  px(g, 4, 6, edge);
  px(g, 2, 7, bright);
  px(g, 3, 7, core);
  px(g, 1, 8, bright);
  px(g, 2, 8, core);

  // Segment 4: going right
  px(g, 1, 9, edge);
  px(g, 2, 9, bright);
  px(g, 3, 9, core);
  px(g, 3, 10, bright);
  px(g, 4, 10, edge);

  // Wide bar again
  rect(g, 1, 11, 4, 2, bright);
  rect(g, 2, 11, 2, 2, core);

  // Bottom point
  px(g, 2, 13, bright);
  px(g, 3, 13, core);
  px(g, 2, 14, bright);
  px(g, 3, 14, edge);
  px(g, 2, 15, edge);

  g.generateTexture('lightning_bolt', 6, 16);
  g.destroy();
}

// ===========================================================================
// DRAWING HELPERS (used by background generators)
// ===========================================================================

/** Draw a simple willow tree silhouette */
function drawWillow(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  trunkColor: number,
  leafColor: number,
): void {
  // Trunk
  rect(g, x, y, 4, 30, trunkColor);

  // Canopy (drooping)
  rect(g, x - 15, y - 10, 34, 14, leafColor);
  rect(g, x - 10, y - 14, 24, 6, leafColor);

  // Drooping branches (vertical lines hanging down)
  for (let bx = x - 14; bx <= x + 16; bx += 3) {
    const branchLen = 10 + ((bx * 3) % 8);
    rect(g, bx, y + 2, 1, branchLen, leafColor);
  }
}

/** Draw a small lily pad shape */
function drawLilyPad(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  dark: number,
  light: number,
): void {
  rect(g, x, y, 16, 4, dark);
  rect(g, x + 2, y - 1, 12, 1, dark);
  rect(g, x + 2, y + 4, 12, 1, dark);
  // Highlight
  rect(g, x + 3, y, 4, 2, light);
  // Notch (V-shaped cut)
  px(g, x + 8, y, 0x000000);
  px(g, x + 7, y - 1, 0x000000);
  px(g, x + 9, y - 1, 0x000000);
}

/** Draw vertical reeds */
function drawReeds(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  color: number,
): void {
  rect(g, x, y, 1, 25, color);
  rect(g, x + 2, y + 5, 1, 20, color);
  // Reed tips
  px(g, x - 1, y, color);
  px(g, x + 1, y + 5, color);
}

/** Draw a fluffy cloud */
function drawCloud(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  light: number,
  dark: number,
): void {
  const h = Math.floor(width * 0.4);
  // Main body
  rect(g, x, y, width, h, light);
  // Top bumps
  rect(g, x + 4, y - Math.floor(h * 0.3), Math.floor(width * 0.3), Math.floor(h * 0.4), light);
  rect(g, x + Math.floor(width * 0.4), y - Math.floor(h * 0.4), Math.floor(width * 0.35), Math.floor(h * 0.5), light);
  // Rounded edges
  rect(g, x + 2, y - 2, width - 4, 2, light);
  // Bottom shadow
  rect(g, x + 2, y + h - 2, width - 4, 2, dark);
  // Bottom edge highlight
  rect(g, x + 4, y + h, width - 8, 1, dark);
}

/** Draw a horizontal fog wisp band */
function drawFogWisp(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  color: number,
  density: number,
): void {
  // Draw wispy fog using scattered horizontal rects with gaps
  for (let row = 0; row < 12; row++) {
    for (let cx = x; cx < x + width; cx += 3) {
      // Use a pseudo-random pattern based on position
      const hash = ((cx * 7 + row * 13) % 17);
      if (hash < density * 17) {
        const segW = 2 + (hash % 3);
        g.fillStyle(color, 0.4 + (hash % 3) * 0.1);
        g.fillRect(cx, y + row * 2, segW, 2);
      }
    }
  }
}
