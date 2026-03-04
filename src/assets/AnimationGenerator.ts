import Phaser from 'phaser';

/**
 * Generates multi-frame sprite sheet textures and registers Phaser animations
 * for all animated entities in Jardin des Frenchies.
 *
 * Call this once during the Preloader scene's create() or at the start of
 * any scene that needs animations. It is safe to call multiple times;
 * existing textures/anims are skipped.
 */
export function generateAnimations(scene: Phaser.Scene): void {
  generatePoppletonSheet(scene);
  generateZackoSheet(scene);
  generateBlobSheet(scene);
  generateGrenouilleSheet(scene);
}

// ---------------------------------------------------------------------------
// Shared pixel-art drawing helpers
// ---------------------------------------------------------------------------

/** Shorthand to fill a single "pixel" at (px, py) inside the current frame offset. */
function px(
  g: Phaser.GameObjects.Graphics,
  color: number,
  x: number,
  y: number,
  w: number = 1,
  h: number = 1,
): void {
  g.fillStyle(color);
  g.fillRect(x, y, w, h);
}

// Colors
const FAWN = 0xd4a057;
const FAWN_DARK = 0xb8883a;
const FAWN_LIGHT = 0xe8c47a;
const MUZZLE = 0x4a3728;
const EYE = 0x1a1a1a;
const NOSE = 0x2a1a0e;
const BLACK_BODY = 0x2a2a2a;
const BLACK_DARK = 0x1a1a1a;
const WHITE_CHEST = 0xffffff;
const WHITE_MUZZLE = 0xdddddd;
const HURT_FLASH = 0xffffff;
const BLOB_COLOR = 0x888888;
const BLOB_LIGHT = 0xaaaaaa;
const BLOB_DARK = 0x666666;
const BLOB_EYE = 0xffffff;
const BLOB_PUPIL = 0x333333;
const FROG_GREEN = 0x3a7a3a;
const FROG_BELLY = 0x5aaa5a;
const FROG_DARK = 0x2a5a2a;
const FROG_EYE_BG = 0xffff00;
const FROG_PUPIL = 0x000000;
const FROG_MOUTH = 0x5a2a2a;
const TONGUE_RED = 0xcc3333;
const TONGUE_PINK = 0xff8899;
const JOWL = 0x3a2818;

// ---------------------------------------------------------------------------
// Poppleton sprite sheet  (128 x 16, 8 frames of 16x16)
// ---------------------------------------------------------------------------

function drawFrenchieBase(
  g: Phaser.GameObjects.Graphics,
  ox: number,
  bodyColor: number,
  darkColor: number,
  lightColor: number,
  muzzleColor: number,
  hasWhiteChest: boolean,
): void {
  // --- Body (rounder torso with tapered edges) ---
  // Core body: rows y=6..11, wider in the center
  px(g, bodyColor, ox + 5, 6, 6, 1);   // top of body (narrow)
  px(g, bodyColor, ox + 4, 7, 8, 1);   // slightly wider
  px(g, bodyColor, ox + 3, 8, 10, 2);  // widest rows y=8..9
  px(g, bodyColor, ox + 4, 10, 8, 1);  // taper back
  px(g, bodyColor, ox + 5, 11, 6, 1);  // bottom of torso (narrow)
  // Body top highlight (1px lighter on top of body)
  px(g, lightColor, ox + 5, 6, 6, 1);
  // Body bottom shadow (1px darker on bottom edge)
  px(g, darkColor, ox + 5, 11, 6, 1);

  // --- Head ---
  px(g, bodyColor, ox + 4, 3, 8, 4);   // main head block y=3..6
  px(g, bodyColor, ox + 5, 2, 6, 1);   // top of head y=2
  // Head top highlight
  px(g, lightColor, ox + 5, 2, 6, 1);

  // --- Bat ears (triangular, wide base tapering to point) ---
  // Left ear: base 3px wide at y=2, 2px at y=1, 1px tip at y=0
  px(g, bodyColor, ox + 3, 2, 3, 1);   // base row y=2 (3px wide)
  px(g, bodyColor, ox + 3, 1, 2, 1);   // middle row y=1 (2px wide)
  px(g, bodyColor, ox + 3, 0, 1, 1);   // tip y=0 (1px)
  px(g, darkColor, ox + 3, 0, 1, 1);   // dark outline at tip
  // Left ear inner
  px(g, lightColor, ox + 4, 1, 1, 1);  // inner ear highlight
  px(g, lightColor, ox + 4, 2, 1, 1);

  // Right ear: base 3px wide at y=2, 2px at y=1, 1px tip at y=0
  px(g, bodyColor, ox + 10, 2, 3, 1);  // base row y=2 (3px wide)
  px(g, bodyColor, ox + 11, 1, 2, 1);  // middle row y=1 (2px wide)
  px(g, bodyColor, ox + 12, 0, 1, 1);  // tip y=0 (1px)
  px(g, darkColor, ox + 12, 0, 1, 1);  // dark outline at tip
  // Right ear inner
  px(g, lightColor, ox + 11, 1, 1, 1); // inner ear highlight
  px(g, lightColor, ox + 11, 2, 1, 1);

  // --- Flat muzzle ---
  px(g, muzzleColor, ox + 5, 7, 6, 3); // muzzle block y=7..9
  px(g, muzzleColor, ox + 6, 6, 4, 1); // muzzle bridge y=6

  // --- Eyes (with double highlight) ---
  px(g, EYE, ox + 5, 4, 2, 2);         // left eye
  px(g, EYE, ox + 9, 4, 2, 2);         // right eye
  px(g, 0xffffff, ox + 5, 4, 1, 1);    // left eye shine top
  px(g, 0xcccccc, ox + 6, 5, 1, 1);    // left eye shine bottom (dimmer)
  px(g, 0xffffff, ox + 9, 4, 1, 1);    // right eye shine top
  px(g, 0xcccccc, ox + 10, 5, 1, 1);   // right eye shine bottom (dimmer)

  // --- Nose (3px wide) ---
  px(g, NOSE, ox + 6, 6, 3, 1);

  // --- Jowl marks (tiny dark marks at mouth corners) ---
  px(g, JOWL, ox + 5, 9, 1, 1);        // left jowl
  px(g, JOWL, ox + 10, 9, 1, 1);       // right jowl

  // --- Stubby tail (nub on back/right side) ---
  px(g, bodyColor, ox + 12, 9, 2, 1);  // tail base
  px(g, bodyColor, ox + 13, 8, 1, 1);  // tail tip (up)

  // --- White chest for Zacko ---
  if (hasWhiteChest) {
    px(g, WHITE_CHEST, ox + 6, 7, 4, 1);  // upper chest
    px(g, WHITE_CHEST, ox + 5, 8, 6, 3);  // main chest patch
  }

  // --- Legs ---
  px(g, darkColor, ox + 4, 12, 2, 3);  // left leg
  px(g, darkColor, ox + 10, 12, 2, 3); // right leg

  // --- Feet (slightly wider) ---
  px(g, darkColor, ox + 3, 14, 3, 2);  // left foot
  px(g, darkColor, ox + 10, 14, 3, 2); // right foot
}

function generatePoppletonSheet(scene: Phaser.Scene): void {
  const sheetKey = 'poppleton_sheet';
  if (scene.textures.exists(sheetKey)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  const fw = 16;
  const totalWidth = fw * 8;

  // Frame 0: idle standing (relaxed, slight belly sag)
  drawFrenchieBase(g, 0, FAWN, FAWN_DARK, FAWN_LIGHT, MUZZLE, false);
  // Add belly sag: 1px lower body extension
  px(g, FAWN, 0 + 5, 12, 6, 1);

  // Frame 1: idle (ear wiggle + tiny tongue)
  drawFrenchieBase(g, fw, FAWN, FAWN_DARK, FAWN_LIGHT, MUZZLE, false);
  // Override ears: slightly wider spread
  // Left ear shifted 1px outward
  px(g, FAWN, fw + 2, 2, 3, 1);        // base at y=2
  px(g, FAWN, fw + 2, 1, 2, 1);        // mid at y=1
  px(g, FAWN, fw + 2, 0, 1, 1);        // tip at y=0
  px(g, FAWN_DARK, fw + 2, 0, 1, 1);   // dark tip
  px(g, FAWN_LIGHT, fw + 3, 1, 1, 1);  // inner ear
  px(g, FAWN_LIGHT, fw + 3, 2, 1, 1);
  // Right ear shifted 1px outward
  px(g, FAWN, fw + 11, 2, 3, 1);       // base at y=2
  px(g, FAWN, fw + 12, 1, 2, 1);       // mid at y=1
  px(g, FAWN, fw + 13, 0, 1, 1);       // tip at y=0
  px(g, FAWN_DARK, fw + 13, 0, 1, 1);  // dark tip
  px(g, FAWN_LIGHT, fw + 12, 1, 1, 1); // inner ear
  px(g, FAWN_LIGHT, fw + 12, 2, 1, 1);
  // Tiny tongue poking out (1px pink at mouth)
  px(g, TONGUE_PINK, fw + 7, 10, 2, 1);

  // Frame 2: run (left legs forward, body leaned left 1px)
  {
    const ox = fw * 2;
    // Body shifted left 1px for lean
    // Rounded body
    px(g, FAWN, ox + 4, 6, 6, 1);
    px(g, FAWN, ox + 3, 7, 8, 1);
    px(g, FAWN, ox + 2, 8, 10, 2);     // wide center
    px(g, FAWN, ox + 3, 10, 8, 1);
    px(g, FAWN, ox + 4, 11, 6, 1);
    px(g, FAWN_LIGHT, ox + 4, 6, 6, 1); // top highlight
    px(g, FAWN_DARK, ox + 4, 11, 6, 1); // bottom shadow
    // Head (shifted left 1px)
    px(g, FAWN, ox + 3, 3, 8, 4);
    px(g, FAWN, ox + 4, 2, 6, 1);
    px(g, FAWN_LIGHT, ox + 4, 2, 6, 1);
    // Ears (triangular)
    px(g, FAWN, ox + 2, 2, 3, 1);
    px(g, FAWN, ox + 2, 1, 2, 1);
    px(g, FAWN, ox + 2, 0, 1, 1);
    px(g, FAWN_DARK, ox + 2, 0, 1, 1);
    px(g, FAWN_LIGHT, ox + 3, 1, 1, 2);
    px(g, FAWN, ox + 9, 2, 3, 1);
    px(g, FAWN, ox + 10, 1, 2, 1);
    px(g, FAWN, ox + 11, 0, 1, 1);
    px(g, FAWN_DARK, ox + 11, 0, 1, 1);
    px(g, FAWN_LIGHT, ox + 10, 1, 1, 2);
    // Muzzle
    px(g, MUZZLE, ox + 4, 7, 6, 3);
    px(g, MUZZLE, ox + 5, 6, 4, 1);
    // Eyes
    px(g, EYE, ox + 4, 4, 2, 2);
    px(g, EYE, ox + 8, 4, 2, 2);
    px(g, 0xffffff, ox + 4, 4, 1, 1);
    px(g, 0xcccccc, ox + 5, 5, 1, 1);
    px(g, 0xffffff, ox + 8, 4, 1, 1);
    px(g, 0xcccccc, ox + 9, 5, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 5, 6, 3, 1);
    // Jowls
    px(g, JOWL, ox + 4, 9, 1, 1);
    px(g, JOWL, ox + 9, 9, 1, 1);
    // Tail nub
    px(g, FAWN, ox + 11, 9, 2, 1);
    px(g, FAWN, ox + 12, 8, 1, 1);
    // Left leg forward (dramatic)
    px(g, FAWN_DARK, ox + 2, 11, 2, 4);
    px(g, FAWN_DARK, ox + 1, 14, 3, 2);
    // Right leg back (dramatic)
    px(g, FAWN_DARK, ox + 11, 11, 2, 4);
    px(g, FAWN_DARK, ox + 12, 14, 3, 2);
  }

  // Frame 3: run (right legs forward, body leaned right 1px)
  {
    const ox = fw * 3;
    // Body shifted right 1px for lean
    px(g, FAWN, ox + 6, 6, 6, 1);
    px(g, FAWN, ox + 5, 7, 8, 1);
    px(g, FAWN, ox + 4, 8, 10, 2);     // wide center
    px(g, FAWN, ox + 5, 10, 8, 1);
    px(g, FAWN, ox + 6, 11, 6, 1);
    px(g, FAWN_LIGHT, ox + 6, 6, 6, 1); // top highlight
    px(g, FAWN_DARK, ox + 6, 11, 6, 1); // bottom shadow
    // Head (shifted right 1px)
    px(g, FAWN, ox + 5, 3, 8, 4);
    px(g, FAWN, ox + 6, 2, 6, 1);
    px(g, FAWN_LIGHT, ox + 6, 2, 6, 1);
    // Ears
    px(g, FAWN, ox + 4, 2, 3, 1);
    px(g, FAWN, ox + 4, 1, 2, 1);
    px(g, FAWN, ox + 4, 0, 1, 1);
    px(g, FAWN_DARK, ox + 4, 0, 1, 1);
    px(g, FAWN_LIGHT, ox + 5, 1, 1, 2);
    px(g, FAWN, ox + 11, 2, 3, 1);
    px(g, FAWN, ox + 12, 1, 2, 1);
    px(g, FAWN, ox + 13, 0, 1, 1);
    px(g, FAWN_DARK, ox + 13, 0, 1, 1);
    px(g, FAWN_LIGHT, ox + 12, 1, 1, 2);
    // Muzzle
    px(g, MUZZLE, ox + 6, 7, 6, 3);
    px(g, MUZZLE, ox + 7, 6, 4, 1);
    // Eyes
    px(g, EYE, ox + 6, 4, 2, 2);
    px(g, EYE, ox + 10, 4, 2, 2);
    px(g, 0xffffff, ox + 6, 4, 1, 1);
    px(g, 0xcccccc, ox + 7, 5, 1, 1);
    px(g, 0xffffff, ox + 10, 4, 1, 1);
    px(g, 0xcccccc, ox + 11, 5, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 7, 6, 3, 1);
    // Jowls
    px(g, JOWL, ox + 6, 9, 1, 1);
    px(g, JOWL, ox + 11, 9, 1, 1);
    // Tail nub
    px(g, FAWN, ox + 13, 9, 2, 1);
    px(g, FAWN, ox + 14, 8, 1, 1);
    // Left leg back (dramatic)
    px(g, FAWN_DARK, ox + 4, 11, 2, 4);
    px(g, FAWN_DARK, ox + 3, 14, 3, 2);
    // Right leg forward (dramatic)
    px(g, FAWN_DARK, ox + 10, 11, 2, 4);
    px(g, FAWN_DARK, ox + 10, 14, 3, 2);
  }

  // Frame 4: jump (ears fully erect/straight up, compact body)
  {
    const ox = fw * 4;
    // Compact body shifted up 1px
    px(g, FAWN, ox + 5, 5, 6, 1);
    px(g, FAWN, ox + 4, 6, 8, 1);
    px(g, FAWN, ox + 3, 7, 10, 2);
    px(g, FAWN, ox + 4, 9, 8, 1);
    px(g, FAWN, ox + 5, 10, 6, 1);
    px(g, FAWN_LIGHT, ox + 5, 5, 6, 1);
    px(g, FAWN_DARK, ox + 5, 10, 6, 1);
    // Head
    px(g, FAWN, ox + 4, 2, 8, 4);
    px(g, FAWN, ox + 5, 1, 6, 1);
    px(g, FAWN_LIGHT, ox + 5, 1, 6, 1);
    // Ears: fully erect, straight up (tall and narrow)
    // Left ear: 2px wide, 3px tall, straight up from y=-1 (clamped to 0)
    px(g, FAWN, ox + 4, 1, 2, 1);      // base connects to head
    px(g, FAWN, ox + 4, 0, 1, 1);      // top pixel
    px(g, FAWN_DARK, ox + 4, 0, 1, 1); // dark tip
    px(g, FAWN_LIGHT, ox + 5, 0, 1, 1);// inner ear
    // Right ear
    px(g, FAWN, ox + 10, 1, 2, 1);
    px(g, FAWN, ox + 11, 0, 1, 1);
    px(g, FAWN_DARK, ox + 11, 0, 1, 1);
    px(g, FAWN_LIGHT, ox + 10, 0, 1, 1);
    // Muzzle
    px(g, MUZZLE, ox + 5, 6, 6, 3);
    px(g, MUZZLE, ox + 6, 5, 4, 1);
    // Eyes
    px(g, EYE, ox + 5, 3, 2, 2);
    px(g, EYE, ox + 9, 3, 2, 2);
    px(g, 0xffffff, ox + 5, 3, 1, 1);
    px(g, 0xcccccc, ox + 6, 4, 1, 1);
    px(g, 0xffffff, ox + 9, 3, 1, 1);
    px(g, 0xcccccc, ox + 10, 4, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 6, 5, 3, 1);
    // Jowls
    px(g, JOWL, ox + 5, 8, 1, 1);
    px(g, JOWL, ox + 10, 8, 1, 1);
    // Tail nub
    px(g, FAWN, ox + 12, 8, 2, 1);
    px(g, FAWN, ox + 13, 7, 1, 1);
    // Tucked legs (short, pulled under body)
    px(g, FAWN_DARK, ox + 4, 10, 3, 2);
    px(g, FAWN_DARK, ox + 9, 10, 3, 2);
  }

  // Frame 5: fall (ears wide/alert, surprised "O" mouth)
  {
    const ox = fw * 5;
    // Body shifted down 1px
    px(g, FAWN, ox + 5, 7, 6, 1);
    px(g, FAWN, ox + 4, 8, 8, 1);
    px(g, FAWN, ox + 3, 9, 10, 2);
    px(g, FAWN, ox + 4, 11, 8, 1);
    px(g, FAWN, ox + 5, 12, 6, 1);
    px(g, FAWN_LIGHT, ox + 5, 7, 6, 1);
    px(g, FAWN_DARK, ox + 5, 12, 6, 1);
    // Head
    px(g, FAWN, ox + 4, 4, 8, 4);
    px(g, FAWN, ox + 5, 3, 6, 1);
    px(g, FAWN_LIGHT, ox + 5, 3, 6, 1);
    // Ears wide/alert (spread out, tall)
    // Left ear spread outward
    px(g, FAWN, ox + 2, 3, 3, 1);      // base
    px(g, FAWN, ox + 2, 2, 2, 1);      // mid
    px(g, FAWN, ox + 2, 1, 1, 1);      // top
    px(g, FAWN, ox + 2, 0, 1, 1);      // tip
    px(g, FAWN_DARK, ox + 2, 0, 1, 1); // dark tip
    px(g, FAWN_LIGHT, ox + 3, 1, 1, 2);
    // Right ear spread outward
    px(g, FAWN, ox + 11, 3, 3, 1);
    px(g, FAWN, ox + 12, 2, 2, 1);
    px(g, FAWN, ox + 13, 1, 1, 1);
    px(g, FAWN, ox + 13, 0, 1, 1);
    px(g, FAWN_DARK, ox + 13, 0, 1, 1);
    px(g, FAWN_LIGHT, ox + 12, 1, 1, 2);
    // Muzzle
    px(g, MUZZLE, ox + 5, 8, 6, 3);
    px(g, MUZZLE, ox + 6, 7, 4, 1);
    // Surprised "O" mouth (small circle in muzzle)
    px(g, 0x3a2018, ox + 7, 9, 2, 2);  // open mouth "O"
    // Eyes (wider, surprised)
    px(g, EYE, ox + 5, 5, 2, 2);
    px(g, EYE, ox + 9, 5, 2, 2);
    px(g, 0xffffff, ox + 5, 5, 1, 1);
    px(g, 0xcccccc, ox + 6, 6, 1, 1);
    px(g, 0xffffff, ox + 9, 5, 1, 1);
    px(g, 0xcccccc, ox + 10, 6, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 6, 7, 3, 1);
    // Tail nub
    px(g, FAWN, ox + 12, 10, 2, 1);
    px(g, FAWN, ox + 13, 9, 1, 1);
    // Spread legs (wide apart)
    px(g, FAWN_DARK, ox + 2, 12, 2, 4);
    px(g, FAWN_DARK, ox + 12, 12, 2, 4);
    px(g, FAWN_DARK, ox + 1, 14, 3, 2);
    px(g, FAWN_DARK, ox + 12, 14, 3, 2);
  }

  // Frame 6: attack (dynamic lunge, wider open mouth)
  {
    const ox = fw * 6;
    // Body lunging forward (shifted right 2px), rounded
    px(g, FAWN, ox + 7, 6, 6, 1);
    px(g, FAWN, ox + 6, 7, 8, 1);
    px(g, FAWN, ox + 5, 8, 9, 2);
    px(g, FAWN, ox + 6, 10, 8, 1);
    px(g, FAWN, ox + 7, 11, 6, 1);
    px(g, FAWN_LIGHT, ox + 7, 6, 6, 1);
    px(g, FAWN_DARK, ox + 7, 11, 6, 1);
    // Head pushed forward
    px(g, FAWN, ox + 6, 3, 8, 4);
    px(g, FAWN, ox + 7, 2, 6, 1);
    px(g, FAWN_LIGHT, ox + 7, 2, 6, 1);
    // Ears pinned back
    px(g, FAWN, ox + 4, 2, 3, 1);
    px(g, FAWN, ox + 4, 1, 2, 1);
    px(g, FAWN, ox + 4, 0, 1, 1);
    px(g, FAWN_DARK, ox + 4, 0, 1, 1);
    px(g, FAWN_LIGHT, ox + 5, 1, 1, 1);
    px(g, FAWN, ox + 12, 2, 3, 1);
    px(g, FAWN, ox + 13, 1, 2, 1);
    px(g, FAWN, ox + 14, 0, 1, 1);
    px(g, FAWN_DARK, ox + 14, 0, 1, 1);
    px(g, FAWN_LIGHT, ox + 13, 1, 1, 1);
    // Muzzle (wide open mouth for lunge)
    px(g, MUZZLE, ox + 8, 6, 6, 2);    // upper muzzle
    px(g, 0x3a2018, ox + 9, 8, 5, 2);  // wide open mouth interior
    px(g, TONGUE_PINK, ox + 10, 9, 3, 1); // tongue visible in open mouth
    px(g, MUZZLE, ox + 8, 10, 6, 1);   // lower jaw
    // Eyes (focused, intense)
    px(g, EYE, ox + 7, 4, 2, 2);
    px(g, EYE, ox + 11, 4, 2, 2);
    px(g, 0xffffff, ox + 7, 4, 1, 1);
    px(g, 0xffffff, ox + 11, 4, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 9, 6, 3, 1);
    // Jowls
    px(g, JOWL, ox + 8, 10, 1, 1);
    px(g, JOWL, ox + 13, 10, 1, 1);
    // Extended front legs (lunge pose)
    px(g, FAWN_DARK, ox + 3, 10, 2, 4);
    px(g, FAWN_DARK, ox + 2, 13, 3, 2);
    // Back leg pushing off
    px(g, FAWN_DARK, ox + 12, 11, 2, 4);
    px(g, FAWN_DARK, ox + 13, 14, 3, 2);
  }

  // Frame 7: hurt (dramatic recoil, more flash patches)
  {
    const ox = fw * 7;
    // Body pulled back, rounded
    px(g, FAWN, ox + 4, 7, 6, 1);
    px(g, FAWN, ox + 3, 8, 8, 1);
    px(g, FAWN, ox + 2, 9, 10, 2);
    px(g, FAWN, ox + 3, 11, 8, 1);
    px(g, FAWN, ox + 4, 12, 6, 1);
    // Flash overlay patches (more dramatic -- 5 patches)
    px(g, HURT_FLASH, ox + 3, 8, 2, 2);  // left shoulder flash
    px(g, HURT_FLASH, ox + 7, 9, 3, 2);  // belly flash
    px(g, HURT_FLASH, ox + 10, 8, 2, 1); // right side flash
    // Head tilted back
    px(g, FAWN, ox + 3, 3, 8, 5);
    px(g, FAWN, ox + 4, 2, 6, 1);
    px(g, HURT_FLASH, ox + 5, 3, 2, 2); // head flash
    px(g, HURT_FLASH, ox + 9, 4, 2, 1); // second head flash
    // Ears drooping (flat/sideways)
    px(g, FAWN, ox + 1, 2, 3, 1);       // left ear droops left
    px(g, FAWN, ox + 1, 1, 2, 1);
    px(g, FAWN, ox + 10, 2, 3, 1);      // right ear droops right
    px(g, FAWN, ox + 11, 1, 2, 1);
    // Muzzle
    px(g, MUZZLE, ox + 4, 7, 6, 2);
    // Eyes squinting (hurt -- thin lines)
    px(g, EYE, ox + 4, 4, 3, 1);
    px(g, EYE, ox + 8, 4, 3, 1);
    // Nose (3px)
    px(g, NOSE, ox + 6, 6, 3, 1);
    // Legs staggered (recoiling)
    px(g, FAWN_DARK, ox + 3, 12, 2, 3);
    px(g, FAWN_DARK, ox + 2, 14, 3, 2);
    px(g, FAWN_DARK, ox + 9, 13, 2, 3);
    px(g, FAWN_DARK, ox + 9, 14, 3, 2);
  }

  // Generate the texture strip
  const tempKey = '_poppleton_strip';
  g.generateTexture(tempKey, totalWidth, fw);
  g.destroy();

  // Create spritesheet from generated texture
  const src = scene.textures.get(tempKey).getSourceImage();
  scene.textures.addSpriteSheet(sheetKey, src as HTMLImageElement, {
    frameWidth: fw,
    frameHeight: fw,
  });
  scene.textures.remove(tempKey);

  // Register animations
  scene.anims.create({
    key: 'poppleton_idle',
    frames: scene.anims.generateFrameNumbers(sheetKey, { start: 0, end: 1 }),
    frameRate: 4,
    repeat: -1,
  });
  scene.anims.create({
    key: 'poppleton_run',
    frames: scene.anims.generateFrameNumbers(sheetKey, { start: 2, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'poppleton_jump',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [4] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'poppleton_fall',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [5] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'poppleton_attack',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [6] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'poppleton_hurt',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [7] }),
    frameRate: 1,
    repeat: 0,
  });
}

// ---------------------------------------------------------------------------
// Zacko sprite sheet  (128 x 16, 8 frames of 16x16)
// ---------------------------------------------------------------------------

function generateZackoSheet(scene: Phaser.Scene): void {
  const sheetKey = 'zacko_sheet';
  if (scene.textures.exists(sheetKey)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  const fw = 16;
  const totalWidth = fw * 8;

  // Frame 0: idle standing (relaxed, slight belly sag)
  drawFrenchieBase(g, 0, BLACK_BODY, BLACK_DARK, 0x3a3a3a, WHITE_MUZZLE, true);
  // Add belly sag: 1px lower body extension
  px(g, BLACK_BODY, 0 + 5, 12, 6, 1);

  // Frame 1: idle (ear wiggle + tiny tongue)
  drawFrenchieBase(g, fw, BLACK_BODY, BLACK_DARK, 0x3a3a3a, WHITE_MUZZLE, true);
  // Override ears: slightly wider spread
  // Left ear shifted 1px outward
  px(g, BLACK_BODY, fw + 2, 2, 3, 1);
  px(g, BLACK_BODY, fw + 2, 1, 2, 1);
  px(g, BLACK_BODY, fw + 2, 0, 1, 1);
  px(g, BLACK_DARK, fw + 2, 0, 1, 1);
  px(g, 0x3a3a3a, fw + 3, 1, 1, 1);
  px(g, 0x3a3a3a, fw + 3, 2, 1, 1);
  // Right ear shifted 1px outward
  px(g, BLACK_BODY, fw + 11, 2, 3, 1);
  px(g, BLACK_BODY, fw + 12, 1, 2, 1);
  px(g, BLACK_BODY, fw + 13, 0, 1, 1);
  px(g, BLACK_DARK, fw + 13, 0, 1, 1);
  px(g, 0x3a3a3a, fw + 12, 1, 1, 1);
  px(g, 0x3a3a3a, fw + 12, 2, 1, 1);
  // Tiny tongue poking out (1px pink at mouth)
  px(g, TONGUE_PINK, fw + 7, 10, 2, 1);

  // Frame 2: run (left legs forward, body leaned left 1px)
  {
    const ox = fw * 2;
    // Body shifted left 1px for lean, rounded
    px(g, BLACK_BODY, ox + 4, 6, 6, 1);
    px(g, BLACK_BODY, ox + 3, 7, 8, 1);
    px(g, BLACK_BODY, ox + 2, 8, 10, 2);
    px(g, BLACK_BODY, ox + 3, 10, 8, 1);
    px(g, BLACK_BODY, ox + 4, 11, 6, 1);
    px(g, 0x3a3a3a, ox + 4, 6, 6, 1);     // top highlight
    px(g, BLACK_DARK, ox + 4, 11, 6, 1);   // bottom shadow
    // White chest
    px(g, WHITE_CHEST, ox + 5, 7, 4, 1);
    px(g, WHITE_CHEST, ox + 4, 8, 6, 3);
    // Head (shifted left 1px)
    px(g, BLACK_BODY, ox + 3, 3, 8, 4);
    px(g, BLACK_BODY, ox + 4, 2, 6, 1);
    px(g, 0x3a3a3a, ox + 4, 2, 6, 1);
    // Ears (triangular)
    px(g, BLACK_BODY, ox + 2, 2, 3, 1);
    px(g, BLACK_BODY, ox + 2, 1, 2, 1);
    px(g, BLACK_BODY, ox + 2, 0, 1, 1);
    px(g, BLACK_DARK, ox + 2, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 3, 1, 1, 2);
    px(g, BLACK_BODY, ox + 9, 2, 3, 1);
    px(g, BLACK_BODY, ox + 10, 1, 2, 1);
    px(g, BLACK_BODY, ox + 11, 0, 1, 1);
    px(g, BLACK_DARK, ox + 11, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 10, 1, 1, 2);
    // Muzzle
    px(g, WHITE_MUZZLE, ox + 4, 7, 6, 3);
    px(g, WHITE_MUZZLE, ox + 5, 6, 4, 1);
    // Eyes
    px(g, EYE, ox + 4, 4, 2, 2);
    px(g, EYE, ox + 8, 4, 2, 2);
    px(g, 0xffffff, ox + 4, 4, 1, 1);
    px(g, 0xcccccc, ox + 5, 5, 1, 1);
    px(g, 0xffffff, ox + 8, 4, 1, 1);
    px(g, 0xcccccc, ox + 9, 5, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 5, 6, 3, 1);
    // Jowls
    px(g, JOWL, ox + 4, 9, 1, 1);
    px(g, JOWL, ox + 9, 9, 1, 1);
    // Tail nub
    px(g, BLACK_BODY, ox + 11, 9, 2, 1);
    px(g, BLACK_BODY, ox + 12, 8, 1, 1);
    // Left leg forward (dramatic)
    px(g, BLACK_DARK, ox + 2, 11, 2, 4);
    px(g, BLACK_DARK, ox + 1, 14, 3, 2);
    // Right leg back (dramatic)
    px(g, BLACK_DARK, ox + 11, 11, 2, 4);
    px(g, BLACK_DARK, ox + 12, 14, 3, 2);
  }

  // Frame 3: run (right legs forward, body leaned right 1px)
  {
    const ox = fw * 3;
    // Body shifted right 1px for lean
    px(g, BLACK_BODY, ox + 6, 6, 6, 1);
    px(g, BLACK_BODY, ox + 5, 7, 8, 1);
    px(g, BLACK_BODY, ox + 4, 8, 10, 2);
    px(g, BLACK_BODY, ox + 5, 10, 8, 1);
    px(g, BLACK_BODY, ox + 6, 11, 6, 1);
    px(g, 0x3a3a3a, ox + 6, 6, 6, 1);
    px(g, BLACK_DARK, ox + 6, 11, 6, 1);
    // White chest
    px(g, WHITE_CHEST, ox + 7, 7, 4, 1);
    px(g, WHITE_CHEST, ox + 6, 8, 6, 3);
    // Head (shifted right 1px)
    px(g, BLACK_BODY, ox + 5, 3, 8, 4);
    px(g, BLACK_BODY, ox + 6, 2, 6, 1);
    px(g, 0x3a3a3a, ox + 6, 2, 6, 1);
    // Ears
    px(g, BLACK_BODY, ox + 4, 2, 3, 1);
    px(g, BLACK_BODY, ox + 4, 1, 2, 1);
    px(g, BLACK_BODY, ox + 4, 0, 1, 1);
    px(g, BLACK_DARK, ox + 4, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 5, 1, 1, 2);
    px(g, BLACK_BODY, ox + 11, 2, 3, 1);
    px(g, BLACK_BODY, ox + 12, 1, 2, 1);
    px(g, BLACK_BODY, ox + 13, 0, 1, 1);
    px(g, BLACK_DARK, ox + 13, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 12, 1, 1, 2);
    // Muzzle
    px(g, WHITE_MUZZLE, ox + 6, 7, 6, 3);
    px(g, WHITE_MUZZLE, ox + 7, 6, 4, 1);
    // Eyes
    px(g, EYE, ox + 6, 4, 2, 2);
    px(g, EYE, ox + 10, 4, 2, 2);
    px(g, 0xffffff, ox + 6, 4, 1, 1);
    px(g, 0xcccccc, ox + 7, 5, 1, 1);
    px(g, 0xffffff, ox + 10, 4, 1, 1);
    px(g, 0xcccccc, ox + 11, 5, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 7, 6, 3, 1);
    // Jowls
    px(g, JOWL, ox + 6, 9, 1, 1);
    px(g, JOWL, ox + 11, 9, 1, 1);
    // Tail nub
    px(g, BLACK_BODY, ox + 13, 9, 2, 1);
    px(g, BLACK_BODY, ox + 14, 8, 1, 1);
    // Left leg back (dramatic)
    px(g, BLACK_DARK, ox + 4, 11, 2, 4);
    px(g, BLACK_DARK, ox + 3, 14, 3, 2);
    // Right leg forward (dramatic)
    px(g, BLACK_DARK, ox + 10, 11, 2, 4);
    px(g, BLACK_DARK, ox + 10, 14, 3, 2);
  }

  // Frame 4: jump (ears fully erect, compact body)
  {
    const ox = fw * 4;
    // Compact body shifted up 1px, rounded
    px(g, BLACK_BODY, ox + 5, 5, 6, 1);
    px(g, BLACK_BODY, ox + 4, 6, 8, 1);
    px(g, BLACK_BODY, ox + 3, 7, 10, 2);
    px(g, BLACK_BODY, ox + 4, 9, 8, 1);
    px(g, BLACK_BODY, ox + 5, 10, 6, 1);
    px(g, 0x3a3a3a, ox + 5, 5, 6, 1);
    px(g, BLACK_DARK, ox + 5, 10, 6, 1);
    // White chest
    px(g, WHITE_CHEST, ox + 6, 6, 4, 1);
    px(g, WHITE_CHEST, ox + 5, 7, 6, 3);
    // Head
    px(g, BLACK_BODY, ox + 4, 2, 8, 4);
    px(g, BLACK_BODY, ox + 5, 1, 6, 1);
    px(g, 0x3a3a3a, ox + 5, 1, 6, 1);
    // Ears: fully erect, straight up
    px(g, BLACK_BODY, ox + 4, 1, 2, 1);
    px(g, BLACK_BODY, ox + 4, 0, 1, 1);
    px(g, BLACK_DARK, ox + 4, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 5, 0, 1, 1);
    px(g, BLACK_BODY, ox + 10, 1, 2, 1);
    px(g, BLACK_BODY, ox + 11, 0, 1, 1);
    px(g, BLACK_DARK, ox + 11, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 10, 0, 1, 1);
    // Muzzle
    px(g, WHITE_MUZZLE, ox + 5, 6, 6, 3);
    px(g, WHITE_MUZZLE, ox + 6, 5, 4, 1);
    // Eyes
    px(g, EYE, ox + 5, 3, 2, 2);
    px(g, EYE, ox + 9, 3, 2, 2);
    px(g, 0xffffff, ox + 5, 3, 1, 1);
    px(g, 0xcccccc, ox + 6, 4, 1, 1);
    px(g, 0xffffff, ox + 9, 3, 1, 1);
    px(g, 0xcccccc, ox + 10, 4, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 6, 5, 3, 1);
    // Jowls
    px(g, JOWL, ox + 5, 8, 1, 1);
    px(g, JOWL, ox + 10, 8, 1, 1);
    // Tail nub
    px(g, BLACK_BODY, ox + 12, 8, 2, 1);
    px(g, BLACK_BODY, ox + 13, 7, 1, 1);
    // Tucked legs
    px(g, BLACK_DARK, ox + 4, 10, 3, 2);
    px(g, BLACK_DARK, ox + 9, 10, 3, 2);
  }

  // Frame 5: fall (ears wide/alert, surprised "O" mouth)
  {
    const ox = fw * 5;
    // Body shifted down 1px, rounded
    px(g, BLACK_BODY, ox + 5, 7, 6, 1);
    px(g, BLACK_BODY, ox + 4, 8, 8, 1);
    px(g, BLACK_BODY, ox + 3, 9, 10, 2);
    px(g, BLACK_BODY, ox + 4, 11, 8, 1);
    px(g, BLACK_BODY, ox + 5, 12, 6, 1);
    px(g, 0x3a3a3a, ox + 5, 7, 6, 1);
    px(g, BLACK_DARK, ox + 5, 12, 6, 1);
    // White chest
    px(g, WHITE_CHEST, ox + 6, 8, 4, 1);
    px(g, WHITE_CHEST, ox + 5, 9, 6, 3);
    // Head
    px(g, BLACK_BODY, ox + 4, 4, 8, 4);
    px(g, BLACK_BODY, ox + 5, 3, 6, 1);
    px(g, 0x3a3a3a, ox + 5, 3, 6, 1);
    // Ears wide/alert (spread out)
    px(g, BLACK_BODY, ox + 2, 3, 3, 1);
    px(g, BLACK_BODY, ox + 2, 2, 2, 1);
    px(g, BLACK_BODY, ox + 2, 1, 1, 1);
    px(g, BLACK_BODY, ox + 2, 0, 1, 1);
    px(g, BLACK_DARK, ox + 2, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 3, 1, 1, 2);
    px(g, BLACK_BODY, ox + 11, 3, 3, 1);
    px(g, BLACK_BODY, ox + 12, 2, 2, 1);
    px(g, BLACK_BODY, ox + 13, 1, 1, 1);
    px(g, BLACK_BODY, ox + 13, 0, 1, 1);
    px(g, BLACK_DARK, ox + 13, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 12, 1, 1, 2);
    // Muzzle
    px(g, WHITE_MUZZLE, ox + 5, 8, 6, 3);
    px(g, WHITE_MUZZLE, ox + 6, 7, 4, 1);
    // Surprised "O" mouth
    px(g, 0x3a2018, ox + 7, 9, 2, 2);
    // Eyes (wider, surprised)
    px(g, EYE, ox + 5, 5, 2, 2);
    px(g, EYE, ox + 9, 5, 2, 2);
    px(g, 0xffffff, ox + 5, 5, 1, 1);
    px(g, 0xcccccc, ox + 6, 6, 1, 1);
    px(g, 0xffffff, ox + 9, 5, 1, 1);
    px(g, 0xcccccc, ox + 10, 6, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 6, 7, 3, 1);
    // Tail nub
    px(g, BLACK_BODY, ox + 12, 10, 2, 1);
    px(g, BLACK_BODY, ox + 13, 9, 1, 1);
    // Spread legs (wide apart)
    px(g, BLACK_DARK, ox + 2, 12, 2, 4);
    px(g, BLACK_DARK, ox + 12, 12, 2, 4);
    px(g, BLACK_DARK, ox + 1, 14, 3, 2);
    px(g, BLACK_DARK, ox + 12, 14, 3, 2);
  }

  // Frame 6: attack (dynamic lunge, wider open mouth with bark effect)
  {
    const ox = fw * 6;
    // Body lunging forward, rounded
    px(g, BLACK_BODY, ox + 7, 6, 6, 1);
    px(g, BLACK_BODY, ox + 6, 7, 8, 1);
    px(g, BLACK_BODY, ox + 5, 8, 9, 2);
    px(g, BLACK_BODY, ox + 6, 10, 8, 1);
    px(g, BLACK_BODY, ox + 7, 11, 6, 1);
    px(g, 0x3a3a3a, ox + 7, 6, 6, 1);
    px(g, BLACK_DARK, ox + 7, 11, 6, 1);
    // White chest
    px(g, WHITE_CHEST, ox + 8, 7, 4, 1);
    px(g, WHITE_CHEST, ox + 7, 8, 6, 3);
    // Head pushed forward
    px(g, BLACK_BODY, ox + 6, 3, 8, 4);
    px(g, BLACK_BODY, ox + 7, 2, 6, 1);
    px(g, 0x3a3a3a, ox + 7, 2, 6, 1);
    // Ears pinned back
    px(g, BLACK_BODY, ox + 4, 2, 3, 1);
    px(g, BLACK_BODY, ox + 4, 1, 2, 1);
    px(g, BLACK_BODY, ox + 4, 0, 1, 1);
    px(g, BLACK_DARK, ox + 4, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 5, 1, 1, 1);
    px(g, BLACK_BODY, ox + 12, 2, 3, 1);
    px(g, BLACK_BODY, ox + 13, 1, 2, 1);
    px(g, BLACK_BODY, ox + 14, 0, 1, 1);
    px(g, BLACK_DARK, ox + 14, 0, 1, 1);
    px(g, 0x3a3a3a, ox + 13, 1, 1, 1);
    // Muzzle (wide open mouth for bark)
    px(g, WHITE_MUZZLE, ox + 8, 6, 6, 2);     // upper muzzle
    px(g, 0xff6666, ox + 9, 8, 5, 2);         // wide open mouth interior
    px(g, TONGUE_PINK, ox + 10, 9, 3, 1);     // tongue visible
    px(g, WHITE_MUZZLE, ox + 8, 10, 6, 1);    // lower jaw
    // Eyes (focused, intense)
    px(g, EYE, ox + 7, 4, 2, 2);
    px(g, EYE, ox + 11, 4, 2, 2);
    px(g, 0xffffff, ox + 7, 4, 1, 1);
    px(g, 0xffffff, ox + 11, 4, 1, 1);
    // Nose (3px)
    px(g, NOSE, ox + 9, 6, 3, 1);
    // Jowls
    px(g, JOWL, ox + 8, 10, 1, 1);
    px(g, JOWL, ox + 13, 10, 1, 1);
    // Sound wave lines (white pixels)
    px(g, 0xffffff, ox + 14, 5, 1, 1);
    px(g, 0xffffff, ox + 15, 4, 1, 3);
    // Extended front legs (lunge pose)
    px(g, BLACK_DARK, ox + 3, 10, 2, 4);
    px(g, BLACK_DARK, ox + 2, 13, 3, 2);
    // Back leg pushing off
    px(g, BLACK_DARK, ox + 12, 11, 2, 4);
    px(g, BLACK_DARK, ox + 13, 14, 3, 2);
  }

  // Frame 7: hurt (dramatic recoil, more flash patches)
  {
    const ox = fw * 7;
    // Body pulled back, rounded
    px(g, BLACK_BODY, ox + 4, 7, 6, 1);
    px(g, BLACK_BODY, ox + 3, 8, 8, 1);
    px(g, BLACK_BODY, ox + 2, 9, 10, 2);
    px(g, BLACK_BODY, ox + 3, 11, 8, 1);
    px(g, BLACK_BODY, ox + 4, 12, 6, 1);
    // White chest (still visible in recoil)
    px(g, WHITE_CHEST, ox + 4, 9, 6, 3);
    // Flash overlay patches (dramatic -- 5 patches)
    px(g, HURT_FLASH, ox + 3, 8, 2, 2);   // left shoulder flash
    px(g, HURT_FLASH, ox + 7, 9, 3, 2);   // belly flash
    px(g, HURT_FLASH, ox + 10, 8, 2, 1);  // right side flash
    // Head tilted back
    px(g, BLACK_BODY, ox + 3, 3, 8, 5);
    px(g, BLACK_BODY, ox + 4, 2, 6, 1);
    px(g, HURT_FLASH, ox + 5, 3, 2, 2);  // head flash
    px(g, HURT_FLASH, ox + 9, 4, 2, 1);  // second head flash
    // Ears drooping (flat/sideways)
    px(g, BLACK_BODY, ox + 1, 2, 3, 1);
    px(g, BLACK_BODY, ox + 1, 1, 2, 1);
    px(g, BLACK_BODY, ox + 10, 2, 3, 1);
    px(g, BLACK_BODY, ox + 11, 1, 2, 1);
    // Muzzle
    px(g, WHITE_MUZZLE, ox + 4, 7, 6, 2);
    // Eyes squinting (hurt -- thin lines)
    px(g, EYE, ox + 4, 4, 3, 1);
    px(g, EYE, ox + 8, 4, 3, 1);
    // Nose (3px)
    px(g, NOSE, ox + 6, 6, 3, 1);
    // Legs staggered (recoiling)
    px(g, BLACK_DARK, ox + 3, 12, 2, 3);
    px(g, BLACK_DARK, ox + 2, 14, 3, 2);
    px(g, BLACK_DARK, ox + 9, 13, 2, 3);
    px(g, BLACK_DARK, ox + 9, 14, 3, 2);
  }

  const tempKey = '_zacko_strip';
  g.generateTexture(tempKey, totalWidth, fw);
  g.destroy();

  const src = scene.textures.get(tempKey).getSourceImage();
  scene.textures.addSpriteSheet(sheetKey, src as HTMLImageElement, {
    frameWidth: fw,
    frameHeight: fw,
  });
  scene.textures.remove(tempKey);

  // Register animations
  scene.anims.create({
    key: 'zacko_idle',
    frames: scene.anims.generateFrameNumbers(sheetKey, { start: 0, end: 1 }),
    frameRate: 4,
    repeat: -1,
  });
  scene.anims.create({
    key: 'zacko_run',
    frames: scene.anims.generateFrameNumbers(sheetKey, { start: 2, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'zacko_jump',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [4] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'zacko_fall',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [5] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'zacko_attack',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [6] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'zacko_hurt',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [7] }),
    frameRate: 1,
    repeat: 0,
  });
}

// ---------------------------------------------------------------------------
// Brouillard Blob sprite sheet  (64 x 16, 4 frames of 16x16)
// ---------------------------------------------------------------------------

function generateBlobSheet(scene: Phaser.Scene): void {
  const sheetKey = 'blob_sheet';
  if (scene.textures.exists(sheetKey)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  const fw = 16;
  const totalWidth = fw * 4;

  // Frame 0: idle (normal shape)
  {
    const ox = 0;
    // Amorphous blob body
    px(g, BLOB_COLOR, ox + 3, 8, 10, 6);
    px(g, BLOB_COLOR, ox + 2, 9, 12, 4);
    px(g, BLOB_COLOR, ox + 4, 6, 8, 3);
    // Upper lumps
    px(g, BLOB_COLOR, ox + 4, 5, 4, 2);
    px(g, BLOB_COLOR, ox + 9, 5, 4, 2);
    // Highlights
    px(g, BLOB_LIGHT, ox + 5, 6, 2, 2);
    px(g, BLOB_LIGHT, ox + 10, 7, 1, 1);
    // Shadow underneath
    px(g, BLOB_DARK, ox + 3, 13, 10, 1);
    // Eyes
    px(g, BLOB_EYE, ox + 4, 8, 3, 3);
    px(g, BLOB_EYE, ox + 9, 8, 3, 3);
    px(g, BLOB_PUPIL, ox + 5, 9, 2, 2);
    px(g, BLOB_PUPIL, ox + 10, 9, 2, 2);
  }

  // Frame 1: idle wobble (slightly shifted/wider)
  {
    const ox = fw;
    px(g, BLOB_COLOR, ox + 2, 8, 12, 6);
    px(g, BLOB_COLOR, ox + 1, 9, 14, 4);
    px(g, BLOB_COLOR, ox + 3, 6, 10, 3);
    // Upper lumps shifted
    px(g, BLOB_COLOR, ox + 3, 5, 4, 2);
    px(g, BLOB_COLOR, ox + 10, 5, 4, 2);
    // Highlights
    px(g, BLOB_LIGHT, ox + 4, 6, 2, 2);
    px(g, BLOB_LIGHT, ox + 11, 7, 1, 1);
    // Shadow
    px(g, BLOB_DARK, ox + 2, 13, 12, 1);
    // Eyes (slightly shifted)
    px(g, BLOB_EYE, ox + 4, 8, 3, 3);
    px(g, BLOB_EYE, ox + 10, 8, 3, 3);
    px(g, BLOB_PUPIL, ox + 5, 9, 2, 2);
    px(g, BLOB_PUPIL, ox + 11, 9, 2, 2);
  }

  // Frame 2: hurt (compressed, lighter flash)
  {
    const ox = fw * 2;
    // Squished vertically
    px(g, BLOB_LIGHT, ox + 2, 10, 12, 4);
    px(g, BLOB_LIGHT, ox + 1, 11, 14, 2);
    px(g, BLOB_COLOR, ox + 3, 9, 10, 2);
    // Flash patches
    px(g, HURT_FLASH, ox + 5, 10, 3, 2);
    px(g, HURT_FLASH, ox + 9, 11, 2, 1);
    // Shadow
    px(g, BLOB_DARK, ox + 2, 14, 12, 1);
    // Eyes squinting
    px(g, BLOB_EYE, ox + 4, 10, 3, 2);
    px(g, BLOB_EYE, ox + 9, 10, 3, 2);
    px(g, BLOB_PUPIL, ox + 5, 10, 2, 1);
    px(g, BLOB_PUPIL, ox + 10, 10, 2, 1);
  }

  // Frame 3: defeat (stretched thin, fading)
  {
    const ox = fw * 3;
    // Stretched tall and thin
    px(g, BLOB_LIGHT, ox + 5, 4, 6, 10);
    px(g, BLOB_COLOR, ox + 6, 3, 4, 4);
    px(g, BLOB_LIGHT, ox + 7, 2, 2, 2);
    // Wispy top
    px(g, BLOB_LIGHT, ox + 7, 0, 2, 3);
    // Faded lower body
    px(g, BLOB_DARK, ox + 5, 12, 6, 2);
    px(g, BLOB_DARK, ox + 6, 14, 4, 2);
    // Eyes (small, fading)
    px(g, BLOB_EYE, ox + 6, 6, 2, 2);
    px(g, BLOB_EYE, ox + 9, 6, 2, 2);
    px(g, BLOB_PUPIL, ox + 6, 7, 1, 1);
    px(g, BLOB_PUPIL, ox + 10, 7, 1, 1);
  }

  const tempKey = '_blob_strip';
  g.generateTexture(tempKey, totalWidth, fw);
  g.destroy();

  const src = scene.textures.get(tempKey).getSourceImage();
  scene.textures.addSpriteSheet(sheetKey, src as HTMLImageElement, {
    frameWidth: fw,
    frameHeight: fw,
  });
  scene.textures.remove(tempKey);

  // Register animations
  scene.anims.create({
    key: 'blob_idle',
    frames: scene.anims.generateFrameNumbers(sheetKey, { start: 0, end: 1 }),
    frameRate: 3,
    repeat: -1,
  });
  scene.anims.create({
    key: 'blob_hurt',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [2] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'blob_defeat',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [3] }),
    frameRate: 1,
    repeat: 0,
  });
}

// ---------------------------------------------------------------------------
// Le Grand Grenouille sprite sheet  (128 x 32, 4 frames of 32x32)
// ---------------------------------------------------------------------------

function generateGrenouilleSheet(scene: Phaser.Scene): void {
  const sheetKey = 'grenouille_sheet';
  if (scene.textures.exists(sheetKey)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  const fw = 32;
  const totalWidth = fw * 4;

  // Frame 0: idle (sitting)
  {
    const ox = 0;
    // Body (wide, squat frog)
    px(g, FROG_GREEN, ox + 4, 12, 24, 14);
    px(g, FROG_GREEN, ox + 2, 14, 28, 10);
    px(g, FROG_GREEN, ox + 6, 10, 20, 4);
    // Belly
    px(g, FROG_BELLY, ox + 8, 18, 16, 6);
    px(g, FROG_BELLY, ox + 10, 16, 12, 3);
    // Head bumps (eyes on top)
    px(g, FROG_GREEN, ox + 6, 8, 6, 4);
    px(g, FROG_GREEN, ox + 20, 8, 6, 4);
    // Eye backgrounds
    px(g, FROG_EYE_BG, ox + 7, 8, 4, 4);
    px(g, FROG_EYE_BG, ox + 21, 8, 4, 4);
    // Pupils
    px(g, FROG_PUPIL, ox + 9, 9, 2, 2);
    px(g, FROG_PUPIL, ox + 23, 9, 2, 2);
    // Mouth line
    px(g, FROG_DARK, ox + 10, 22, 12, 2);
    // Front legs
    px(g, FROG_DARK, ox + 4, 24, 4, 4);
    px(g, FROG_DARK, ox + 24, 24, 4, 4);
    // Feet
    px(g, FROG_DARK, ox + 2, 27, 6, 3);
    px(g, FROG_DARK, ox + 24, 27, 6, 3);
    // Back legs (tucked)
    px(g, FROG_GREEN, ox + 0, 20, 5, 6);
    px(g, FROG_GREEN, ox + 27, 20, 5, 6);
    px(g, FROG_DARK, ox + 0, 25, 4, 3);
    px(g, FROG_DARK, ox + 28, 25, 4, 3);
    // Nostrils
    px(g, FROG_DARK, ox + 12, 16, 2, 1);
    px(g, FROG_DARK, ox + 18, 16, 2, 1);
  }

  // Frame 1: attack (mouth open, tongue visible)
  {
    const ox = fw;
    // Body
    px(g, FROG_GREEN, ox + 4, 12, 24, 14);
    px(g, FROG_GREEN, ox + 2, 14, 28, 10);
    px(g, FROG_GREEN, ox + 6, 10, 20, 4);
    // Belly
    px(g, FROG_BELLY, ox + 8, 18, 16, 6);
    // Head bumps
    px(g, FROG_GREEN, ox + 6, 8, 6, 4);
    px(g, FROG_GREEN, ox + 20, 8, 6, 4);
    // Eyes (angry -- slightly narrowed)
    px(g, FROG_EYE_BG, ox + 7, 9, 4, 3);
    px(g, FROG_EYE_BG, ox + 21, 9, 4, 3);
    px(g, FROG_PUPIL, ox + 9, 9, 2, 2);
    px(g, FROG_PUPIL, ox + 23, 9, 2, 2);
    // Brow (angry)
    px(g, FROG_DARK, ox + 7, 8, 4, 1);
    px(g, FROG_DARK, ox + 21, 8, 4, 1);
    // Wide open mouth
    px(g, FROG_MOUTH, ox + 8, 20, 16, 6);
    px(g, 0x4a1a1a, ox + 10, 21, 12, 4); // mouth interior
    // Tongue
    px(g, TONGUE_RED, ox + 13, 22, 6, 2);
    px(g, TONGUE_RED, ox + 12, 24, 2, 3);
    px(g, TONGUE_RED, ox + 11, 26, 2, 4);
    // Tip of tongue curling
    px(g, TONGUE_RED, ox + 10, 29, 3, 2);
    // Legs
    px(g, FROG_DARK, ox + 4, 24, 4, 4);
    px(g, FROG_DARK, ox + 24, 24, 4, 4);
    px(g, FROG_DARK, ox + 2, 27, 6, 3);
    px(g, FROG_DARK, ox + 24, 27, 6, 3);
    px(g, FROG_GREEN, ox + 0, 20, 5, 6);
    px(g, FROG_GREEN, ox + 27, 20, 5, 6);
    px(g, FROG_DARK, ox + 0, 25, 4, 3);
    px(g, FROG_DARK, ox + 28, 25, 4, 3);
    // Nostrils
    px(g, FROG_DARK, ox + 12, 16, 2, 1);
    px(g, FROG_DARK, ox + 18, 16, 2, 1);
  }

  // Frame 2: hop (legs extended, body raised)
  {
    const ox = fw * 2;
    // Body raised higher
    px(g, FROG_GREEN, ox + 6, 6, 20, 12);
    px(g, FROG_GREEN, ox + 4, 8, 24, 8);
    // Belly
    px(g, FROG_BELLY, ox + 8, 10, 16, 6);
    px(g, FROG_BELLY, ox + 10, 8, 12, 3);
    // Head bumps
    px(g, FROG_GREEN, ox + 6, 2, 6, 6);
    px(g, FROG_GREEN, ox + 20, 2, 6, 6);
    // Eyes
    px(g, FROG_EYE_BG, ox + 7, 2, 4, 4);
    px(g, FROG_EYE_BG, ox + 21, 2, 4, 4);
    px(g, FROG_PUPIL, ox + 9, 3, 2, 2);
    px(g, FROG_PUPIL, ox + 23, 3, 2, 2);
    // Mouth
    px(g, FROG_DARK, ox + 10, 14, 12, 2);
    // Back legs extended downward
    px(g, FROG_GREEN, ox + 0, 14, 6, 6);
    px(g, FROG_GREEN, ox + 26, 14, 6, 6);
    px(g, FROG_DARK, ox + 0, 18, 6, 4);
    px(g, FROG_DARK, ox + 26, 18, 6, 4);
    // Back feet (spread)
    px(g, FROG_DARK, ox + 0, 22, 4, 4);
    px(g, FROG_DARK, ox + 28, 22, 4, 4);
    // Front legs (dangling)
    px(g, FROG_DARK, ox + 6, 18, 3, 8);
    px(g, FROG_DARK, ox + 23, 18, 3, 8);
    px(g, FROG_DARK, ox + 4, 24, 5, 3);
    px(g, FROG_DARK, ox + 23, 24, 5, 3);
    // Nostrils
    px(g, FROG_DARK, ox + 12, 10, 2, 1);
    px(g, FROG_DARK, ox + 18, 10, 2, 1);
  }

  // Frame 3: hurt (flash/recoil)
  {
    const ox = fw * 3;
    // Body compressed and tilted
    px(g, FROG_GREEN, ox + 5, 14, 22, 12);
    px(g, FROG_GREEN, ox + 3, 16, 26, 8);
    // Flash patches
    px(g, HURT_FLASH, ox + 8, 16, 4, 4);
    px(g, HURT_FLASH, ox + 18, 18, 4, 3);
    px(g, HURT_FLASH, ox + 12, 14, 6, 2);
    // Belly
    px(g, FROG_BELLY, ox + 9, 20, 14, 4);
    // Head
    px(g, FROG_GREEN, ox + 5, 10, 22, 6);
    px(g, HURT_FLASH, ox + 10, 10, 4, 2);
    // Head bumps
    px(g, FROG_GREEN, ox + 6, 8, 6, 4);
    px(g, FROG_GREEN, ox + 20, 8, 6, 4);
    // Eyes (squinting in pain)
    px(g, FROG_EYE_BG, ox + 7, 9, 4, 2);
    px(g, FROG_EYE_BG, ox + 21, 9, 4, 2);
    px(g, FROG_PUPIL, ox + 8, 9, 3, 1);
    px(g, FROG_PUPIL, ox + 22, 9, 3, 1);
    // Mouth (grimace)
    px(g, FROG_DARK, ox + 10, 24, 12, 1);
    px(g, FROG_DARK, ox + 9, 23, 2, 1);
    px(g, FROG_DARK, ox + 21, 23, 2, 1);
    // Legs splayed
    px(g, FROG_DARK, ox + 2, 24, 5, 4);
    px(g, FROG_DARK, ox + 25, 24, 5, 4);
    px(g, FROG_DARK, ox + 0, 27, 6, 3);
    px(g, FROG_DARK, ox + 26, 27, 6, 3);
  }

  const tempKey = '_grenouille_strip';
  g.generateTexture(tempKey, totalWidth, fw);
  g.destroy();

  const src = scene.textures.get(tempKey).getSourceImage();
  scene.textures.addSpriteSheet(sheetKey, src as HTMLImageElement, {
    frameWidth: fw,
    frameHeight: fw,
  });
  scene.textures.remove(tempKey);

  // Register animations
  scene.anims.create({
    key: 'grenouille_idle',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [0] }),
    frameRate: 1,
    repeat: -1,
  });
  scene.anims.create({
    key: 'grenouille_attack',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [1] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'grenouille_hop',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [2] }),
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: 'grenouille_hurt',
    frames: scene.anims.generateFrameNumbers(sheetKey, { frames: [3] }),
    frameRate: 1,
    repeat: 0,
  });
}
