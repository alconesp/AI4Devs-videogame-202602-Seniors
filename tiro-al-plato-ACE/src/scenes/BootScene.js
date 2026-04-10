import Phaser from 'phaser';
import { textureKeys, texturePaths } from '../assets/manifest.js';
import { sceneKeys } from './sceneKeys.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.boot);
  }

  preload() {
    this.load.image(textureKeys.background, texturePaths[textureKeys.background]);
  }

  create() {
    this.scene.start(sceneKeys.mainMenu);
  }
}