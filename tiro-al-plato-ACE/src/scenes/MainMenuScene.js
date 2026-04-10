import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { PlayerPrefab } from '../prefabs/PlayerPrefab.js';
import { sceneKeys } from './sceneKeys.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.mainMenu);
    this.background = null;
    this.player = null;
    this.menuPanel = null;
    this.playButton = null;
    this.statusText = null;
    this.onResize = null;
  }

  init() {
    this.background = null;
    this.player = null;
    this.menuPanel = null;
    this.playButton = null;
    this.statusText = null;
    this.onResize = null;
  }

  create() {
    this.createBackground();
    this.createPlayer();
    this.createOverlay();

    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.handleResize(this.scale.gameSize);
  }

  createBackground() {
    this.background = this.add.image(0, 0, textureKeys.background).setOrigin(0.5).setDepth(0);
  }

  createOverlay() {
    const title = this.add.text(0, 0, 'Tiro al Plato ACE', {
      fontFamily: 'Trebuchet MS',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#f5f1d6',
      stroke: '#0f2233',
      strokeThickness: 6
    });

    const subtitle = this.add.text(0, 0, 'Entorno Vite + Phaser 3 listo para iterar.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    });

    this.statusText = this.add.text(0, 0, this.getStatusMessage(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#dbe9f4',
      align: 'center'
    });

    this.playButton = this.createPlayButton();

    this.menuPanel = this.add.container(0, 0, [
      this.add.rectangle(0, 0, 520, 240, 0x102236, 0.78).setStrokeStyle(2, 0xf5f1d6, 0.85),
      title,
      subtitle,
      this.statusText,
      this.playButton
    ]).setDepth(2);

    title.setY(-58);
    title.setOrigin(0.5);
    subtitle.setY(-2);
    subtitle.setOrigin(0.5);
    this.statusText.setY(46);
    this.statusText.setOrigin(0.5);
    this.playButton.setY(98);
  }

  createPlayer() {
    this.player = new PlayerPrefab(this, 0, 0, textureKeys.playerNeutral1);
    this.player.setDepth(1);
    this.player.playLoop([
      textureKeys.playerNeutral1,
      textureKeys.playerVictory2,
      textureKeys.playerNeutral1,
      textureKeys.playerNeutral2,
      textureKeys.playerNeutral1
    ]);
  }

  createPlayButton() {
    const background = this.add.rectangle(0, 0, 240, 46, 0xe5b75c, 1)
      .setStrokeStyle(2, 0x0f2233, 0.9)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, 'Entrar en partida', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0f2233'
    }).setOrigin(0.5);

    background.on('pointerover', () => background.setFillStyle(0xf2cb7d, 1));
    background.on('pointerout', () => background.setFillStyle(0xe5b75c, 1));
    background.on('pointerup', () => {
      this.scene.start(sceneKeys.preloader, {
        nextScene: sceneKeys.game
      });
    });

    return this.add.container(0, 0, [background, label]);
  }

  getStatusMessage() {
    const lastScore = this.registry.get('lastScore');

    if (typeof lastScore === 'number') {
      return `Ultima puntuacion registrada: ${lastScore}`;
    }

    return 'Flujo activo: Boot -> Menu -> Partida -> Puntuaciones';
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;

    if (this.background?.texture) {
      const scale = Math.max(width / this.background.width, height / this.background.height);
      this.background.setPosition(width / 2, height / 2);
      this.background.setScale(scale);
    }

    if (this.menuPanel) {
      this.menuPanel.setPosition(width / 2, height * 0.22);
    }

    if (this.player) {
      this.player.resizeToCover(width, height);
    }
  }

  handleShutdown() {
    this.player?.stopAnimation();

    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }
  }
}