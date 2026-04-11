import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { ControlsScene } from '../scenes/ControlsScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { PreloaderScene } from '../scenes/PreloaderScene.js';
import { RankingScene } from '../scenes/RankingScene.js';
import { ScoresScene } from '../scenes/ScoresScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#09131f',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  scene: [BootScene, PreloaderScene, MainMenuScene, GameScene, RankingScene, ControlsScene, ScoresScene]
};