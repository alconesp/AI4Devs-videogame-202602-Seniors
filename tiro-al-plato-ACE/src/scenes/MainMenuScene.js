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
    this.titleText = null;
    this.subtitleText = null;
    this.statusText = null;
    this.playButton = null;
    this.rankingButton = null;
    this.controlsButton = null;
    this.onResize = null;
  }

  init() {
    this.background = null;
    this.player = null;
    this.menuPanel = null;
    this.titleText = null;
    this.subtitleText = null;
    this.statusText = null;
    this.playButton = null;
    this.rankingButton = null;
    this.controlsButton = null;
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
    const outerGlow = this.add.rectangle(0, 0, 588, 448, 0x09131f, 0.46)
      .setStrokeStyle(2, 0x36597a, 0.55);

    const panel = this.add.rectangle(0, 0, 548, 408, 0x102236, 0.84)
      .setStrokeStyle(2, 0xf5f1d6, 0.88);

    const headerBar = this.add.rectangle(0, -126, 472, 36, 0xe5b75c, 0.12)
      .setStrokeStyle(1, 0xe5b75c, 0.45);

    this.titleText = this.add.text(0, 0, 'Tiro al Plato', {
      fontFamily: 'Trebuchet MS',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#f5f1d6',
      stroke: '#0f2233',
      strokeThickness: 6
    });

    this.subtitleText = this.add.text(0, 0, 'Elige tu siguiente tiro y entra directo a la accion.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 420 }
    });

    this.statusText = this.add.text(0, 0, this.getStatusMessage(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#dbe9f4',
      align: 'center',
      wordWrap: { width: 410 }
    });

    this.playButton = this.createMenuButton('Nueva Partida', () => {
      this.scene.start(sceneKeys.preloader, {
        nextScene: sceneKeys.game
      });
    });

    this.rankingButton = this.createMenuButton('Ranking', () => {
      this.scene.start(sceneKeys.ranking);
    });

    this.controlsButton = this.createMenuButton('Controles', () => {
      this.scene.start(sceneKeys.controls);
    });

    this.menuPanel = this.add.container(0, 0, [
      outerGlow,
      panel,
      headerBar,
      this.titleText,
      this.subtitleText,
      this.statusText,
      this.playButton,
      this.rankingButton,
      this.controlsButton
    ]).setDepth(2);

    this.titleText.setY(-126);
    this.titleText.setOrigin(0.5);
    this.subtitleText.setY(-72);
    this.subtitleText.setOrigin(0.5);
    this.statusText.setY(-18);
    this.statusText.setOrigin(0.5);
    this.playButton.setY(46);
    this.rankingButton.setY(108);
    this.controlsButton.setY(170);
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

  createMenuButton(label, onClick) {
    const background = this.add.rectangle(0, 0, 286, 46, 0xe5b75c, 1)
      .setStrokeStyle(2, 0x0f2233, 0.9)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0f2233'
    }).setOrigin(0.5);

    background.on('pointerover', () => background.setFillStyle(0xf2cb7d, 1));
    background.on('pointerout', () => background.setFillStyle(0xe5b75c, 1));
    background.on('pointerup', onClick);

    return this.add.container(0, 0, [background, text]);
  }

  getStatusMessage() {
    const bestScore = this.registry.get('bestScore');
    const lastScore = this.registry.get('lastScore');

    if (typeof bestScore === 'number') {
      return `Mejor marca de la sesion: ${bestScore} puntos${typeof lastScore === 'number' ? ` · Ultima ronda: ${lastScore}` : ''}`;
    }

    if (typeof lastScore === 'number') {
      return `Ultima puntuacion registrada: ${lastScore} puntos`;
    }

    return '';
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;

    if (this.background?.texture) {
      const scale = Math.max(width / this.background.width, height / this.background.height);
      this.background.setPosition(width / 2, height / 2);
      this.background.setScale(scale);
    }

    if (this.menuPanel) {
      this.menuPanel.setPosition(width / 2, height / 2);
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