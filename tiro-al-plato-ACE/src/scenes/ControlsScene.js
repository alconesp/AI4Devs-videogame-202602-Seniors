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
    const panel = this.add.rectangle(0, 0, 620, 470, 0x102236, 0.84)
      .setStrokeStyle(2, 0xf5f1d6, 0.88);

    const accent = this.add.rectangle(0, -184, 500, 30, 0xe5b75c, 0.12)
      .setStrokeStyle(1, 0xe5b75c, 0.42);

    const title = this.add.text(0, -184, 'Controles', {
      fontFamily: 'Trebuchet MS',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const summary = this.add.text(0, -140, 'Aprende el disparo en segundos: cada flecha mueve tu tiro a una zona concreta del plato.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 490 }
    }).setOrigin(0.5);

    const leftShotGuide = this.createControlGuide({
      y: -44,
      icon: '←',
      action: 'Dispara al plato cuando entra en la zona roja izquierda.',
      accentColor: 0xe5b75c
    });

    const rightShotGuide = this.createControlGuide({
      y: 42,
      icon: '→',
      action: 'Dispara al plato cuando entra en la zona roja derecha.',
      accentColor: 0xf2cb7d
    });

    const supportText = this.add.text(0, 120, 'ENTER finaliza la ronda actual · ESC vuelve al menu principal', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f5f1d6',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    const tips = this.add.text(0, 156, 'Acertar dentro de la zona roja suma puntos. Si encadenas una ronda perfecta, aparece la nave final con bonus extra.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#f5f1d6',
      align: 'center',
      wordWrap: { width: 470 }
    }).setOrigin(0.5);

    const menuButton = this.createButton('Volver al menú', () => {
      this.scene.start(sceneKeys.mainMenu);
    });
    menuButton.setY(198);

    this.layout = this.add.container(0, 0, [
      panel,
      accent,
      title,
      summary,
      leftShotGuide,
      rightShotGuide,
      supportText,
      tips,
      menuButton
    ]);
  }

  createControlGuide({ y, icon, action, accentColor }) {
    const row = this.add.container(0, y);

    const card = this.add.rectangle(0, 0, 500, 70, 0x0b1724, 0.72)
      .setStrokeStyle(2, accentColor, 0.4);

    const keycapShadow = this.add.rectangle(-184, 4, 62, 46, 0x06101a, 0.5)
      .setStrokeStyle(1, 0x06101a, 0.8);

    const keycap = this.add.rectangle(-184, 0, 62, 46, 0xf5f1d6, 1)
      .setStrokeStyle(3, 0xe5b75c, 1);

    const keycapLabel = this.add.text(-184, 0, icon, {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#0f2233'
    }).setOrigin(0.5);

    const actionText = this.add.text(-128, 0, action, {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#dbe9f4',
      wordWrap: { width: 330 }
    }).setOrigin(0, 0.5);

    row.add([card, keycapShadow, keycap, keycapLabel, actionText]);
    return row;
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
      this.layout.setScale(Math.min((width - 28) / 620, (height - 24) / 520, 1));
    }
  }

  handleShutdown() {
    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }
  }
}