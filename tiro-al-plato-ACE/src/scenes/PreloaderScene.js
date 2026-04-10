import Phaser from 'phaser';
import { sceneKeys } from './sceneKeys.js';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.preloader);
    this.nextScene = sceneKeys.mainMenu;
    this.nextSceneData = undefined;
    this.transitionTimer = null;
  }

  init(data) {
    this.nextScene = data?.nextScene ?? sceneKeys.mainMenu;
    this.nextSceneData = data?.data;
    this.transitionTimer = null;
  }

  create() {
    const { width, height } = this.scale.gameSize;

    this.add.rectangle(width / 2, height / 2, width, height, 0x09131f, 0.92);
    this.add.text(width / 2, height / 2 - 18, 'Preparando escena', {
      fontFamily: 'Trebuchet MS',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, 'Cargando recursos y estado...', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);

    this.transitionTimer = this.time.delayedCall(180, () => {
      this.scene.start(this.nextScene, this.nextSceneData);
    });
  }

  handleShutdown() {
    if (this.transitionTimer) {
      this.transitionTimer.remove(false);
      this.transitionTimer = null;
    }
  }
}