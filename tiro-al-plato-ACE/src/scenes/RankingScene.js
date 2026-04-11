import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { MAX_RANKING_ENTRIES, getStoredRankingEntries } from '../game/rankingStorage.js';
import { sceneKeys } from './sceneKeys.js';

const PANEL_WIDTH = 620;
const PANEL_HEIGHT = 560;
const ROW_HEIGHT = 48;
const ROW_START_Y = -64;

export class RankingScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.ranking);
    this.background = null;
    this.layout = null;
    this.onResize = null;
    this.rankingEntries = [];
  }

  init() {
    this.background = null;
    this.layout = null;
    this.onResize = null;
    this.rankingEntries = getStoredRankingEntries();
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
    const outerGlow = this.add.rectangle(0, 0, PANEL_WIDTH + 36, PANEL_HEIGHT + 36, 0x09131f, 0.44)
      .setStrokeStyle(2, 0x36597a, 0.52);

    const panel = this.add.rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 0x102236, 0.84)
      .setStrokeStyle(2, 0xf5f1d6, 0.88);

    const accent = this.add.rectangle(0, -208, 500, 34, 0xe5b75c, 0.12)
      .setStrokeStyle(1, 0xe5b75c, 0.42);

    const title = this.add.text(0, -208, 'Ranking', {
      fontFamily: 'Trebuchet MS',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -164, this.getSubtitle(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 470 }
    }).setOrigin(0.5);

    const headerRow = this.add.container(0, -118, [
      this.add.rectangle(0, 0, 500, 34, 0xe5b75c, 0.16)
        .setStrokeStyle(1, 0xe5b75c, 0.3),
      this.add.text(-208, 0, '#', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f5f1d6'
      }).setOrigin(0.5),
      this.add.text(-116, 0, 'Jugador', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f5f1d6'
      }).setOrigin(0.5),
      this.add.text(80, 0, 'Puntos', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f5f1d6'
      }).setOrigin(0.5),
      this.add.text(202, 0, 'Tiempo', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f5f1d6'
      }).setOrigin(0.5)
    ]);

    const rows = this.createRankingRows();

    const footer = this.add.text(0, 188, this.getFooterText(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#dbe9f4',
      align: 'center',
      wordWrap: { width: 470 }
    }).setOrigin(0.5);

    const menuButton = this.createButton('Volver al menu', () => {
      this.scene.start(sceneKeys.mainMenu);
    });
    menuButton.setY(232);

    this.layout = this.add.container(0, 0, [
      outerGlow,
      panel,
      accent,
      title,
      subtitle,
      headerRow,
      ...rows,
      footer,
      menuButton
    ]);
  }

  createRankingRows() {
    const visibleEntries = this.getVisibleEntries();

    return visibleEntries.map((entry, index) => {
      const y = ROW_START_Y + (index * ROW_HEIGHT);
      const rowTint = index % 2 === 0 ? 0x132b44 : 0x0f2233;
      const rowAlpha = entry.isPlaceholder ? 0.3 : 0.62;
      const textColor = entry.isPlaceholder ? '#d0d7de' : '#ffffff';

      return this.add.container(0, y, [
        this.add.rectangle(0, 0, 500, 38, rowTint, rowAlpha)
          .setStrokeStyle(1, 0xf5f1d6, entry.isPlaceholder ? 0.18 : 0.24),
        this.add.text(-208, 0, `${index + 1}`, {
          fontFamily: 'Trebuchet MS',
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#f5f1d6'
        }).setOrigin(0.5),
        this.add.text(-116, 0, entry.initials, {
          fontFamily: 'Trebuchet MS',
          fontSize: '20px',
          fontStyle: 'bold',
          color: textColor
        }).setOrigin(0.5),
        this.add.text(80, 0, this.formatScore(entry.score), {
          fontFamily: 'Trebuchet MS',
          fontSize: '20px',
          fontStyle: 'bold',
          color: textColor
        }).setOrigin(0.5),
        this.add.text(202, 0, this.formatDuration(entry.duration), {
          fontFamily: 'Trebuchet MS',
          fontSize: '18px',
          color: entry.isPlaceholder ? '#c9d3dc' : '#dbe9f4'
        }).setOrigin(0.5)
      ]);
    });
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

  getVisibleEntries() {
    const filledEntries = this.rankingEntries.slice(0, MAX_RANKING_ENTRIES).map((entry) => ({
      ...entry,
      isPlaceholder: false
    }));

    while (filledEntries.length < MAX_RANKING_ENTRIES) {
      filledEntries.push({
        initials: 'AAA',
        score: 0,
        duration: 0,
        isPlaceholder: true
      });
    }

    return filledEntries;
  }

  getSubtitle() {
    if (this.rankingEntries.length > 0) {
      return 'Tus mejores rondas quedan registradas aqui para que puedas perseguir el siguiente record.';
    }

    return 'Aun no hay datos guardados. Tus futuros records apareceran en este panel.';
  }

  getFooterText() {
    if (this.rankingEntries.length > 0) {
      const bestEntry = this.rankingEntries[0];
      return `Mejor marca actual: ${bestEntry.initials} - ${this.formatScore(bestEntry.score)} en ${this.formatDuration(bestEntry.duration)}`;
    }

    return 'La tabla muestra placeholders hasta que completes tu primera ronda.';
  }

  formatScore(score) {
    return String(Math.max(0, score)).padStart(3, '0');
  }

  formatDuration(duration) {
    if (!duration) {
      return '-- s';
    }

    return `${duration}s`;
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