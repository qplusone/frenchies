import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../config/GameConfig';
import { GameManager } from '../systems/GameManager';
import { AudioManager } from '../systems/AudioManager';

/** Cost in paint drops to unlock a single painting. */
const PAINTING_COST = 3;

/** Grid layout constants. */
const COLUMNS = 4;
const ROWS = 3;
const TOTAL_PAINTINGS = COLUMNS * ROWS;

/** Size of each painting and frame. */
const PAINTING_W = 36;
const PAINTING_H = 28;
const FRAME_PAD = 3;

/** Grid placement. */
const GRID_LEFT = 28;
const GRID_TOP = 44;
const CELL_SPACING_X = 52;
const CELL_SPACING_Y = 48;

/** Themed painting colors - each unlocked painting reveals a unique hue. */
const PAINTING_COLORS: number[] = [
  PALETTE.waterBlue,
  PALETTE.lilyPink,
  PALETTE.willowGreen,
  PALETTE.sunAmber,
  PALETTE.peach,
  PALETTE.softGold,
  PALETTE.lavender,
  PALETTE.deepPurple,
  PALETTE.emerald,
  PALETTE.richRose,
  PALETTE.brightBlue,
  PALETTE.warmYellow,
];

export class Gallery extends Phaser.Scene {
  // Grid cursor position
  private cursorCol: number = 0;
  private cursorRow: number = 0;

  // Display objects
  private paintingFrames: Phaser.GameObjects.Graphics[] = [];
  private paintingFills: Phaser.GameObjects.Graphics[] = [];
  private cursorGraphic!: Phaser.GameObjects.Graphics;
  private paintDropText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private statusTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('Gallery');
  }

  create(): void {
    this.cursorCol = 0;
    this.cursorRow = 0;
    this.paintingFrames = [];
    this.paintingFills = [];

    // Dark museum background
    this.cameras.main.setBackgroundColor(0x12101a);

    // Outer wall frame / border
    const wallBorder = this.add.graphics();
    wallBorder.lineStyle(2, 0x3a3248);
    wallBorder.strokeRect(4, 4, GAME_WIDTH - 8, GAME_HEIGHT - 8);
    wallBorder.lineStyle(1, 0x2a2238);
    wallBorder.strokeRect(7, 7, GAME_WIDTH - 14, GAME_HEIGHT - 14);

    // Title
    this.add.text(GAME_WIDTH / 2, 16, 'Gallery', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#dec87a',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Paint drop count
    const gm = GameManager.instance;
    this.paintDropText = this.add.text(GAME_WIDTH / 2, 30, this.getPaintDropLabel(), {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#d4a057',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Draw painting grid
    this.drawPaintings();

    // Status message area (for feedback text) — must be created before updateCursor()
    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 22, '', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#e8b4b8',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5).setDepth(10);

    // Cursor highlight
    this.cursorGraphic = this.add.graphics();
    this.cursorGraphic.setDepth(10);
    this.updateCursor();

    // Back button prompt
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 10, 'ESC: Back', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#666666',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    // Input
    this.setupInput();
  }

  // ---------------------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------------------

  private drawPaintings(): void {
    const gm = GameManager.instance;

    // Clear any previous frames/fills
    this.paintingFrames.forEach(g => g.destroy());
    this.paintingFills.forEach(g => g.destroy());
    this.paintingFrames = [];
    this.paintingFills = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const index = row * COLUMNS + col;
        const itemId = `painting_${index + 1}`;
        const isUnlocked = gm.isGalleryItemUnlocked(itemId);

        const cx = GRID_LEFT + col * CELL_SPACING_X + PAINTING_W / 2;
        const cy = GRID_TOP + row * CELL_SPACING_Y + PAINTING_H / 2;

        // Wooden frame (outer border)
        const frame = this.add.graphics();
        frame.fillStyle(0x5c4a3a); // dark wood
        frame.fillRect(
          cx - PAINTING_W / 2 - FRAME_PAD,
          cy - PAINTING_H / 2 - FRAME_PAD,
          PAINTING_W + FRAME_PAD * 2,
          PAINTING_H + FRAME_PAD * 2,
        );
        frame.lineStyle(1, 0x8b7355); // lighter wood trim
        frame.strokeRect(
          cx - PAINTING_W / 2 - FRAME_PAD,
          cy - PAINTING_H / 2 - FRAME_PAD,
          PAINTING_W + FRAME_PAD * 2,
          PAINTING_H + FRAME_PAD * 2,
        );
        this.paintingFrames.push(frame);

        // Painting interior
        const fill = this.add.graphics();
        const paintColor = isUnlocked ? PAINTING_COLORS[index] : PALETTE.fog;
        const alpha = isUnlocked ? 1 : 0.35;

        fill.fillStyle(paintColor, alpha);
        fill.fillRect(
          cx - PAINTING_W / 2,
          cy - PAINTING_H / 2,
          PAINTING_W,
          PAINTING_H,
        );

        // If unlocked, add a small interior detail (simple cross-hatch motif)
        if (isUnlocked) {
          fill.lineStyle(1, 0xffffff, 0.15);
          fill.lineBetween(
            cx - PAINTING_W / 2 + 4, cy - PAINTING_H / 2 + 4,
            cx + PAINTING_W / 2 - 4, cy + PAINTING_H / 2 - 4,
          );
          fill.lineBetween(
            cx + PAINTING_W / 2 - 4, cy - PAINTING_H / 2 + 4,
            cx - PAINTING_W / 2 + 4, cy + PAINTING_H / 2 - 4,
          );
        }

        // If locked, show a small lock symbol
        if (!isUnlocked) {
          this.add.text(cx, cy, '?', {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#777777',
            stroke: '#000000',
            strokeThickness: 2,
          }).setOrigin(0.5);
        }

        this.paintingFills.push(fill);
      }
    }
  }

  private updateCursor(): void {
    this.cursorGraphic.clear();

    const cx = GRID_LEFT + this.cursorCol * CELL_SPACING_X + PAINTING_W / 2;
    const cy = GRID_TOP + this.cursorRow * CELL_SPACING_Y + PAINTING_H / 2;

    // Golden selection border
    this.cursorGraphic.lineStyle(2, PALETTE.softGold);
    this.cursorGraphic.strokeRect(
      cx - PAINTING_W / 2 - FRAME_PAD - 2,
      cy - PAINTING_H / 2 - FRAME_PAD - 2,
      PAINTING_W + (FRAME_PAD + 2) * 2,
      PAINTING_H + (FRAME_PAD + 2) * 2,
    );

    // Subtle inner glow
    this.cursorGraphic.lineStyle(1, PALETTE.softGold, 0.4);
    this.cursorGraphic.strokeRect(
      cx - PAINTING_W / 2 - FRAME_PAD - 1,
      cy - PAINTING_H / 2 - FRAME_PAD - 1,
      PAINTING_W + (FRAME_PAD + 1) * 2,
      PAINTING_H + (FRAME_PAD + 1) * 2,
    );

    // Show painting info below grid
    const index = this.cursorRow * COLUMNS + this.cursorCol;
    const itemId = `painting_${index + 1}`;
    const gm = GameManager.instance;
    const isUnlocked = gm.isGalleryItemUnlocked(itemId);

    // Clear any previous status unless a timed message is active
    if (!this.statusTimer || this.statusTimer.hasDispatched) {
      if (isUnlocked) {
        this.statusText.setText(`Painting #${index + 1} - Unlocked`);
        this.statusText.setColor('#88cc88');
      } else {
        this.statusText.setText(`Painting #${index + 1} - ${PAINTING_COST} Paint Drops`);
        this.statusText.setColor('#e8b4b8');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------

  private setupInput(): void {
    const keys = this.input.keyboard!;

    const leftKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const upKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const enterKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const escKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    leftKey.on('down', () => this.moveCursor(-1, 0));
    rightKey.on('down', () => this.moveCursor(1, 0));
    upKey.on('down', () => this.moveCursor(0, -1));
    downKey.on('down', () => this.moveCursor(0, 1));
    enterKey.on('down', () => this.tryUnlock());
    escKey.on('down', () => this.goBack());

    // Touch / pointer support
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleTap(pointer.x, pointer.y);
    });
  }

  private handleTap(px: number, py: number): void {
    // Check if a painting cell was tapped
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const cx = GRID_LEFT + col * CELL_SPACING_X + PAINTING_W / 2;
        const cy = GRID_TOP + row * CELL_SPACING_Y + PAINTING_H / 2;
        const halfW = PAINTING_W / 2 + FRAME_PAD;
        const halfH = PAINTING_H / 2 + FRAME_PAD;

        if (px >= cx - halfW && px <= cx + halfW && py >= cy - halfH && py <= cy + halfH) {
          if (row === this.cursorRow && col === this.cursorCol) {
            // Already selected — try to unlock
            this.tryUnlock();
          } else {
            this.cursorCol = col;
            this.cursorRow = row;
            this.updateCursor();
            AudioManager.getInstance().playSFX('menuSelect');
          }
          return;
        }
      }
    }

    // Tap outside the grid area near bottom = go back
    if (py > GAME_HEIGHT - 20) {
      this.goBack();
    }
  }

  private moveCursor(dx: number, dy: number): void {
    const newCol = Phaser.Math.Clamp(this.cursorCol + dx, 0, COLUMNS - 1);
    const newRow = Phaser.Math.Clamp(this.cursorRow + dy, 0, ROWS - 1);

    if (newCol !== this.cursorCol || newRow !== this.cursorRow) {
      this.cursorCol = newCol;
      this.cursorRow = newRow;
      this.updateCursor();
      AudioManager.getInstance().playSFX('menuSelect');
    }
  }

  // ---------------------------------------------------------------------------
  // Unlock logic
  // ---------------------------------------------------------------------------

  private tryUnlock(): void {
    const gm = GameManager.instance;
    const index = this.cursorRow * COLUMNS + this.cursorCol;
    const itemId = `painting_${index + 1}`;

    if (gm.isGalleryItemUnlocked(itemId)) {
      this.showStatus('Already unlocked!', '#88cc88');
      AudioManager.getInstance().playSFX('menuSelect');
      return;
    }

    if (!gm.spendPaintDrops(PAINTING_COST)) {
      this.showStatus('Not enough paint drops!', '#ff6666');
      AudioManager.getInstance().playSFX('menuSelect');
      return;
    }

    // Unlock the painting
    gm.unlockGalleryItem(itemId);
    gm.save();

    // Play the rare collect sound
    AudioManager.getInstance().playSFX('collectRare');

    // Update paint drop display
    this.paintDropText.setText(this.getPaintDropLabel());

    // Animate the reveal: redraw the specific painting
    this.revealPainting(index);

    this.showStatus('Painting unlocked!', '#dec87a');
  }

  private revealPainting(index: number): void {
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);

    const cx = GRID_LEFT + col * CELL_SPACING_X + PAINTING_W / 2;
    const cy = GRID_TOP + row * CELL_SPACING_Y + PAINTING_H / 2;

    // Clear old fill for this painting
    const oldFill = this.paintingFills[index];
    if (oldFill) {
      oldFill.destroy();
    }

    // Create a fresh coloured painting
    const fill = this.add.graphics();
    const paintColor = PAINTING_COLORS[index];

    // Start with a white flash
    fill.fillStyle(0xffffff, 1);
    fill.fillRect(
      cx - PAINTING_W / 2,
      cy - PAINTING_H / 2,
      PAINTING_W,
      PAINTING_H,
    );

    // After a brief flash, redraw with the real colour
    this.time.delayedCall(120, () => {
      fill.clear();
      fill.fillStyle(paintColor, 1);
      fill.fillRect(
        cx - PAINTING_W / 2,
        cy - PAINTING_H / 2,
        PAINTING_W,
        PAINTING_H,
      );

      // Detail motif
      fill.lineStyle(1, 0xffffff, 0.15);
      fill.lineBetween(
        cx - PAINTING_W / 2 + 4, cy - PAINTING_H / 2 + 4,
        cx + PAINTING_W / 2 - 4, cy + PAINTING_H / 2 - 4,
      );
      fill.lineBetween(
        cx + PAINTING_W / 2 - 4, cy - PAINTING_H / 2 + 4,
        cx - PAINTING_W / 2 + 4, cy + PAINTING_H / 2 - 4,
      );
    });

    this.paintingFills[index] = fill;

    // Remove the "?" text (find it by position)
    this.children.list
      .filter((child): child is Phaser.GameObjects.Text =>
        child instanceof Phaser.GameObjects.Text &&
        child.text === '?' &&
        Math.abs(child.x - cx) < 2 &&
        Math.abs(child.y - cy) < 2
      )
      .forEach(t => t.destroy());
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private getPaintDropLabel(): string {
    return `Paint Drops: ${GameManager.instance.totalPaintDrops}`;
  }

  private showStatus(message: string, color: string): void {
    this.statusText.setText(message);
    this.statusText.setColor(color);

    // Clear previous timer if one was running
    if (this.statusTimer) {
      this.statusTimer.destroy();
    }

    this.statusTimer = this.time.delayedCall(1800, () => {
      // Restore default cursor info
      this.updateCursor();
    });
  }

  private goBack(): void {
    AudioManager.getInstance().playSFX('menuConfirm');
    this.scene.start('TitleScreen');
  }
}
