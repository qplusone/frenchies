import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../config/GameConfig';
import { GameManager } from '../systems/GameManager';
import { AudioManager } from '../systems/AudioManager';

/**
 * TitleScreen -- The warm, pastoral opening screen for Jardin des Frenchies.
 *
 * Displays an animated pond scene with two sleeping French Bulldogs,
 * the game title with a golden glow, and a navigable menu.
 */
export class TitleScreen extends Phaser.Scene {
  // Menu state
  private menuItems: Phaser.GameObjects.Text[] = [];
  private menuActions: (() => void)[] = [];
  private selectedIndex: number = 0;

  // Visual elements (stored for cleanup / tweens)
  private rippleGraphics!: Phaser.GameObjects.Graphics;
  private rippleTime: number = 0;

  constructor() {
    super('TitleScreen');
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  create(): void {
    // -- Background ----------------------------------------------------------
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_world1_far')
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // -- Water ripples -------------------------------------------------------
    this.rippleGraphics = this.add.graphics();
    this.rippleTime = 0;

    // -- Sleeping Frenchies --------------------------------------------------
    const groundY = GAME_HEIGHT - 36;

    // Small grassy patch for the dogs to rest on
    const grass = this.add.graphics();
    grass.fillStyle(PALETTE.willowGreen, 0.6);
    grass.fillRoundedRect(GAME_WIDTH / 2 - 48, groundY + 4, 96, 12, 4);

    const poppleton = this.add.image(GAME_WIDTH / 2 - 20, groundY, 'poppleton')
      .setScale(2)
      .setFlipX(false);

    const zacko = this.add.image(GAME_WIDTH / 2 + 20, groundY, 'zacko')
      .setScale(2)
      .setFlipX(true);

    // Gentle breathing / bob animation
    this.tweens.add({
      targets: poppleton,
      y: groundY - 1.5,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: zacko,
      y: groundY - 1.5,
      duration: 2100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 400,
    });

    // -- Title text ----------------------------------------------------------
    const titleY = 32;

    // Golden glow / shadow layer
    this.add.text(GAME_WIDTH / 2, titleY + 1, 'Jardin des Frenchies', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#8a6a2a',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0.5);

    // Main title
    this.add.text(GAME_WIDTH / 2, titleY, 'Jardin des Frenchies', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#' + PALETTE.softGold.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // -- Subtitle ------------------------------------------------------------
    this.add.text(GAME_WIDTH / 2, titleY + 16, 'A Birthday Adventure', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#b8b8d0',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // -- Menu ----------------------------------------------------------------
    this.buildMenu();

    // -- "For Rachel" --------------------------------------------------------
    this.add.text(GAME_WIDTH - 4, GAME_HEIGHT - 4, 'For Rachel', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#' + PALETTE.lilyPink.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(1, 1).setAlpha(0.55);

    // -- Input ---------------------------------------------------------------
    this.setupInput();

    // -- Music ---------------------------------------------------------------
    AudioManager.getInstance().playMusic('title');
  }

  // ---------------------------------------------------------------------------
  // Update -- animate water ripples
  // ---------------------------------------------------------------------------

  update(_time: number, delta: number): void {
    this.rippleTime += delta * 0.001; // convert ms -> seconds

    const g = this.rippleGraphics;
    g.clear();

    // Draw several sine-wave ripple lines across the lower half of the screen
    // to simulate gentle pond surface movement.
    const waterTop = Math.floor(GAME_HEIGHT * 0.55);
    const rippleCount = 4;

    for (let r = 0; r < rippleCount; r++) {
      const baseY = waterTop + r * 14;
      const alpha = 0.12 - r * 0.02;

      g.lineStyle(1, PALETTE.waterBlue, Math.max(alpha, 0.04));
      g.beginPath();

      for (let x = 0; x <= GAME_WIDTH; x += 2) {
        const waveOffset = Math.sin((x * 0.04) + this.rippleTime * (1.2 + r * 0.3) + r * 1.5) * (2 + r * 0.5);
        const y = baseY + waveOffset;

        if (x === 0) {
          g.moveTo(x, y);
        } else {
          g.lineTo(x, y);
        }
      }

      g.strokePath();
    }
  }

  // ---------------------------------------------------------------------------
  // Menu construction
  // ---------------------------------------------------------------------------

  private buildMenu(): void {
    this.menuItems = [];
    this.menuActions = [];
    this.selectedIndex = 0;

    const hasSave = GameManager.instance.hasSave();
    const menuStartY = GAME_HEIGHT / 2 + 8;
    const lineHeight = 14;

    // Define items
    const items: { label: string; action: () => void }[] = [
      { label: 'New Game', action: () => this.startNewGame() },
    ];

    if (hasSave) {
      items.push({ label: 'Continue', action: () => this.continueGame() });
    }

    items.push({ label: 'Gallery', action: () => this.openGallery() });

    // Create text objects
    items.forEach((item, i) => {
      const text = this.add.text(GAME_WIDTH / 2, menuStartY + i * lineHeight, item.label, {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.menuItems.push(text);
      this.menuActions.push(item.action);
    });

    // Highlight the initial selection
    this.updateMenuHighlight();
  }

  // ---------------------------------------------------------------------------
  // Menu navigation
  // ---------------------------------------------------------------------------

  private setupInput(): void {
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    upKey.on('down', () => this.moveSelection(-1));
    wKey.on('down', () => this.moveSelection(-1));
    downKey.on('down', () => this.moveSelection(1));
    sKey.on('down', () => this.moveSelection(1));
    enterKey.on('down', () => this.confirmSelection());
    spaceKey.on('down', () => this.confirmSelection());
  }

  private moveSelection(dir: number): void {
    this.selectedIndex =
      (this.selectedIndex + dir + this.menuItems.length) % this.menuItems.length;
    this.updateMenuHighlight();
    AudioManager.getInstance().playSFX('menuSelect');
  }

  private updateMenuHighlight(): void {
    const goldHex = '#' + PALETTE.softGold.toString(16).padStart(6, '0');

    this.menuItems.forEach((item, i) => {
      if (i === this.selectedIndex) {
        item.setColor(goldHex);
        item.setScale(1.1);
      } else {
        item.setColor('#888888');
        item.setScale(1);
      }
    });
  }

  private confirmSelection(): void {
    AudioManager.getInstance().playSFX('menuConfirm');
    const action = this.menuActions[this.selectedIndex];
    if (action) {
      action();
    }
  }

  // ---------------------------------------------------------------------------
  // Menu actions
  // ---------------------------------------------------------------------------

  private startNewGame(): void {
    if (GameManager.instance.hasSave()) {
      GameManager.instance.clearSave();
    }
    this.scene.start('CharacterSelect');
  }

  private continueGame(): void {
    // Save data already loaded in GameManager constructor -- just proceed.
    this.scene.start('CharacterSelect');
  }

  private openGallery(): void {
    this.scene.start('Gallery');
  }
}
