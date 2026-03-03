import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../config/GameConfig';
import { GameManager } from '../systems/GameManager';
import { AudioManager } from '../systems/AudioManager';

interface WorldNode {
  x: number;
  y: number;
  worldNum: number;
  label: string;
  color: number;
  levels: LevelNode[];
}

interface LevelNode {
  x: number;
  y: number;
  levelNum: number;
  label: string;
  isBoss: boolean;
}

type MapMode = 'world' | 'level';

export class WorldMap extends Phaser.Scene {
  private worldNodes: WorldNode[] = [];
  private selectedWorld: number = 0;
  private selectedLevel: number = 0;
  private mode: MapMode = 'world';

  // Display objects
  private characterSprite!: Phaser.GameObjects.Sprite;
  private titleText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private nodeGraphics!: Phaser.GameObjects.Graphics;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private levelContainer!: Phaser.GameObjects.Container;
  private worldLabels: Phaser.GameObjects.Text[] = [];
  private levelLabels: Phaser.GameObjects.Text[] = [];
  private completionStars: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('WorldMap');
  }

  create(): void {
    const gm = GameManager.instance;
    this.cameras.main.setBackgroundColor(PALETTE.uiBackground);

    // Define world nodes in a garden path layout
    this.worldNodes = [
      {
        x: 48, y: 140,
        worldNum: 1,
        label: 'Water Lilies',
        color: PALETTE.waterBlue,
        levels: [
          { x: 24, y: 60, levelNum: 1, label: 'Lily Pad Lane', isBoss: false },
          { x: 72, y: 48, levelNum: 2, label: 'Willow Bridge', isBoss: false },
          { x: 120, y: 60, levelNum: 3, label: 'Reflection Depths', isBoss: false },
          { x: 168, y: 44, levelNum: 4, label: 'Le Grand Grenouille', isBoss: true },
        ],
      },
      {
        x: 128, y: 100,
        worldNum: 2,
        label: 'Morning Light',
        color: PALETTE.sunAmber,
        levels: [
          { x: 24, y: 60, levelNum: 1, label: 'Sunrise Terrace', isBoss: false },
          { x: 72, y: 48, levelNum: 2, label: 'The Greenhouse', isBoss: false },
          { x: 120, y: 60, levelNum: 3, label: 'Foggy Arbor', isBoss: false },
          { x: 168, y: 44, levelNum: 4, label: 'Monsieur Escargot', isBoss: true },
        ],
      },
      {
        x: 208, y: 140,
        worldNum: 3,
        label: 'Reflections',
        color: PALETTE.deepPurple,
        levels: [
          { x: 24, y: 60, levelNum: 1, label: 'Mirror Pond', isBoss: false },
          { x: 72, y: 48, levelNum: 2, label: 'Palette Shift', isBoss: false },
          { x: 120, y: 60, levelNum: 3, label: 'Impressionist Express', isBoss: false },
          { x: 168, y: 44, levelNum: 4, label: 'Le Cygne Gris', isBoss: true },
        ],
      },
      {
        x: 128, y: 180,
        worldNum: 4,
        label: 'Restored Garden',
        color: PALETTE.vividGreen,
        levels: [
          { x: 24, y: 60, levelNum: 1, label: 'Grand Alley', isBoss: false },
          { x: 72, y: 48, levelNum: 2, label: 'Monet\'s Studio', isBoss: false },
          { x: 120, y: 60, levelNum: 3, label: 'Birthday Garden', isBoss: false },
          { x: 168, y: 44, levelNum: 4, label: 'La Brume', isBoss: true },
        ],
      },
    ];

    // Draw garden paths between world nodes
    this.pathGraphics = this.add.graphics();
    this.pathGraphics.lineStyle(2, 0x556655, 0.4);
    for (let i = 0; i < this.worldNodes.length - 1; i++) {
      const a = this.worldNodes[i];
      const b = this.worldNodes[i + 1];
      this.pathGraphics.lineBetween(a.x, a.y, b.x, b.y);
    }
    // Close the loop path
    const first = this.worldNodes[0];
    const last = this.worldNodes[this.worldNodes.length - 1];
    this.pathGraphics.lineBetween(last.x, last.y, first.x, first.y);

    // Node graphics
    this.nodeGraphics = this.add.graphics();
    this.drawWorldNodes();

    // Character sprite (waddles between nodes)
    const charTexture = gm.selectedCharacter === 'zacko' ? 'zacko' : 'poppleton';
    this.characterSprite = this.add.sprite(
      this.worldNodes[this.selectedWorld].x,
      this.worldNodes[this.selectedWorld].y - 14,
      charTexture,
    ).setScale(1.5).setDepth(10);

    // Title
    this.titleText = this.add.text(GAME_WIDTH / 2, 12, 'Jardin des Frenchies', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#dec87a',
    }).setOrigin(0.5).setDepth(20);

    // Prompt
    this.promptText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 10, 'Select a world', {
      fontSize: '5px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5).setDepth(20);

    // Level selection container (hidden initially)
    this.levelContainer = this.add.container(0, 0).setVisible(false).setDepth(15);

    // Find current world (default to first unlocked)
    this.selectedWorld = 0;
    for (let i = this.worldNodes.length - 1; i >= 0; i--) {
      if (gm.isWorldUnlocked(this.worldNodes[i].worldNum)) {
        this.selectedWorld = i;
        break;
      }
    }
    this.selectedWorld = Math.min(this.selectedWorld, 0); // Start at world 1

    this.updateCharacterPosition(false);

    // Play title music on world map (continues from character select if already playing)
    AudioManager.getInstance().playMusic('title');

    // Input
    this.setupInput();
  }

  private drawWorldNodes(): void {
    const gm = GameManager.instance;
    this.nodeGraphics.clear();

    // Clear old labels
    this.worldLabels.forEach(t => t.destroy());
    this.worldLabels = [];
    this.completionStars.forEach(t => t.destroy());
    this.completionStars = [];

    for (const node of this.worldNodes) {
      const isUnlocked = gm.isWorldUnlocked(node.worldNum);
      const isCompleted = gm.isWorldCompleted(node.worldNum);

      // Node circle
      const color = isUnlocked ? node.color : PALETTE.fog;
      this.nodeGraphics.fillStyle(color, isUnlocked ? 1 : 0.4);
      this.nodeGraphics.fillCircle(node.x, node.y, 12);

      // Border
      if (this.worldNodes[this.selectedWorld] === node && this.mode === 'world') {
        this.nodeGraphics.lineStyle(1, 0xffffff);
        this.nodeGraphics.strokeCircle(node.x, node.y, 14);
      }

      // World number inside circle
      const numText = this.add.text(node.x, node.y, `${node.worldNum}`, {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: isUnlocked ? '#ffffff' : '#666666',
      }).setOrigin(0.5).setDepth(5);
      this.worldLabels.push(numText);

      // World label below
      const labelText = this.add.text(node.x, node.y + 18, node.label, {
        fontSize: '4px',
        fontFamily: 'monospace',
        color: isUnlocked ? '#cccccc' : '#555555',
      }).setOrigin(0.5).setDepth(5);
      this.worldLabels.push(labelText);

      // Completion star
      if (isCompleted) {
        const star = this.add.text(node.x + 14, node.y - 14, '*', {
          fontSize: '8px',
          fontFamily: 'monospace',
          color: '#ffdd44',
        }).setOrigin(0.5).setDepth(6);
        this.completionStars.push(star);
      }
    }
  }

  private setupInput(): void {
    const keys = this.input.keyboard!;

    const leftKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const upKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const aKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const dKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    const wKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const sKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const enterKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const escKey = keys.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    leftKey.on('down', () => this.navigate(-1));
    aKey.on('down', () => this.navigate(-1));
    rightKey.on('down', () => this.navigate(1));
    dKey.on('down', () => this.navigate(1));
    upKey.on('down', () => this.navigate(-1));
    wKey.on('down', () => this.navigate(-1));
    downKey.on('down', () => this.navigate(1));
    sKey.on('down', () => this.navigate(1));

    enterKey.on('down', () => this.confirm());
    escKey.on('down', () => this.goBack());
  }

  private navigate(direction: number): void {
    const gm = GameManager.instance;

    if (this.mode === 'world') {
      const newIndex = Phaser.Math.Clamp(
        this.selectedWorld + direction,
        0,
        this.worldNodes.length - 1,
      );

      // Only allow selecting unlocked worlds
      if (gm.isWorldUnlocked(this.worldNodes[newIndex].worldNum)) {
        this.selectedWorld = newIndex;
        this.drawWorldNodes();
        this.updateCharacterPosition(true);
        AudioManager.getInstance().playSFX('menuSelect');
      }
    } else if (this.mode === 'level') {
      const world = this.worldNodes[this.selectedWorld];
      const newLevel = Phaser.Math.Clamp(
        this.selectedLevel + direction,
        0,
        world.levels.length - 1,
      );

      // Can only select levels that are unlocked (previous level completed, or first level)
      if (this.isLevelUnlocked(world.worldNum, world.levels[newLevel].levelNum)) {
        this.selectedLevel = newLevel;
        this.drawLevelNodes();
        AudioManager.getInstance().playSFX('menuSelect');
      }
    }
  }

  private confirm(): void {
    AudioManager.getInstance().playSFX('menuConfirm');
    if (this.mode === 'world') {
      this.mode = 'level';
      this.selectedLevel = 0;
      this.showLevelSelect();
    } else if (this.mode === 'level') {
      this.launchLevel();
    }
  }

  private goBack(): void {
    if (this.mode === 'level') {
      this.mode = 'world';
      this.hideLevelSelect();
      this.drawWorldNodes();
      this.promptText.setText('Select a world');
    }
  }

  private showLevelSelect(): void {
    const world = this.worldNodes[this.selectedWorld];
    this.levelContainer.setVisible(true);

    // Dim the background
    const dimBg = this.add.graphics();
    dimBg.fillStyle(0x000000, 0.7);
    dimBg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.levelContainer.add(dimBg);

    // World title
    const worldTitle = this.add.text(GAME_WIDTH / 2, 24, `World ${world.worldNum}: ${world.label}`, {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#dec87a',
    }).setOrigin(0.5);
    this.levelContainer.add(worldTitle);

    this.drawLevelNodes();
    this.promptText.setText('Select a level');
  }

  private drawLevelNodes(): void {
    const gm = GameManager.instance;
    const world = this.worldNodes[this.selectedWorld];

    // Clear old level labels
    this.levelLabels.forEach(t => t.destroy());
    this.levelLabels = [];

    for (let i = 0; i < world.levels.length; i++) {
      const level = world.levels[i];
      const isUnlocked = this.isLevelUnlocked(world.worldNum, level.levelNum);
      const isCompleted = gm.isLevelCompleted(world.worldNum, level.levelNum);
      const isSelected = i === this.selectedLevel;

      const y = 50 + i * 36;
      const x = GAME_WIDTH / 2;

      // Level box
      const boxG = this.add.graphics();
      const boxColor = isSelected ? 0xdec87a : (isUnlocked ? 0x555555 : 0x333333);
      boxG.fillStyle(boxColor, isSelected ? 0.3 : 0.2);
      boxG.fillRect(24, y - 8, GAME_WIDTH - 48, 28);
      if (isSelected) {
        boxG.lineStyle(1, 0xdec87a);
        boxG.strokeRect(24, y - 8, GAME_WIDTH - 48, 28);
      }
      this.levelContainer.add(boxG);

      // Level number and name
      const prefix = level.isBoss ? 'BOSS: ' : `${world.worldNum}-${level.levelNum}: `;
      const label = this.add.text(32, y, prefix + level.label, {
        fontSize: '5px',
        fontFamily: 'monospace',
        color: isUnlocked ? (isSelected ? '#ffffff' : '#aaaaaa') : '#555555',
      }).setDepth(16);
      this.levelContainer.add(label);
      this.levelLabels.push(label);

      // Completion indicator
      if (isCompleted) {
        const checkMark = this.add.text(GAME_WIDTH - 36, y, '[OK]', {
          fontSize: '5px',
          fontFamily: 'monospace',
          color: '#44ff44',
        }).setDepth(16);
        this.levelContainer.add(checkMark);
        this.levelLabels.push(checkMark);
      } else if (!isUnlocked) {
        const lockIcon = this.add.text(GAME_WIDTH - 36, y, '[--]', {
          fontSize: '5px',
          fontFamily: 'monospace',
          color: '#555555',
        }).setDepth(16);
        this.levelContainer.add(lockIcon);
        this.levelLabels.push(lockIcon);
      }
    }
  }

  private hideLevelSelect(): void {
    this.levelContainer.removeAll(true);
    this.levelContainer.setVisible(false);
  }

  private isLevelUnlocked(worldNum: number, levelNum: number): boolean {
    const gm = GameManager.instance;
    if (levelNum === 1) return gm.isWorldUnlocked(worldNum);
    return gm.isLevelCompleted(worldNum, levelNum - 1);
  }

  private launchLevel(): void {
    const world = this.worldNodes[this.selectedWorld];
    const level = world.levels[this.selectedLevel];
    const gm = GameManager.instance;

    gm.currentWorld = world.worldNum;
    gm.currentLevel = level.levelNum;

    // Determine scene key
    const sceneKey = this.getSceneKey(world.worldNum, level.levelNum, level.isBoss);

    // Check if scene exists
    if (this.scene.manager.getScene(sceneKey)) {
      this.scene.start(sceneKey, { character: gm.selectedCharacter });
    } else {
      // Fall back to TestLevel for levels not yet implemented
      this.scene.start('TestLevel', { character: gm.selectedCharacter });
    }
  }

  private getSceneKey(worldNum: number, levelNum: number, isBoss: boolean): string {
    if (isBoss) {
      return `World${worldNum}Boss`;
    }
    return `World${worldNum}Level${levelNum}`;
  }

  private updateCharacterPosition(animate: boolean): void {
    const node = this.worldNodes[this.selectedWorld];
    const targetX = node.x;
    const targetY = node.y - 14;

    if (animate) {
      this.tweens.add({
        targets: this.characterSprite,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Sine.easeInOut',
      });
    } else {
      this.characterSprite.setPosition(targetX, targetY);
    }
  }
}
