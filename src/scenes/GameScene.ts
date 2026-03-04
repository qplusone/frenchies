import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, SOUFFLE_INVINCIBILITY_MS } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { Poppleton } from '../entities/Poppleton';
import { Zacko } from '../entities/Zacko';
import { ParallaxManager } from '../systems/ParallaxManager';
import { GameManager } from '../systems/GameManager';
import { FogEffect } from '../systems/FogEffect';
import { WorldParticles } from '../systems/WorldParticles';
import { createEnemy } from '../entities/enemies/EnemyFactory';
import { Enemy } from '../entities/enemies/Enemy';
import { ToileDaraignee } from '../entities/enemies/ToileDaraignee';
import { HUD } from '../ui/HUD';
import { AudioManager } from '../systems/AudioManager';
import { NuageNoir } from '../entities/enemies/NuageNoir';
import { TouchControls } from '../systems/TouchControls';
import {
  parseSpawnPoints,
  parseEnemies,
  parseCollectibles,
  parseCheckpoints,
  parseTriggers,
  type EnemySpawn,
  type CollectibleSpawn,
  type CheckpointData,
  type TriggerData,
} from '../utils/TiledHelper';

export interface GameSceneConfig {
  mapKey?: string;
  tilesetKey?: string;
  tilesetImage?: string;
  character?: string;
  worldNum?: number;
  levelNum?: number;
  levelWidth?: number;   // In tiles, for programmatic levels (default: 64)
  levelHeight?: number;  // In tiles (default: GAME_HEIGHT / TILE_SIZE)
  backgroundLayers?: Array<{
    key: string;
    scrollX: number;
    scrollY?: number;
    y?: number;
  }>;
}

export class GameScene extends Phaser.Scene {
  protected player!: Player;
  protected map!: Phaser.Tilemaps.Tilemap;
  protected groundLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  protected platformLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  protected decorationLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  protected foregroundLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  protected parallax!: ParallaxManager;
  protected enemySpawns: EnemySpawn[] = [];
  protected collectibleSpawns: CollectibleSpawn[] = [];
  protected checkpoints: CheckpointData[] = [];
  protected triggers: TriggerData[] = [];
  protected currentCheckpoint: CheckpointData | null = null;
  protected enemies: Phaser.Physics.Arcade.Group | null = null;
  protected collectibles: Phaser.Physics.Arcade.StaticGroup | null = null;
  protected fogEffect!: FogEffect;
  protected worldParticles!: WorldParticles;

  // Programmatic level support
  protected groundGroup: Phaser.Physics.Arcade.StaticGroup | null = null;
  protected platformGroup: Phaser.Physics.Arcade.StaticGroup | null = null;
  protected spawnPoint: { x: number; y: number } = { x: 40, y: GAME_HEIGHT - 48 };
  protected mapWidthPx: number = GAME_WIDTH;
  protected mapHeightPx: number = GAME_HEIGHT;

  protected sceneConfig!: GameSceneConfig;

  constructor(key: string, config?: GameSceneConfig) {
    super(key);
    if (config) {
      this.sceneConfig = config;
    }
  }

  init(data: { character?: string }): void {
    if (data.character) {
      this.sceneConfig = { ...this.sceneConfig, character: data.character };
    }
  }

  create(): void {
    // Set up parallax backgrounds
    this.parallax = new ParallaxManager(this);
    this.setupBackgrounds();

    if (this.sceneConfig.mapKey) {
      // === Tiled map path ===
      this.createTiledLevel();
    } else {
      // === Programmatic level path ===
      this.createProceduralLevel();
    }

    // Create player at spawn point
    const characterName = this.sceneConfig.character || 'poppleton';
    if (characterName === 'zacko') {
      this.player = new Zacko(this, this.spawnPoint.x, this.spawnPoint.y);
    } else {
      this.player = new Poppleton(this, this.spawnPoint.x, this.spawnPoint.y);
    }

    // Player collision with terrain
    if (this.groundLayer) {
      this.physics.add.collider(this.player, this.groundLayer);
    }
    if (this.platformLayer) {
      this.physics.add.collider(this.player, this.platformLayer);
    }
    if (this.groundGroup) {
      this.physics.add.collider(this.player, this.groundGroup);
    }
    if (this.platformGroup) {
      this.physics.add.collider(this.player, this.platformGroup);
    }

    // Camera
    this.cameras.main.setBounds(0, 0, this.mapWidthPx, this.mapHeightPx);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, this.mapWidthPx, this.mapHeightPx);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Spawn game objects
    this.spawnCollectibles();
    this.spawnEnemies();
    this.setupCheckpoints();
    this.setupTriggers();

    // Peinture Mode — set player invincibility
    this.player.isPeintureMode = GameManager.instance.peintureMode;

    // Player death handler
    this.events.on('player-died', () => {
      this.respawnPlayer();
    });

    // Reset level collectible count
    GameManager.instance.resetLevelCollectibles();

    // Launch HUD overlay
    this.scene.launch('HUD');

    // Fade-in transition when entering the level
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Visual effects
    this.fogEffect = new FogEffect(this);
    this.worldParticles = new WorldParticles(this);

    // Apply fog to non-completed worlds
    const worldNum = this.sceneConfig.worldNum ?? 1;
    const gm = GameManager.instance;
    if (!gm.isWorldCompleted(worldNum)) {
      const layers = [this.groundLayer, this.platformLayer, this.decorationLayer].filter(
        (l): l is Phaser.Tilemaps.TilemapLayer => l != null,
      );
      if (layers.length > 0) {
        this.fogEffect.applyFog(layers);
      }
    }

    // World-specific ambient particles
    this.worldParticles.createForWorld(worldNum);

    // Start world music
    const audio = AudioManager.getInstance();
    audio.playMusic(`world${worldNum}`);

    // Pause input
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const pKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    escKey.on('down', () => this.openPauseMenu());
    pKey.on('down', () => this.openPauseMenu());

    // Mobile touch controls
    TouchControls.getInstance().create(this);
  }

  update(time: number, delta: number): void {
    this.player.update(time, delta);
    this.parallax.update();
    this.worldParticles.update();
    TouchControls.getInstance().resetJustPressed();

    // Update HUD
    const hudScene = this.scene.get('HUD') as HUD;
    if (hudScene?.updateHUD) {
      hudScene.updateHUD(this.player);
    }
  }

  private openPauseMenu(): void {
    AudioManager.getInstance().playSFX('pause');
    this.scene.pause();
    this.scene.launch('PauseMenu', { callingScene: this.scene.key });
  }

  protected setupBackgrounds(): void {
    if (!this.sceneConfig.backgroundLayers) return;
    for (const bg of this.sceneConfig.backgroundLayers) {
      this.parallax.addLayer(bg.key, bg.scrollX, bg.scrollY || 0, bg.y || 0);
    }
  }

  private createTiledLevel(): void {
    this.map = this.make.tilemap({ key: this.sceneConfig.mapKey! });
    const tileset = this.map.addTilesetImage(
      this.sceneConfig.tilesetKey!,
      this.sceneConfig.tilesetImage!,
      TILE_SIZE,
      TILE_SIZE
    );

    if (!tileset) {
      console.error(`Failed to load tileset: ${this.sceneConfig.tilesetKey}`);
      return;
    }

    this.groundLayer = this.createTileLayer('ground', tileset, 0);
    this.platformLayer = this.createTileLayerOptional('platforms', tileset, 1);
    this.decorationLayer = this.createTileLayerOptional('decoration', tileset, -1);
    this.foregroundLayer = this.createTileLayerOptional('foreground', tileset, 10);

    if (this.groundLayer) {
      this.groundLayer.setCollisionByExclusion([-1]);
    }
    if (this.platformLayer) {
      this.platformLayer.setCollisionByExclusion([-1]);
    }

    this.enemySpawns = parseEnemies(this.map);
    this.collectibleSpawns = parseCollectibles(this.map);
    this.checkpoints = parseCheckpoints(this.map);
    this.triggers = parseTriggers(this.map);

    const spawnPoints = parseSpawnPoints(this.map);
    const spawn = spawnPoints[0] || { x: 40, y: GAME_HEIGHT - 48 };
    this.spawnPoint = spawn;

    this.mapWidthPx = this.map.widthInPixels;
    this.mapHeightPx = this.map.heightInPixels;
  }

  private createProceduralLevel(): void {
    const levelW = this.sceneConfig.levelWidth ?? 64;
    const levelH = this.sceneConfig.levelHeight ?? Math.floor(GAME_HEIGHT / TILE_SIZE);
    this.mapWidthPx = levelW * TILE_SIZE;
    this.mapHeightPx = levelH * TILE_SIZE;

    this.groundGroup = this.physics.add.staticGroup();
    this.platformGroup = this.physics.add.staticGroup();

    // Let subclass populate terrain, spawns, enemies, collectibles, etc.
    this.buildLevel();
  }

  /** Override in subclass to build level terrain and place objects programmatically. */
  protected buildLevel(): void {
    // Default: flat ground
    this.addGroundRow(0, GAME_HEIGHT - TILE_SIZE, this.sceneConfig.levelWidth ?? 64);
  }

  // --- Programmatic level helpers ---

  /** Resolve the ground tile texture key for the current world. */
  private getGroundTileKey(): string {
    const worldNum = this.sceneConfig.worldNum ?? 1;
    const key = `tileset_world${worldNum}`;
    return this.textures.exists(key) ? key : 'ground_tile';
  }

  /** Resolve the platform tile texture key for the current world. */
  private getPlatformTileKey(): string {
    const worldNum = this.sceneConfig.worldNum ?? 1;
    const key = `platform_world${worldNum}`;
    return this.textures.exists(key) ? key : 'platform_tile';
  }

  /** Add a row of ground tiles starting at pixel position (x, y), spanning `widthInTiles` tiles. */
  protected addGroundRow(x: number, y: number, widthInTiles: number): void {
    if (!this.groundGroup) return;
    const tileKey = this.getGroundTileKey();
    for (let i = 0; i < widthInTiles; i++) {
      this.groundGroup
        .create(x + i * TILE_SIZE + TILE_SIZE / 2, y + TILE_SIZE / 2, tileKey)
        .refreshBody();
    }
  }

  /** Add a filled ground block from (x, y) spanning widthInTiles x heightInTiles. */
  protected addGroundBlock(x: number, y: number, widthInTiles: number, heightInTiles: number): void {
    if (!this.groundGroup) return;
    const tileKey = this.getGroundTileKey();
    for (let row = 0; row < heightInTiles; row++) {
      for (let col = 0; col < widthInTiles; col++) {
        this.groundGroup
          .create(
            x + col * TILE_SIZE + TILE_SIZE / 2,
            y + row * TILE_SIZE + TILE_SIZE / 2,
            tileKey,
          )
          .refreshBody();
      }
    }
  }

  /** Add a platform (one-way or solid) at pixel position (x, y). */
  protected addPlatform(x: number, y: number, widthInTiles: number): void {
    if (!this.platformGroup) return;
    const tileKey = this.getPlatformTileKey();
    for (let i = 0; i < widthInTiles; i++) {
      this.platformGroup
        .create(x + i * TILE_SIZE + TILE_SIZE / 2, y + TILE_SIZE / 2, tileKey)
        .refreshBody();
    }
  }

  /** Add an enemy spawn at pixel position. */
  protected addEnemy(type: string, x: number, y: number, properties: Record<string, unknown> = {}): void {
    this.enemySpawns.push({ type, x, y, properties });
  }

  /** Add a collectible spawn at pixel position. */
  protected addCollectible(type: string, x: number, y: number, properties: Record<string, unknown> = {}): void {
    this.collectibleSpawns.push({ type, x, y, properties });
  }

  /** Add a checkpoint at pixel position. */
  protected addCheckpoint(x: number, y: number, id?: string): void {
    this.checkpoints.push({ id: id || `cp_${this.checkpoints.length}`, x, y });
  }

  /** Add a trigger zone at pixel position. */
  protected addTrigger(name: string, x: number, y: number, width: number, height: number, properties: Record<string, unknown> = {}): void {
    this.triggers.push({ name, x, y, width, height, properties });
  }

  /** Set the player spawn point. */
  protected setSpawnPoint(x: number, y: number): void {
    this.spawnPoint = { x, y };
  }

  /** Add a level-end trigger zone at the right side of the level. */
  protected addLevelEnd(x: number, y: number = 0, height: number = GAME_HEIGHT): void {
    this.addTrigger('level_end', x, y, TILE_SIZE * 2, height);
  }

  private createTileLayer(
    name: string,
    tileset: Phaser.Tilemaps.Tileset,
    depth: number,
  ): Phaser.Tilemaps.TilemapLayer {
    const layer = this.map.createLayer(name, tileset, 0, 0);
    if (!layer) {
      throw new Error(`Required tile layer "${name}" not found in map ${this.sceneConfig.mapKey}`);
    }
    layer.setDepth(depth);
    return layer;
  }

  private createTileLayerOptional(
    name: string,
    tileset: Phaser.Tilemaps.Tileset,
    depth: number,
  ): Phaser.Tilemaps.TilemapLayer | null {
    const layer = this.map.createLayer(name, tileset, 0, 0);
    if (layer) {
      layer.setDepth(depth);
    }
    return layer;
  }

  protected spawnCollectibles(): void {
    this.collectibles = this.physics.add.staticGroup();

    for (const spawn of this.collectibleSpawns) {
      const textureKey = this.getCollectibleTexture(spawn.type);
      const collectible = this.collectibles.create(spawn.x, spawn.y, textureKey);
      collectible.setData('type', spawn.type);
      collectible.setData('properties', spawn.properties);
      collectible.setData('baseY', spawn.y);

      // Gentle floating bob animation
      this.tweens.add({
        targets: collectible,
        y: spawn.y - 3,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 600,
      });
    }

    this.physics.add.overlap(this.player, this.collectibles, (_player, collectible) => {
      const sprite = collectible as Phaser.Physics.Arcade.Sprite;
      const type = sprite.getData('type') as string;
      this.handleCollectible(type, sprite);
      sprite.destroy();
    });
  }

  protected getCollectibleTexture(type: string): string {
    const textureMap: Record<string, string> = {
      macaron: 'macaron',
      choquette: 'choquette',
      souffle: 'souffle',
      wing_powerup: 'wing_powerup',
      paint_drop: 'paint_drop',
      birthday_candle: 'birthday_candle',
    };
    return textureMap[type] || 'macaron';
  }

  protected handleCollectible(type: string, sprite: Phaser.Physics.Arcade.Sprite): void {
    const gm = GameManager.instance;
    switch (type) {
      case 'macaron':
        gm.collectMacaron();
        AudioManager.getInstance().playSFX('collect');
        break;
      case 'choquette':
        this.player.heal(1);
        AudioManager.getInstance().playSFX('collect');
        break;
      case 'souffle':
        this.player.isInvincible = true;
        this.player.setTint(0xffdd44);
        AudioManager.getInstance().playSFX('collectRare');
        this.time.delayedCall(SOUFFLE_INVINCIBILITY_MS, () => {
          if (this.player.active) {
            this.player.isInvincible = false;
            this.player.clearTint();
          }
        });
        break;
      case 'wing_powerup':
        this.player.activateWings();
        AudioManager.getInstance().playSFX('wingActivate');
        break;
      case 'paint_drop':
        gm.collectPaintDrop();
        AudioManager.getInstance().playSFX('collectRare');
        break;
      case 'birthday_candle': {
        const candleIndex = (sprite.getData('properties') as Record<string, unknown>)?.candleIndex as number || 0;
        gm.collectCandle(candleIndex);
        AudioManager.getInstance().playSFX('collectRare');
        // Float-up notification
        const text = this.add.text(sprite.x, sprite.y - 16, `Candle ${gm.candleCount}/${11}!`, {
          fontSize: '7px',
          color: '#ffdd44',
          fontFamily: 'monospace',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
          targets: text,
          y: text.y - 20,
          alpha: 0,
          duration: 1000,
          onComplete: () => text.destroy(),
        });
        break;
      }
    }
  }

  protected spawnEnemies(): void {
    this.enemies = this.physics.add.group({ runChildUpdate: true });

    for (const spawn of this.enemySpawns) {
      const enemy = createEnemy(this, spawn.type, spawn.x, spawn.y);
      this.enemies.add(enemy);
      enemy.initBehavior(spawn.properties);

      // Web enemies apply slow effect instead of damage
      if (enemy instanceof ToileDaraignee) {
        this.physics.add.overlap(this.player, enemy, () => {
          (enemy as ToileDaraignee).applySlowEffect(this.player);
        });
      }

      // Storm cloud lightning collisions
      if (enemy instanceof NuageNoir) {
        const lightningGroup = (enemy as NuageNoir).getLightningGroup();
        if (lightningGroup) {
          this.physics.add.overlap(this.player, lightningGroup, () => {
            this.player.takeDamage();
          });
        }
      }
    }

    // Player-enemy collision (stomp or take damage)
    this.physics.add.overlap(this.player, this.enemies, (_player, enemyObj) => {
      const enemy = enemyObj as Enemy;
      if (!enemy.active) return;
      if (enemy instanceof ToileDaraignee) return; // handled separately

      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      if (playerBody.velocity.y > 0 && this.player.y < enemy.y - 8) {
        enemy.takeDamage();
        AudioManager.getInstance().playSFX('defeat');
        playerBody.setVelocityY(-200);
      } else {
        this.player.takeDamage();
      }
    });

    // Attack handling
    this.events.on('player-attack', (hitbox: Phaser.GameObjects.Zone | Phaser.Physics.Arcade.Sprite, type: string) => {
      if (!this.enemies) return;
      this.physics.add.overlap(hitbox, this.enemies, (_h, enemyObj) => {
        const enemy = enemyObj as Enemy;
        if (enemy.active) {
          enemy.takeDamage();
          AudioManager.getInstance().playSFX('defeat');
          if (type === 'pounce' && this.player instanceof Poppleton) {
            this.player.bounceOffEnemy();
          }
        }
      });
    });
  }

  protected setupCheckpoints(): void {
    const checkpointGroup = this.physics.add.staticGroup();

    for (const cp of this.checkpoints) {
      const sprite = checkpointGroup.create(cp.x, cp.y, 'checkpoint');
      sprite.setData('checkpointData', cp);
    }

    this.physics.add.overlap(this.player, checkpointGroup, (_player, checkpoint) => {
      const cpData = (checkpoint as Phaser.Physics.Arcade.Sprite).getData('checkpointData') as CheckpointData;
      this.currentCheckpoint = cpData;
      AudioManager.getInstance().playSFX('checkpoint');
    });
  }

  protected setupTriggers(): void {
    for (const trigger of this.triggers) {
      const zone = this.add.zone(trigger.x, trigger.y, trigger.width, trigger.height);
      zone.setOrigin(0, 0);
      this.physics.add.existing(zone, true);

      this.physics.add.overlap(this.player, zone, () => {
        this.handleTrigger(trigger);
      });
    }
  }

  protected handleTrigger(trigger: TriggerData): void {
    if (trigger.name === 'level_end') {
      this.completeAndExit();
      return;
    }
    // Override in subclasses for level-specific triggers
    console.log(`Trigger: ${trigger.name}`, trigger.properties);
  }

  protected completeAndExit(): void {
    const worldNum = this.sceneConfig.worldNum ?? 1;
    const levelNum = this.sceneConfig.levelNum ?? 1;
    const gm = GameManager.instance;
    gm.completeLevel(worldNum, levelNum, gm.macarons);
    AudioManager.getInstance().playSFX('checkpoint');

    // Brief victory flash
    this.cameras.main.flash(500, 255, 255, 255);

    // "Level Complete!" text overlay (fixed to camera)
    const camCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const camCenterY = this.cameras.main.scrollY + this.cameras.main.height / 2;
    const completeText = this.add.text(camCenterX, camCenterY, 'Level Complete!', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200).setAlpha(0);

    // Pop-in animation for the text
    this.tweens.add({
      targets: completeText,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      yoyo: false,
    });

    // Fade-out transition then return to world map
    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
    });
    this.time.delayedCall(1600, () => {
      this.scene.stop('HUD');
      this.scene.start('WorldMap');
    });
  }

  protected respawnPlayer(): void {
    let spawn: { x: number; y: number };
    if (this.currentCheckpoint) {
      spawn = { x: this.currentCheckpoint.x, y: this.currentCheckpoint.y };
    } else if (this.map) {
      const spawnPoints = parseSpawnPoints(this.map);
      spawn = spawnPoints[0] || this.spawnPoint;
    } else {
      spawn = this.spawnPoint;
    }

    this.player.setPosition(spawn.x, spawn.y);
    this.player.hp = this.player.maxHp;
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }
}
