import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../config/GameConfig';
import { GameManager } from '../systems/GameManager';
import { AudioManager } from '../systems/AudioManager';

export class PauseMenu extends Phaser.Scene {
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex: number = 0;
  private selector!: Phaser.GameObjects.Text;
  private callingScene: string = '';

  constructor() {
    super('PauseMenu');
  }

  init(data: { callingScene: string }): void {
    this.callingScene = data.callingScene;
  }

  create(): void {
    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Easel frame
    const easelX = GAME_WIDTH / 2;
    const easelY = GAME_HEIGHT / 2;
    const frameW = 140;
    const frameH = 120;

    const frame = this.add.graphics();
    // Easel legs
    frame.lineStyle(2, 0x8B4513);
    frame.lineBetween(easelX - 30, easelY + frameH / 2, easelX - 50, easelY + frameH / 2 + 30);
    frame.lineBetween(easelX + 30, easelY + frameH / 2, easelX + 50, easelY + frameH / 2 + 30);
    // Canvas frame
    frame.fillStyle(0xf5f0e0);
    frame.fillRect(easelX - frameW / 2, easelY - frameH / 2, frameW, frameH);
    frame.lineStyle(2, 0x8B4513);
    frame.strokeRect(easelX - frameW / 2, easelY - frameH / 2, frameW, frameH);

    // Title
    this.add.text(easelX, easelY - frameH / 2 + 14, 'PAUSED', {
      fontSize: '8px',
      color: '#4a3728',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Menu items
    const gm = GameManager.instance;
    const peintureLabel = gm.peintureMode ? 'Peinture: ON' : 'Peinture: OFF';

    const items = [
      { label: 'Resume', action: () => this.resume() },
      { label: 'Restart Level', action: () => this.restartLevel() },
      { label: 'World Map', action: () => this.goToWorldMap() },
      { label: peintureLabel, action: () => this.togglePeintureMode() },
      { label: 'Quit', action: () => this.quit() },
    ];

    const startY = easelY - 20;
    items.forEach((item, i) => {
      const text = this.add.text(easelX, startY + i * 16, item.label, {
        fontSize: '8px',
        color: '#4a3728',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setInteractive();

      text.on('pointerover', () => {
        this.selectedIndex = i;
        this.updateSelector();
      });
      text.on('pointerdown', () => item.action());

      text.setData('action', item.action);
      this.menuItems.push(text);
    });

    // Selector arrow
    this.selector = this.add.text(
      easelX - 55,
      startY,
      '>',
      { fontSize: '8px', color: '#c94c6e', fontFamily: 'monospace', stroke: '#000000', strokeThickness: 2 }
    );
    this.updateSelector();

    // Keyboard input
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const pKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    upKey.on('down', () => this.moveSelection(-1));
    wKey.on('down', () => this.moveSelection(-1));
    downKey.on('down', () => this.moveSelection(1));
    sKey.on('down', () => this.moveSelection(1));
    enterKey.on('down', () => this.confirmSelection());
    spaceKey.on('down', () => this.confirmSelection());
    escKey.on('down', () => this.resume());
    pKey.on('down', () => this.resume());
  }

  private moveSelection(dir: number): void {
    this.selectedIndex = (this.selectedIndex + dir + this.menuItems.length) % this.menuItems.length;
    this.updateSelector();
    AudioManager.getInstance().playSFX('menuSelect');
  }

  private updateSelector(): void {
    const selected = this.menuItems[this.selectedIndex];
    this.selector.setY(selected.y);

    // Highlight selected item
    this.menuItems.forEach((item, i) => {
      item.setColor(i === this.selectedIndex ? '#c94c6e' : '#4a3728');
    });
  }

  private confirmSelection(): void {
    AudioManager.getInstance().playSFX('menuConfirm');
    const action = this.menuItems[this.selectedIndex].getData('action') as () => void;
    action();
  }

  private resume(): void {
    this.scene.stop();
    this.scene.resume(this.callingScene);
  }

  private restartLevel(): void {
    this.scene.stop();
    this.scene.stop(this.callingScene);
    this.scene.start(this.callingScene);
  }

  private goToWorldMap(): void {
    this.scene.stop();
    this.scene.stop(this.callingScene);
    this.scene.start('WorldMap');
  }

  private togglePeintureMode(): void {
    const gm = GameManager.instance;
    gm.peintureMode = !gm.peintureMode;
    gm.save();

    // Update the menu label
    const peintureItem = this.menuItems[3];
    peintureItem.setText(gm.peintureMode ? 'Peinture: ON' : 'Peinture: OFF');
  }

  private quit(): void {
    this.scene.stop();
    this.scene.stop(this.callingScene);
    this.scene.stop('HUD');
    this.scene.start('WorldMap');
  }
}
