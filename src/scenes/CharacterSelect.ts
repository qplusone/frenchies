import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../config/GameConfig';
import { GameManager } from '../systems/GameManager';
import { AudioManager } from '../systems/AudioManager';

export class CharacterSelect extends Phaser.Scene {
  private selected: 'poppleton' | 'zacko' = 'poppleton';
  private poppletonSprite!: Phaser.GameObjects.Sprite;
  private zackoSprite!: Phaser.GameObjects.Sprite;
  private selectorGraphic!: Phaser.GameObjects.Graphics;

  constructor() {
    super('CharacterSelect');
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor(PALETTE.uiBackground);

    // Title
    this.add.text(GAME_WIDTH / 2, 24, 'Choose Your Frenchie', {
      fontSize: '8px',
      color: '#dec87a',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Poppleton
    const popX = GAME_WIDTH / 3;
    const charY = GAME_HEIGHT / 2 - 10;

    this.poppletonSprite = this.add.sprite(popX, charY, 'poppleton')
      .setScale(3)
      .setInteractive();

    this.add.text(popX, charY + 35, 'Poppleton', {
      fontSize: '8px',
      color: '#d4a057',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(popX, charY + 48, 'Butterfly Float', {
      fontSize: '6px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    this.add.text(popX, charY + 57, 'Pounce Attack', {
      fontSize: '6px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    // Zacko
    const zackoX = (GAME_WIDTH * 2) / 3;

    this.zackoSprite = this.add.sprite(zackoX, charY, 'zacko')
      .setScale(3)
      .setInteractive();

    this.add.text(zackoX, charY + 35, 'Zacko', {
      fontSize: '8px',
      color: '#cccccc',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(zackoX, charY + 48, 'Bat Dash', {
      fontSize: '6px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    this.add.text(zackoX, charY + 57, 'Bark Attack', {
      fontSize: '6px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    // Selector box
    this.selectorGraphic = this.add.graphics();
    this.updateSelector();

    // Input handling
    this.poppletonSprite.on('pointerdown', () => {
      this.selected = 'poppleton';
      this.updateSelector();
    });

    this.zackoSprite.on('pointerdown', () => {
      this.selected = 'zacko';
      this.updateSelector();
    });

    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const dKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    leftKey.on('down', () => { this.selected = 'poppleton'; this.updateSelector(); });
    aKey.on('down', () => { this.selected = 'poppleton'; this.updateSelector(); });
    rightKey.on('down', () => { this.selected = 'zacko'; this.updateSelector(); });
    dKey.on('down', () => { this.selected = 'zacko'; this.updateSelector(); });
    enterKey.on('down', () => this.confirmSelection());
    spaceKey.on('down', () => this.confirmSelection());

    // Prompt
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'Press ENTER to start', {
      fontSize: '7px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Resume AudioContext on first user interaction and start title music
    const resumeAndPlay = async () => {
      const audio = AudioManager.getInstance();
      await audio.resumeAudio();
      audio.playMusic('title');
    };
    // Try immediately (may work if user already interacted with the page)
    resumeAndPlay();
    // Also attach to first interaction as fallback
    this.input.once('pointerdown', () => resumeAndPlay());
    this.input.keyboard!.once('keydown', () => resumeAndPlay());
  }

  private updateSelector(): void {
    this.selectorGraphic.clear();
    this.selectorGraphic.lineStyle(1, PALETTE.softGold);

    const x = this.selected === 'poppleton'
      ? this.poppletonSprite.x
      : this.zackoSprite.x;
    const y = this.poppletonSprite.y;

    this.selectorGraphic.strokeRect(x - 28, y - 28, 56, 56);

    AudioManager.getInstance().playSFX('menuSelect');
  }

  private confirmSelection(): void {
    AudioManager.getInstance().playSFX('menuConfirm');
    GameManager.instance.selectedCharacter = this.selected;
    this.scene.start('WorldMap');
  }
}
