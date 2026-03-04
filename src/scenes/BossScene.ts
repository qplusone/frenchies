import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, PALETTE, SOUFFLE_INVINCIBILITY_MS } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { Poppleton } from '../entities/Poppleton';
import { Zacko } from '../entities/Zacko';
import { GameManager } from '../systems/GameManager';
import { AudioManager } from '../systems/AudioManager';
import { HUD } from '../ui/HUD';
import type { Boss } from '../entities/bosses/Boss';

export interface BossSceneConfig {
  bossType: string;
  worldNum: number;
  arenaWidth: number;
  arenaHeight: number;
  character?: string;
  groundY?: number;
}

export class BossScene extends Phaser.Scene {
  protected player!: Player;
  protected boss!: Boss;
  protected sceneConfig!: BossSceneConfig;

  // Boss health bar UI
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarFill!: Phaser.GameObjects.Graphics;
  private bossNameText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;

  // Arena
  protected groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  protected platforms!: Phaser.Physics.Arcade.StaticGroup;

  // State
  private bossDefeated: boolean = false;
  private victorySequenceStarted: boolean = false;

  constructor(key: string, config?: BossSceneConfig) {
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
    const { arenaWidth, arenaHeight } = this.sceneConfig;
    const groundY = this.sceneConfig.groundY ?? (arenaHeight - 16);

    // Lock camera to arena
    this.cameras.main.setBounds(0, 0, arenaWidth, arenaHeight);
    this.physics.world.setBounds(0, 0, arenaWidth, arenaHeight);

    // Create arena ground
    this.groundGroup = this.physics.add.staticGroup();
    this.platforms = this.physics.add.staticGroup();

    // Default flat ground
    for (let x = 0; x < arenaWidth; x += 16) {
      const tile = this.groundGroup.create(x + 8, groundY + 8, 'ground_tile');
      tile.setOrigin(0.5, 0.5);
      tile.refreshBody();
    }

    // Create player
    const characterName = this.sceneConfig.character || GameManager.instance.selectedCharacter;
    const spawnX = 40;
    const spawnY = groundY - 16;

    if (characterName === 'zacko') {
      this.player = new Zacko(this, spawnX, spawnY);
    } else {
      this.player = new Poppleton(this, spawnX, spawnY);
    }

    // Peinture Mode
    this.player.isPeintureMode = GameManager.instance.peintureMode;

    // Collisions
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platforms);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Create boss (subclasses override createBoss())
    this.boss = this.createBoss();
    this.physics.add.collider(this.boss, this.groundGroup);

    // Boss-player collision
    this.physics.add.overlap(this.player, this.boss, () => {
      if (this.bossDefeated) return;
      if (!this.boss.isVulnerable) {
        this.player.takeDamage();
      }
    });

    // Player attack handling
    this.events.on('player-attack', (hitbox: Phaser.GameObjects.Zone | Phaser.Physics.Arcade.Sprite, type: string) => {
      if (this.bossDefeated) return;
      this.physics.add.overlap(hitbox, this.boss, () => {
        if (this.boss.isVulnerable) {
          this.boss.takeDamage();
          AudioManager.getInstance().playSFX('bossHit');
          if (type === 'pounce' && this.player instanceof Poppleton) {
            this.player.bounceOffEnemy();
          }
        }
      });
    });

    // Stomp on boss (only when vulnerable)
    this.physics.add.overlap(this.player, this.boss, () => {
      if (this.bossDefeated || !this.boss.isVulnerable) return;
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      if (playerBody.velocity.y > 0 && this.player.y < this.boss.y - 8) {
        this.boss.takeDamage();
        AudioManager.getInstance().playSFX('bossHit');
        playerBody.setVelocityY(-200);
      }
    });

    // Player death handler
    this.events.on('player-died', () => {
      this.respawnPlayer();
    });

    // Boss projectile collisions (subclass sets up via getBossProjectiles())
    this.setupBossProjectileCollisions();

    // Build UI
    this.createBossHealthBar();

    // Launch HUD
    this.scene.launch('HUD');

    // Pause input
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const pKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    escKey.on('down', () => this.openPauseMenu());
    pKey.on('down', () => this.openPauseMenu());

    // Setup arena (subclass hook)
    this.setupArena();

    // Start boss music
    const audio = AudioManager.getInstance();
    audio.playMusic(`boss${this.sceneConfig.worldNum}`);
  }

  update(time: number, delta: number): void {
    if (this.bossDefeated && this.victorySequenceStarted) return;

    this.player.update(time, delta);

    if (!this.bossDefeated) {
      this.boss.update(time, delta);
      this.updateBossHealthBar();

      // Check boss defeat
      if (this.boss.hp <= 0 && !this.bossDefeated) {
        this.bossDefeated = true;
        this.startVictorySequence();
      }
    }

    // Update HUD
    const hudScene = this.scene.get('HUD') as HUD;
    if (hudScene?.updateHUD) {
      hudScene.updateHUD(this.player);
    }
  }

  // --- Subclass hooks ---

  protected createBoss(): Boss {
    throw new Error('BossScene subclass must implement createBoss()');
  }

  protected setupArena(): void {
    // Override in subclasses for custom arena geometry
  }

  protected getBossProjectiles(): Phaser.Physics.Arcade.Group[] {
    // Override in subclasses to return boss projectile groups
    return [];
  }

  protected onBossPhaseChange(_newPhase: number): void {
    // Override for phase-specific arena changes
  }

  // --- Boss Health Bar ---

  private createBossHealthBar(): void {
    const barWidth = 120;
    const barHeight = 6;
    const barX = (GAME_WIDTH - barWidth) / 2;
    const barY = GAME_HEIGHT - 16;

    // Background
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333);
    this.healthBarBg.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    this.healthBarBg.setDepth(100);
    this.healthBarBg.setScrollFactor(0);

    // Fill
    this.healthBarFill = this.add.graphics();
    this.healthBarFill.setDepth(101);
    this.healthBarFill.setScrollFactor(0);

    // Boss name
    this.bossNameText = this.add.text(GAME_WIDTH / 2, barY - 8, this.boss.bossName, {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(101).setScrollFactor(0);

    // Phase indicator
    this.phaseText = this.add.text(GAME_WIDTH / 2 + barWidth / 2 + 8, barY + 2, '', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0, 0.5).setDepth(101).setScrollFactor(0);
  }

  private updateBossHealthBar(): void {
    const barWidth = 120;
    const barHeight = 6;
    const barX = (GAME_WIDTH - barWidth) / 2;
    const barY = GAME_HEIGHT - 16;

    const hpFraction = Math.max(0, this.boss.hp / this.boss.maxHp);

    this.healthBarFill.clear();
    // Color shifts as HP decreases
    let color = 0x44ff44;
    if (hpFraction < 0.33) color = 0xff4444;
    else if (hpFraction < 0.66) color = 0xffaa44;

    this.healthBarFill.fillStyle(color);
    this.healthBarFill.fillRect(barX, barY, barWidth * hpFraction, barHeight);

    // Phase text
    this.phaseText.setText(`P${this.boss.currentPhase}`);

    // Check phase transitions
    const prevPhase = this.boss.currentPhase;
    this.boss.checkPhaseTransition();
    if (this.boss.currentPhase !== prevPhase) {
      this.onBossPhaseChange(this.boss.currentPhase);
      this.showPhaseTransition();
    }
  }

  private showPhaseTransition(): void {
    // Flash screen briefly
    this.cameras.main.flash(300, 255, 255, 255, false);

    // Show phase text
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, `Phase ${this.boss.currentPhase}!`, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    this.tweens.add({
      targets: text,
      alpha: 0,
      y: text.y - 16,
      duration: 1500,
      onComplete: () => text.destroy(),
    });
  }

  // --- Victory ---

  private startVictorySequence(): void {
    this.victorySequenceStarted = true;
    AudioManager.getInstance().stopMusic(500);
    AudioManager.getInstance().playSFX('bossDefeat');

    // Boss defeat animation
    this.boss.setTint(0xffffff);
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1000,
      ease: 'Power2',
    });

    // Camera effects
    this.cameras.main.shake(500, 0.01);

    // Particle burst
    const particles = this.add.particles(this.boss.x, this.boss.y, 'pixel', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 1500,
      quantity: 30,
      tint: [PALETTE.softGold, PALETTE.lilyPink, PALETTE.willowGreen, PALETTE.brightBlue],
      emitting: false,
    });
    particles.setDepth(150);
    particles.explode();

    // Color restoration animation (flash to vibrant world colors)
    this.time.delayedCall(1200, () => {
      this.doColorRestoration();
    });

    // Mark level complete and transition
    this.time.delayedCall(3500, () => {
      // Mark boss level (level 4 of the world) as complete
      const gm = GameManager.instance;
      gm.completeLevel(this.sceneConfig.worldNum, 4, gm.macarons);
      gm.save();

      // Clean up and return to world map (or test level for now)
      this.scene.stop('HUD');

      // Try to go to world map if it exists, otherwise CharacterSelect
      if (this.scene.manager.getScene('WorldMap')) {
        this.scene.start('WorldMap');
      } else {
        this.scene.start('CharacterSelect');
      }
    });

    // Victory text
    this.time.delayedCall(1500, () => {
      AudioManager.getInstance().playMusic('victory');
      const text = this.add.text(GAME_WIDTH / 2, 30, 'VICTORY!', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffdd44',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

      this.tweens.add({
        targets: text,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 600,
        yoyo: true,
        repeat: 2,
      });
    });
  }

  private doColorRestoration(): void {
    // Tint all ground tiles from grey to full color
    this.groundGroup.getChildren().forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      sprite.setTint(0x888888);
      this.tweens.add({
        targets: sprite,
        tint: { from: 0x888888, to: 0xffffff },
        duration: 2000,
        ease: 'Power2',
      });
    });

    // Flash camera with world color
    const worldColors: Record<number, number> = {
      1: PALETTE.waterBlue,
      2: PALETTE.sunAmber,
      3: PALETTE.deepPurple,
      4: PALETTE.vividGreen,
    };
    const worldColor = worldColors[this.sceneConfig.worldNum] || PALETTE.brightBlue;
    const r = (worldColor >> 16) & 0xff;
    const g = (worldColor >> 8) & 0xff;
    const b = worldColor & 0xff;
    this.cameras.main.flash(1000, r, g, b, false);
  }

  // --- Collision Setup ---

  private setupBossProjectileCollisions(): void {
    // Delay to allow subclass to finish boss creation
    this.time.delayedCall(100, () => {
      const projectileGroups = this.getBossProjectiles();
      for (const group of projectileGroups) {
        this.physics.add.overlap(this.player, group, () => {
          this.player.takeDamage();
        });
      }
    });
  }

  // --- Utility ---

  private openPauseMenu(): void {
    AudioManager.getInstance().playSFX('pause');
    this.scene.pause();
    this.scene.launch('PauseMenu', { callingScene: this.scene.key });
  }

  protected respawnPlayer(): void {
    this.player.setPosition(40, (this.sceneConfig.groundY ?? (this.sceneConfig.arenaHeight - 16)) - 16);
    this.player.hp = this.player.maxHp;
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  protected addPlatform(x: number, y: number, width: number = 24): Phaser.Physics.Arcade.Sprite {
    const platform = this.platforms.create(x, y, 'platform_tile') as Phaser.Physics.Arcade.Sprite;
    platform.setDisplaySize(width, 8);
    platform.refreshBody();
    return platform;
  }
}
