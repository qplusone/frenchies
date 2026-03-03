// Native resolution (NES-style)
export const GAME_WIDTH = 256;
export const GAME_HEIGHT = 224;

// Physics
export const GRAVITY = 800;
export const PLAYER_SPEED = 100;
export const PLAYER_JUMP_VELOCITY = -250;
export const PLAYER_JUMP_HOLD_GRAVITY = 400; // reduced gravity while holding jump
export const PLAYER_MAX_HP = 3;

// Poppleton
export const FLUTTER_GRAVITY = 200; // 25% of normal gravity
export const POUNCE_VELOCITY = 200;
export const POUNCE_BOUNCE_VELOCITY = -200;

// Zacko
export const DASH_VELOCITY = 250;
export const DASH_DURATION = 200; // ms
export const BARK_SPEED = 200;
export const BARK_RANGE = 64; // pixels (4 tiles)
export const BARK_LIFESPAN = 500; // ms

// Wing power-up
export const WING_DURATION = 10000; // 10 seconds
export const WING_FLY_SPEED = 120;

// Invincibility
export const DAMAGE_INVINCIBILITY_MS = 1500;
export const SOUFFLE_INVINCIBILITY_MS = 8000;

// Collectibles
export const MACARONS_PER_BONUS = 100;
export const TOTAL_BIRTHDAY_CANDLES = 11;

// Boss system
export const BOSS_HP = {
  GRENOUILLE: 12,
  ESCARGOT: 9,
  CYGNE: 10,
  BRUME: 15,
};

export const BOSS_PHASE_THRESHOLDS = {
  GRENOUILLE: [1.0, 0.66, 0.33], // phases trigger at these HP fractions
  ESCARGOT: [1.0, 0.66, 0.33],
  CYGNE: [1.0, 0.5],
  BRUME: [1.0, 0.66, 0.33],
};

// Tile size
export const TILE_SIZE = 16;

// Colors (Monet palette)
export const PALETTE = {
  // World 1 — Water Lilies
  waterBlue: 0x6b9dab,
  lilyPink: 0xe8b4b8,
  willowGreen: 0x7a9e7e,
  pondTeal: 0x4a8c8c,

  // World 2 — Morning Light
  sunAmber: 0xd4a057,
  peach: 0xe8c4a0,
  softGold: 0xdec87a,
  lavender: 0xb8a9c9,

  // World 3 — Reflections
  deepPurple: 0x5c4a72,
  midnightBlue: 0x2e3a5c,
  silver: 0xc0c0c0,
  emerald: 0x3a7a5c,

  // World 4 — Restored Garden
  vividGreen: 0x4caf50,
  richRose: 0xc94c6e,
  brightBlue: 0x4285f4,
  warmYellow: 0xf5c542,

  // UI
  fog: 0x888888,
  hurtRed: 0xff4444,
  uiBackground: 0x1a1a2e,
} as const;
