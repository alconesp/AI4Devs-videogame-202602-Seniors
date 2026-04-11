import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { sceneKeys } from './sceneKeys.js';

export class ControlsScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.controls);
    this.background = null;
    this.layout = null;
    this.onResize = null;
  }

  init() {
    this.background = null;
    this.layout = null;
    this.onResize = null;
  }

  create() {
    this.createBackground();
    this.createOverlay();

    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.handleResize(this.scale.gameSize);
  }

  createBackground() {
    this.background = this.add.image(0, 0, textureKeys.background).setOrigin(0.5);
  }

  createOverlay() {
    const panel = this.add.rectangle(0, 0, 580, 430, 0x102236, 0.84)
      .setStrokeStyle(2, 0xf5f1d6, 0.88);

    const accent = this.add.rectangle(0, -152, 490, 30, 0xe5b75c, 0.12)
      .setStrokeStyle(1, 0xe5b75c, 0.42);

    const title = this.add.text(0, -152, 'Controles', {
      fontFamily: 'Trebuchet MS',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const summary = this.add.text(0, -104, 'Domina la ronda con cuatro acciones directas y sin menus intermedios.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 460 }
    }).setOrigin(0.5);

    const controls = this.add.text(0, -12, [
      'FLECHA IZQ  · Dispara a la zona izquierda',
      'FLECHA DER  · Dispara a la zona derecha',
      'ENTER       · Finaliza la ronda actual',
      'ESC         · Regresa al menu principal'
    ], {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#dbe9f4',
      align: 'left',
      lineSpacing: 14
    }).setOrigin(0.5);

    const tips = this.add.text(0, 92, 'Acertar los platos dentro de la zona roja suma puntos. Si completas la secuencia perfecta, aparece la nave final con bonus extra.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#f5f1d6',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    const menuButton = this.createButton('Volver al menu', () => {
      this.scene.start(sceneKeys.mainMenu);
    });
    menuButton.setY(186);

    this.layout = this.add.container(0, 0, [
      panel,
      accent,
      title,
      summary,
      controls,
      tips,
      menuButton
    ]);
  }

  createButton(label, onClick) {
    const background = this.add.rectangle(0, 0, 270, 42, 0xe5b75c, 1)
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