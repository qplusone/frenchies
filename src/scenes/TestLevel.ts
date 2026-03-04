import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { Poppleton } from '../entities/Poppleton';
import { Zacko } from '../entities/Zacko';
import { GameManager } from '../systems/GameManager';
import { HUD } from '../ui/HUD';

export class TestLevel extends Phaser.Scene {
  private player!: Player;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('TestLevel');
  }

  init(data: { character?: string }): void {
    this.data.set('character', data.character || 'poppleton');
  }

  create(): void {
    // Build ground
    this.groundGroup = this.physics.add.staticGroup();
    for (let x = 0; x < GAME_WIDTH * 2; x += TILE_SIZE) {
      this.groundGroup.create(x + TILE_SIZE / 2, GAME_HEIGHT - TILE_SIZE / 2, 'ground_tile')
        .refreshBody();
    }

    // Floating platforms
    this.addPlatform(64, GAME_HEIGHT - TILE_SIZE * 5, 4);
    this.addPlatform(160, GAME_HEIGHT - TILE_SIZE * 3, 5);
    this.addPlatform(280, GAME_HEIGHT - TILE_SIZE * 6, 3);
    this.addPlatform(350, GAME_HEIGHT - TILE_SIZE * 4, 4);
    this.addPlatform(420, GAME_HEIGHT - TILE_SIZE * 7, 3);

    // Create player
    const characterName = this.data.get('character') as string;
    if (characterName === 'zacko') {
      this.player = new Zacko(this, 40, GAME_HEIGHT - 48);
    } else {
      this.player = new Poppleton(this, 40, GAME_HEIGHT - 48);
    }
    this.player.isPeintureMode = GameManager.instance.peintureMode;
    this.physics.add.collider(this.player, this.groundGroup);

    // Collectibles
    const macarons = this.physics.add.staticGroup();
    const macaronPositions = [
      [80, GAME_HEIGHT - TILE_SIZE * 6], [96, GAME_HEIGHT - TILE_SIZE * 6],
      [160, GAME_HEIGHT - TILE_SIZE * 4], [176, GAME_HEIGHT - TILE_SIZE * 4],
      [192, GAME_HEIGHT - TILE_SIZE * 4],
      [290, GAME_HEIGHT - TILE_SIZE * 7], [306, GAME_HEIGHT - TILE_SIZE * 7],
    ];
    for (const [mx, my] of macaronPositions) {
      macarons.create(mx, my, 'macaron');
    }
    this.physics.add.overlap(this.player, macarons, (_p, macaron) => {
      (macaron as Phaser.Physics.Arcade.Sprite).destroy();
      GameManager.instance.collectMacaron();
    });

    // Wing power-up on a high platform
    const wingPowerUp = this.physics.add.staticSprite(440, GAME_HEIGHT - TILE_SIZE * 8, 'wing_powerup');
    this.physics.add.overlap(this.player, wingPowerUp, () => {
      wingPowerUp.destroy();
      this.player.activateWings();
    });

    // Camera
    this.cameras.main.setBounds(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Enemies
    const blob = this.physics.add.sprite(200, GAME_HEIGHT - TILE_SIZE * 2, 'brouillard_blob');
    (blob.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.tweens.add({
      targets: blob,
      x: blob.x + 60,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.physics.add.overlap(this.player, blob, () => {
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      if (playerBody.velocity.y > 0 && this.player.y < blob.y - 8) {
        blob.destroy();
        playerBody.setVelocityY(-200);
      } else {
        this.player.takeDamage();
      }
    });

    this.events.on('player-attack', (hitbox: Phaser.GameObjects.Zone | Phaser.Physics.Arcade.Sprite, type: string) => {
      this.physics.add.overlap(hitbox, blob, () => {
        if (blob.active) {
          blob.destroy();
          if (type === 'pounce' && this.player instanceof Poppleton) {
            this.player.bounceOffEnemy();
          }
        }
      });
    });

    // Death handler
    this.events.on('player-died', () => {
      this.player.setPosition(40, GAME_HEIGHT - 48);
      this.player.hp = this.player.maxHp;
    });

    // Launch HUD
    this.scene.launch('HUD');
    GameManager.instance.resetLevelCollectibles();

    // Instructions
    this.add.text(4, GAME_HEIGHT - 12, 'Arrows/WASD: Move | Space: Jump | X: Attack | P: Pause', {
      fontSize: '6px',
      color: '#666666',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 1,
    }).setScrollFactor(0).setDepth(100);

    // Pause input
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const pKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    escKey.on('down', () => this.openPauseMenu());
    pKey.on('down', () => this.openPauseMenu());
  }

  update(time: number, delta: number): void {
    this.player.update(time, delta);

    // Update HUD
    const hudScene = this.scene.get('HUD') as HUD;
    if (hudScene?.updateHUD) {
      hudScene.updateHUD(this.player);
    }
  }

  private openPauseMenu(): void {
    this.scene.pause();
    this.scene.launch('PauseMenu', { callingScene: 'TestLevel' });
  }

  private addPlatform(x: number, y: number, width: number): void {
    for (let i = 0; i < width; i++) {
      this.groundGroup.create(x + i * TILE_SIZE + TILE_SIZE / 2, y + TILE_SIZE / 2, 'platform_tile')
        .refreshBody();
    }
  }
}
