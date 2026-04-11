import Phaser from 'phaser';
import { applyAudioSettingsToRegistry, loadStoredAudioSettings } from '../game/audioSettings.js';
import { sceneKeys } from './sceneKeys.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.boot);
  }

  create() {
    applyAudioSettingsToRegistry(this.registry, loadStoredAudioSettings());

    this.scene.start(sceneKeys.preloader, {
      nextScene: sceneKeys.mainMenu
    });
  }
}