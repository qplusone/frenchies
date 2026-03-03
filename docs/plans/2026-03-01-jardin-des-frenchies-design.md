# Jardin des Frenchies — Technical Design Document

**Date:** 2026-03-01
**Status:** Approved
**Target:** March 11, 2026 (birthday gift for Rachel)

## Context

Jardin des Frenchies is a browser-based 8-bit platformer inspired by Kirby's Dream Land, set in Monet's Water Lilies gardens. Players guide two French Bulldogs (Poppleton and Zacko) through 4 worlds / 16 stages, collecting pastries, defeating fog creatures, and restoring color. It's a birthday gift — tone is lighthearted, accessible, and celebratory.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Phaser 3 | Best HTML5 platformer support, tilemap integration, mature ecosystem |
| Language | TypeScript | Type safety, better IDE support, Phaser has excellent TS typings |
| Build Tool | Vite | Fast HMR, native TS, simple Phaser config |
| Level Editor | Tiled → JSON | Industry standard, visual editing, Phaser has native Tiled support |
| Architecture | Scene-Per-Level | Maps cleanly to game structure, natural Phaser pattern |
| Art Pipeline | AI-generated + cleanup | Fastest path to full asset coverage for 4 worlds |
| Music | Tone.js chiptune | Programmatic generation, no external audio files, French classical arrangements |
| SFX | jsfxr-style synthesis | Procedural retro sound effects |
| Physics | Phaser Arcade | Sufficient for 8-bit platformer, no need for Matter.js |
| Save System | localStorage | Simple, no server needed, persists per browser |
| Deployment | Static site (Netlify/Vercel) | No backend required |

## Architecture

### Scene-Per-Level Pattern

Each game state is a Phaser Scene. The `GameManager` singleton holds persistent state across scene transitions.

```
Boot → Preloader → TitleScreen → CharacterSelect → WorldMap → GameScene/BossScene → (repeat) → Ending
                                                         ↕
                                                    PauseMenu (overlay)
```

### Project Structure

```
frenchies/
├── src/
│   ├── main.ts                 # Phaser config & boot
│   ├── config/
│   │   ├── GameConfig.ts       # Constants (256×224 native res, 60fps)
│   │   └── AssetManifest.ts    # Asset keys and paths
│   ├── scenes/
│   │   ├── Boot.ts             # Minimal preload, loading screen
│   │   ├── Preloader.ts        # Load all assets
│   │   ├── TitleScreen.ts      # Animated title
│   │   ├── CharacterSelect.ts  # Pick Poppleton or Zacko
│   │   ├── WorldMap.ts         # Garden map navigation
│   │   ├── GameScene.ts        # Base class for playable levels
│   │   ├── BossScene.ts        # Base class for boss fights
│   │   ├── Gallery.ts          # Unlockable art & music
│   │   ├── PauseMenu.ts        # Overlay scene (easel)
│   │   ├── Ending.ts           # Final cutscene + dedication
│   │   └── levels/             # 16 level/boss scene files
│   ├── entities/
│   │   ├── Player.ts           # Base player (movement, physics, animation)
│   │   ├── Poppleton.ts        # Butterfly Float + Pounce
│   │   ├── Zacko.ts            # Bat Dash + Bark
│   │   ├── enemies/            # One file per enemy type (7 types)
│   │   └── bosses/             # One file per boss (4 bosses)
│   ├── collectibles/
│   │   ├── Collectible.ts      # Base (auto-collect on overlap)
│   │   ├── Macaron.ts, Choquette.ts, Souffle.ts, WingPowerUp.ts
│   │   ├── PaintDrop.ts, BirthdayCandle.ts
│   ├── systems/
│   │   ├── GameManager.ts      # Singleton: state, character, unlocks
│   │   ├── AudioManager.ts     # Tone.js music + SFX
│   │   ├── SaveManager.ts      # localStorage persistence
│   │   ├── ParallaxManager.ts  # Multi-layer background scrolling
│   │   └── FogEffect.ts        # Grey fog / color restoration
│   ├── ui/
│   │   ├── HUD.ts              # Health, macarons, paint drops, candles
│   │   ├── DialogBox.ts        # Text/cutscene displays
│   │   └── WingTimer.ts        # Power-up timer bar
│   └── utils/
│       ├── TiledHelper.ts      # Tiled JSON map utilities
│       └── MathUtils.ts
├── assets/
│   ├── sprites/                # Character & enemy sprite sheets (PNG)
│   ├── tilesets/               # Tileset PNGs per world
│   ├── maps/                   # Tiled JSON level files
│   ├── backgrounds/            # Parallax layers per world
│   ├── ui/                     # HUD icons, menu assets
│   └── audio/                  # Cached audio if needed
├── public/index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
```

## Player System

Base `Player` class: movement, variable-height jump (hold for higher), gravity, health (3 HP), collision, sprite animation state machine (idle, run, jump, fall, attack, hurt, special).

### Poppleton
- **Butterfly Float:** Double jump + reduced gravity while space held. `gravityY` reduced to 25% during float.
- **Pounce:** Forward lunge (velocity burst), bounces off enemies (velocity reflection on hit).
- **Wing Power-Up:** Free flight, 8-directional, no gravity, 10s duration.

### Zacko
- **Bat Dash:** Horizontal velocity burst, `body.checkCollision.down = false` on thin platforms during dash frames.
- **Bark:** Spawns projectile sprite, travels ~4 tiles horizontally, despawns on hit or range.
- **Wing Power-Up:** Same as Poppleton but bat wing sprites.

## Level System (Tiled Integration)

Each level's Tiled JSON defines:
- **Tile layers:** ground, platforms, decoration, foreground
- **Object layers:** player_spawn, enemies (type + properties), collectibles (type), checkpoints, triggers (easter eggs, scripted events)
- **Custom properties:** parallax config, world palette, music key, fog settings

`GameScene` base class parses all of this generically. Level subclasses only override for unique mechanics (e.g., World 1-3 underwater inversion, World 3-2 palette shift timer).

## Enemy System

Base `Enemy` class: health, speed, patrol behavior, damage, defeat animation. Enemy types:

| Enemy | Movement | Notes |
|-------|----------|-------|
| Brouillard Blob | Horizontal patrol (tween) | 1 HP, all worlds |
| Pluie Sprite | Gravity fall, respawn timer | 1 HP, worlds 1-2 |
| Feuille Flotter | Sine wave path | 1 HP, worlds 1, 3 |
| Papillon Gris | Bezier curve swoops | 1 HP, worlds 2-3 |
| Pierre Roulante | Roll along terrain, edge detect | 2 HP, worlds 3-4 |
| Toile d'Araignée | Static slow zone | Destructible hazard, worlds 3-4 |
| Nuage Noir | Stationary, timed lightning | 2 HP, world 4 |

## Boss System

`BossScene` base: health bar UI, phase tracking (phases trigger at HP thresholds), arena camera lock, victory sequence (color restoration animation + fanfare).

### Boss Specs
- **Le Grand Grenouille (W1):** 3 phases. Wave attacks (sine sprites), fog bubbles (slow homing). Vulnerable when mouth opens post-attack. Sinking lily pad platforms.
- **Monsieur Escargot (W2):** Shell roll (dodge by jump). Head poke = attack window. Speed increases per phase. Monet swirl shell.
- **Le Cygne Gris (W3):** Mirror clones (2→3). Real swan has subtle brightness tell. Clones shatter on hit. Dive attack between phases.
- **La Brume (W4):** Expanding fog entity. Phase 1: small, simple projectiles. Phase 2: half-screen. Phase 3: most of screen with safe-zone platforms. Color restores per defeated phase.

## Visual Effects

1. **Parallax:** 3-4 layers per level, different scroll rates. `ParallaxManager` positions layers relative to camera.
2. **Dithering Shader:** Ordered-dither fragment shader on background layers only. Creates painterly brushstroke illusion.
3. **Color Restoration:** Worlds start with greyscale tint on tile layers. Boss defeat triggers `tween` from grey to full color.
4. **Water Reflections (W1):** Reflection layer mirrors sprites below water line, reduced alpha, sine wave displacement shader.
5. **Particles:** Phaser particle emitters per world (petals, fog wisps, light motes, bubbles).
6. **Fog Mechanic (2-3):** Dark overlay with circular BitmapMask around player. Collectibles expand radius.

## Audio System

### Music (Tone.js)
Chiptune arrangements using square/triangle/noise wave synths (NES-style 4-channel):
- **W1:** Debussy — Arabesque No. 1 (flowing arpeggios)
- **W2:** Satie — Gymnopédie No. 1 (slow, contemplative)
- **W3:** Debussy — Clair de Lune (mysterious, mirrored motifs)
- **W4:** Ravel — Pavane pour une infante défunte (triumphant)
- **Bosses:** Original compositions, faster tempo, incorporating world motifs
- **Title:** Gentle medley of all themes

Crossfade transitions between tracks. AudioContext resumed on title screen interaction.

### SFX (jsfxr-style)
Procedurally generated: jump, land, collect, damage, defeat, checkpoint, UI sounds.

## UI Design

- **HUD:** Top-left: 3 Frenchie face HP icons + macaron count. Top-right: paint drops + candle count (hidden until first candle). Wing timer bar below HP when active.
- **Title Screen:** Parallax pond, sleeping Poppleton/Zacko, pixel font title, menu options.
- **World Map:** Top-down garden, 4 nodes, color = completion, character waddles between nodes.
- **Pause Menu:** Easel-styled overlay. Peinture Mode toggle with paint palette icon.
- **Gallery:** Grid of unlockable pixel art Monet recreations + music player. Paint drops as currency.

## Easter Eggs

1. **11 Birthday Candles:** One hidden per non-boss level. All 11 unlock secret Level 4-3.
2. **Clock Tower (W2):** Background shows 3:11. Press Up beneath it → confetti + "Joyeux Anniversaire!" banner.
3. **Birthday Soufflé (W4):** Oversized soufflé with candle. Triggers both dogs in party hats animation.
4. **Ending Dedication:** Both dogs at sunset. "For Rachel — Happy Birthday! With love from Poppleton, Zacko, Andy, Charlie, and Matt."
5. **Rachel's Pâtisserie:** Checkpoint in W3 named "Rachel's Pâtisserie" with birthday banner.

## Accessibility

- **Peinture Mode:** Toggle from pause menu. Sets player to invincible. Allows enjoying environments without challenge.
- **Generous Checkpoints:** One per screen transition or significant section.
- **No Lives System:** Infinite retries from last checkpoint.
- **Forgiving Pits:** Shallow water returns player to ledge with 1 HP damage, not instant death.
- **Clear Boss Tells:** Visual indicators before attacks, generous dodge windows.
