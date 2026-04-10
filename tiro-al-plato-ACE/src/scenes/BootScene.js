import Phaser from 'phaser';
import { sceneKeys } from './sceneKeys.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.boot);
  }

  create() {
    this.scene.start(sceneKeys.preloader, {
      nextScene: sceneKeys.mainMenu
    });
  }
}