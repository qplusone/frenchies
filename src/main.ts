import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './config/GameConfig';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { CharacterSelect } from './scenes/CharacterSelect';
import { TestLevel } from './scenes/TestLevel';
import { HUD } from './ui/HUD';
import { TitleScreen } from './scenes/TitleScreen';
import { Ending } from './scenes/Ending';
import { Gallery } from './scenes/Gallery';
import { PauseMenu } from './scenes/PauseMenu';
import { WorldMap } from './scenes/WorldMap';
import { World1Level1 } from './scenes/levels/World1Level1';
import { World1Level2 } from './scenes/levels/World1Level2';
import { World1Level3 } from './scenes/levels/World1Level3';
import { World1Boss } from './scenes/levels/World1Boss';
import { World2Level1 } from './scenes/levels/World2Level1';
import { World2Level2 } from './scenes/levels/World2Level2';
import { World2Level3 } from './scenes/levels/World2Level3';
import { World2Boss } from './scenes/levels/World2Boss';
import { World3Level1 } from './scenes/levels/World3Level1';
import { World3Level2 } from './scenes/levels/World3Level2';
import { World3Level3 } from './scenes/levels/World3Level3';
import { World3Boss } from './scenes/levels/World3Boss';
import { World4Level1 } from './scenes/levels/World4Level1';
import { World4Level2 } from './scenes/levels/World4Level2';
import { World4Level3 } from './scenes/levels/World4Level3';
import { World4Boss } from './scenes/levels/World4Boss';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      debug: false,
    },
  },
  scene: [
    Boot, Preloader, TitleScreen, CharacterSelect, WorldMap, TestLevel, HUD, PauseMenu, Ending, Gallery,
    World1Level1, World1Level2, World1Level3, World1Boss,
    World2Level1, World2Level2, World2Level3, World2Boss,
    World3Level1, World3Level2, World3Level3, World3Boss,
    World4Level1, World4Level2, World4Level3, World4Boss,
  ],
  backgroundColor: '#1a1a2e',
};

const game = new Phaser.Game(config);

// Expose for dev tools / testing
(window as unknown as Record<string, unknown>).__PHASER_GAME__ = game;
