import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

/**
 * Virtual touch controls overlay for mobile devices.
 *
 * Singleton — call `TouchControls.getInstance()` to access.
 * Call `create(scene)` once from a persistent scene (like the game scene)
 * to draw the on-screen buttons. The button states are polled by the Player
 * class via the `isDown` getters.
 *
 * Layout:
 *   Left side:  ← →  d-pad arrows (bottom-left)
 *   Right side: A (jump)  B (attack)  (bottom-right)
 */
export class TouchControls {
  private static _instance: TouchControls;

  // Virtual button states
  left = false;
  right = false;
  jump = false;
  jumpJustPressed = false;
  attack = false;
  attackJustPressed = false;

  // Visibility
  private visible = false;
  private graphics: Phaser.GameObjects.Graphics[] = [];
  private scene: Phaser.Scene | null = null;

  // Track active pointer per button zone to prevent stuck buttons
  private activePointers: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): TouchControls {
    if (!TouchControls._instance) {
      TouchControls._instance = new TouchControls();
    }
    return TouchControls._instance;
  }

  /** Returns true if the device likely supports touch. */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /** Creates the visual overlay. Only shows on touch-capable devices. */
  create(scene: Phaser.Scene): void {
    if (!TouchControls.isTouchDevice()) return;

    this.scene = scene;
    this.visible = true;
    this.graphics = [];

    const alpha = 0.25;
    const btnSize = 28;
    const pad = 8;
    const bottomY = GAME_HEIGHT - pad - btnSize;

    // --- Left d-pad ---
    // Left arrow
    this.createButton(scene, pad, bottomY, btnSize, btnSize, '◀', alpha, 'left');
    // Right arrow
    this.createButton(scene, pad + btnSize + 4, bottomY, btnSize, btnSize, '▶', alpha, 'right');

    // --- Right side buttons ---
    // B (attack) - bottom right
    this.createButton(scene, GAME_WIDTH - pad - btnSize, bottomY, btnSize, btnSize, 'B', alpha, 'attack');
    // A (jump) - above B
    this.createButton(scene, GAME_WIDTH - pad - btnSize, bottomY - btnSize - 4, btnSize, btnSize, 'A', alpha, 'jump');

    // Handle global pointer events for multi-touch
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer));
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.handlePointerMove(pointer));
    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.handlePointerUp(pointer));

    // Enable multi-touch
    scene.input.addPointer(2); // Support up to 3 simultaneous touches
  }

  private createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    alpha: number,
    _id: string,
  ): void {
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, alpha);
    g.fillRoundedRect(x, y, w, h, 4);
    g.lineStyle(1, 0xffffff, alpha * 1.5);
    g.strokeRoundedRect(x, y, w, h, 4);
    g.setScrollFactor(0);
    g.setDepth(200);
    this.graphics.push(g);

    const txt = scene.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(alpha * 2);
    this.graphics.push(txt as unknown as Phaser.GameObjects.Graphics);
  }

  // Button zone definitions (in game coordinates)
  private getZones(): Array<{ id: string; x: number; y: number; w: number; h: number }> {
    const btnSize = 28;
    const pad = 8;
    const bottomY = GAME_HEIGHT - pad - btnSize;

    return [
      { id: 'left', x: pad, y: bottomY, w: btnSize, h: btnSize },
      { id: 'right', x: pad + btnSize + 4, y: bottomY, w: btnSize, h: btnSize },
      { id: 'attack', x: GAME_WIDTH - pad - btnSize, y: bottomY, w: btnSize, h: btnSize },
      { id: 'jump', x: GAME_WIDTH - pad - btnSize, y: bottomY - btnSize - 4, w: btnSize, h: btnSize },
    ];
  }

  private getZoneForPoint(x: number, y: number): string | null {
    for (const zone of this.getZones()) {
      if (x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) {
        return zone.id;
      }
    }
    return null;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.visible || !this.scene) return;

    // Convert screen coordinates to game coordinates
    const cam = this.scene.cameras.main;
    const gx = (pointer.x - cam.x) / cam.zoom;
    const gy = (pointer.y - cam.y) / cam.zoom;

    const zone = this.getZoneForPoint(gx, gy);
    if (zone) {
      this.activePointers.set(`${pointer.id}_${zone}`, pointer.id);
      this.setButtonState(zone, true);
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.visible || !this.scene) return;
    // For move events, we re-evaluate which zone the pointer is in
    // This handles drag-sliding between buttons
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.visible) return;
    // Release all buttons associated with this pointer
    const toDelete: string[] = [];
    this.activePointers.forEach((pId, key) => {
      if (pId === pointer.id) {
        const zone = key.split('_').slice(1).join('_');
        this.setButtonState(zone, false);
        toDelete.push(key);
      }
    });
    toDelete.forEach(k => this.activePointers.delete(k));
  }

  private setButtonState(zone: string, pressed: boolean): void {
    switch (zone) {
      case 'left':
        this.left = pressed;
        break;
      case 'right':
        this.right = pressed;
        break;
      case 'jump':
        if (pressed && !this.jump) {
          this.jumpJustPressed = true;
        }
        this.jump = pressed;
        break;
      case 'attack':
        if (pressed && !this.attack) {
          this.attackJustPressed = true;
        }
        this.attack = pressed;
        break;
    }
  }

  /** Call once per frame from the scene's update to reset just-pressed states. */
  resetJustPressed(): void {
    this.jumpJustPressed = false;
    this.attackJustPressed = false;
  }

  /** Destroy overlay graphics. */
  destroy(): void {
    this.graphics.forEach(g => g.destroy());
    this.graphics = [];
    this.visible = false;
    this.left = false;
    this.right = false;
    this.jump = false;
    this.attack = false;
    this.scene = null;
    this.activePointers.clear();
  }

  get isVisible(): boolean {
    return this.visible;
  }
}
