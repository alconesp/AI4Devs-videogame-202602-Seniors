import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { sceneKeys } from './sceneKeys.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.game);
    this.background = null;
    this.hud = null;
    this.instructions = null;
    this.scoreText = null;
    this.statusText = null;
    this.score = 0;
    this.elapsedSeconds = 0;
    this.roundTimer = null;
    this.onResize = null;
    this.onScore = null;
    this.onFinish = null;
    this.onExitToMenu = null;
  }

  init() {
    this.background = null;
    this.hud = null;
    this.instructions = null;
    this.scoreText = null;
    this.statusText = null;
    this.score = 0;
    this.elapsedSeconds = 0;
    this.roundTimer = null;
    this.onResize = null;
    this.onScore = null;
    this.onFinish = null;
    this.onExitToMenu = null;
  }

  create() {
    this.createBackground();
    this.createHud();
    this.registerSceneEvents();
    this.registerInput();
    this.startRoundTimer();
    this.handleResize(this.scale.gameSize);
    this.updateHud();
  }

  createBackground() {
    this.background = this.add.image(0, 0, textureKeys.background).setOrigin(0.5);
    this.add.rectangle(0, 0, 1, 1, 0x08111a, 0.42).setOrigin(0);
  }

  createHud() {
    this.hud = this.add.container(0, 0);

    const panel = this.add.rectangle(0, 0, 560, 220, 0x102236, 0.82)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xf5f1d6, 0.8);

    const title = this.add.text(0, -70, 'Partida activa', {
      fontFamily: 'Trebuchet MS',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(0, -18, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.statusText = this.add.text(0, 20, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#dbe9f4'
    }).setOrigin(0.5);

    this.instructions = this.add.text(0, 72, 'ESPACIO suma puntos · ENTER finaliza ronda · ESC vuelve al menu', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#f5f1d6',
      align: 'center'
    }).setOrigin(0.5);

    this.hud.add([panel, title, this.scoreText, this.statusText, this.instructions]);
  }

  registerSceneEvents() {
    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  registerInput() {
    this.onScore = () => {
      this.score += 10;
      this.updateHud();
    };

    this.onFinish = () => {
      this.finishRound();
    };

    this.onExitToMenu = () => {
      this.scene.start(sceneKeys.mainMenu);
    };

    this.input.keyboard.on('keydown-SPACE', this.onScore);
    this.input.keyboard.on('keydown-ENTER', this.onFinish);
    this.input.keyboard.on('keydown-ESC', this.onExitToMenu);
  }

  startRoundTimer() {
    this.roundTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.elapsedSeconds += 1;
        this.updateHud();
      }
    });
  }

  finishRound() {
    this.registry.set('lastScore', this.score);
    this.registry.set('lastDuration', this.elapsedSeconds);
    this.scene.start(sceneKeys.scores, {
      score: this.score,
      duration: this.elapsedSeconds
    });
  }

  updateHud() {
    if (this.scoreText) {
      this.scoreText.setText(`Puntuacion: ${this.score}`);
    }

    if (this.statusText) {
      this.statusText.setText(`Tiempo activo: ${this.elapsedSeconds}s`);
    }
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;

    if (this.background?.texture) {
      const scale = Math.max(width / this.background.width, height / this.background.height);
      this.background.setPosition(width / 2, height / 2);
      this.background.setScale(scale);
    }

    if (this.hud) {
      this.hud.setPosition(width / 2, height / 2);
    }
  }

  handleShutdown() {
    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }

    if (this.onScore) {
      this.input.keyboard.off('keydown-SPACE', this.onScore);
      this.onScore = null;
    }

    if (this.onFinish) {
      this.input.keyboard.off('keydown-ENTER', this.onFinish);
      this.onFinish = null;
    }

    if (this.onExitToMenu) {
      this.input.keyboard.off('keydown-ESC', this.onExitToMenu);
      this.onExitToMenu = null;
    }

    if (this.roundTimer) {
      this.roundTimer.remove(false);
      this.roundTimer = null;
    }
  }
}