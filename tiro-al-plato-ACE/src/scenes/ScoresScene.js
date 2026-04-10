import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { sceneKeys } from './sceneKeys.js';

export class ScoresScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.scores);
    this.background = null;
    this.layout = null;
    this.onResize = null;
    this.score = 0;
    this.duration = 0;
  }

  init(data) {
    this.background = null;
    this.layout = null;
    this.onResize = null;
    this.score = data?.score ?? this.registry.get('lastScore') ?? 0;
    this.duration = data?.duration ?? this.registry.get('lastDuration') ?? 0;
  }

  create() {
    this.background = this.add.image(0, 0, textureKeys.background).setOrigin(0.5);

    const panel = this.add.rectangle(0, 0, 540, 280, 0x102236, 0.84)
      .setStrokeStyle(2, 0xf5f1d6, 0.85);

    const title = this.add.text(0, -82, 'Puntuaciones', {
      fontFamily: 'Trebuchet MS',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const summary = this.add.text(0, -18, `Ultima ronda: ${this.score} puntos en ${this.duration}s`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const replayButton = this.createButton('Jugar otra vez', () => {
      this.scene.start(sceneKeys.preloader, {
        nextScene: sceneKeys.game
      });
    });
    replayButton.setY(54);

    const menuButton = this.createButton('Volver al menu', () => {
      this.scene.start(sceneKeys.mainMenu);
    });
    menuButton.setY(114);

    this.layout = this.add.container(0, 0, [panel, title, summary, replayButton, menuButton]);

    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.handleResize(this.scale.gameSize);
  }

  createButton(label, onClick) {
    const background = this.add.rectangle(0, 0, 250, 42, 0xe5b75c, 1)
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

  handleResize(gameSize) {
    const { width, height } = gameSize;

    if (this.background?.texture) {
      const scale = Math.max(width / this.background.width, height / this.background.height);
      this.background.setPosition(width / 2, height / 2);
      this.background.setScale(scale);
    }

    if (this.layout) {
      this.layout.setPosition(width / 2, height / 2);
    }
  }

  handleShutdown() {
    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }
  }
}