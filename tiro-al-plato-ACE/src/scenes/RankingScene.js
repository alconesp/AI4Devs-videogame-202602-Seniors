import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { MAX_RANKING_ENTRIES, getStoredRankingEntries } from '../game/rankingStorage.js';
import { sceneKeys } from './sceneKeys.js';

const PANEL_WIDTH = 620;
const PANEL_HEIGHT = 820;
const ROW_HEIGHT = 34;
const ROW_START_Y = -124;

export class RankingScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.ranking);
    this.background = null;
    this.layout = null;
    this.layoutContent = null;
    this.onResize = null;
    this.rankingEntries = [];
    this.hasPlayerEntries = false;
    this.highlightEntry = null;
    this.highlightTween = null;
    this.popupTween = null;
  }

  init(data) {
    this.background = null;
    this.layout = null;
    this.layoutContent = null;
    this.onResize = null;
    this.rankingEntries = getStoredRankingEntries();
    this.hasPlayerEntries = this.rankingEntries.some((entry) => !entry.isDefault);
    this.highlightEntry = data?.highlightEntry ?? this.registry.get('pendingRankingHighlightEntry') ?? null;
    this.highlightTween = null;
    this.popupTween = null;
    this.registry.set('pendingRankingHighlightEntry', null);
  }

  create() {
    this.createBackground();
    this.createOverlay();

    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.handleResize(this.scale.gameSize);
    this.animatePopup();
  }

  createBackground() {
    this.background = this.add.image(0, 0, textureKeys.background).setOrigin(0.5);
  }

  createOverlay() {
    const outerGlow = this.add.rectangle(0, 0, PANEL_WIDTH + 36, PANEL_HEIGHT + 36, 0x09131f, 0.44)
      .setStrokeStyle(2, 0x36597a, 0.52);

    const panel = this.add.rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 0x102236, 0.84)
      .setStrokeStyle(2, 0xf5f1d6, 0.88);

    const accent = this.add.rectangle(0, -344, 500, 34, 0xe5b75c, 0.12)
      .setStrokeStyle(1, 0xe5b75c, 0.42);

    const title = this.add.text(0, -344, 'Ranking', {
      fontFamily: 'Trebuchet MS',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -300, this.getSubtitle(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 470 }
    }).setOrigin(0.5);

    const headerRow = this.add.container(0, -170, [
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

    const footer = this.add.text(0, 274, this.getFooterText(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#dbe9f4',
      align: 'center',
      wordWrap: { width: 470 }
    }).setOrigin(0.5);

    const menuButton = this.createButton('Volver al menú', () => {
      this.scene.start(sceneKeys.mainMenu);
    });
    menuButton.setY(336);

    this.layoutContent = this.add.container(0, 0, [
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

    this.layout = this.add.container(0, 0, [this.layoutContent]);
    this.layoutContent.setScale(0.94);
  }

  animatePopup() {
    if (!this.layoutContent) {
      return;
    }

    if (this.popupTween) {
      this.popupTween.remove();
    }

    this.layoutContent.setScale(0.94);
    this.layoutContent.setAlpha(0);
    this.popupTween = this.tweens.add({
      targets: this.layoutContent,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 320,
      ease: 'Cubic.Out'
    });
  }

  createRankingRows() {
    const visibleEntries = this.getVisibleEntries();

    return visibleEntries.map((entry, index) => {
      const y = ROW_START_Y + (index * ROW_HEIGHT);
      const isHighlighted = this.isHighlightedEntry(entry);
      const rowTint = index % 2 === 0 ? 0x132b44 : 0x0f2233;
      const isMutedRow = entry.isPlaceholder || entry.isDefault;
      const rowAlpha = isHighlighted ? 0.88 : (entry.isPlaceholder ? 0.3 : (entry.isDefault ? 0.42 : 0.62));
      const textColor = isHighlighted ? '#fff6c7' : (isMutedRow ? '#d0d7de' : '#ffffff');
      const accentColor = isHighlighted ? 0xe5b75c : 0xf5f1d6;
      const secondaryTextColor = isHighlighted ? '#ffe18f' : (isMutedRow ? '#c9d3dc' : '#dbe9f4');
      const rowBackground = this.add.rectangle(0, 0, 500, 38, isHighlighted ? 0x5b4313 : rowTint, rowAlpha)
        .setStrokeStyle(isHighlighted ? 2 : 1, accentColor, isHighlighted ? 0.92 : (entry.isPlaceholder ? 0.18 : 0.24));
      const glow = isHighlighted
        ? this.add.rectangle(0, 0, 510, 46, 0xe5b75c, 0.18)
          .setStrokeStyle(2, 0xffefb0, 0.52)
        : null;
      const rankText = this.add.text(-208, 0, `${index + 1}`, {
          fontFamily: 'Trebuchet MS',
          fontSize: '18px',
          fontStyle: 'bold',
          color: isHighlighted ? '#fff6c7' : '#f5f1d6'
        }).setOrigin(0.5);
      const initialsText = this.add.text(-116, 0, entry.initials, {
          fontFamily: 'Trebuchet MS',
          fontSize: '18px',
          fontStyle: 'bold',
          color: textColor
        }).setOrigin(0.5);
      const scoreText = this.add.text(80, 0, this.formatScore(entry.score), {
          fontFamily: 'Trebuchet MS',
          fontSize: '18px',
          fontStyle: 'bold',
          color: textColor
        }).setOrigin(0.5);
      const durationText = this.add.text(202, 0, this.formatDuration(entry.duration), {
          fontFamily: 'Trebuchet MS',
          fontSize: '17px',
          color: secondaryTextColor
        }).setOrigin(0.5);

      if (isHighlighted) {
        initialsText.setShadow(0, 0, '#ffe18f', 12, true, true);
        scoreText.setShadow(0, 0, '#ffe18f', 12, true, true);
      }

      const rowChildren = glow
        ? [glow, rowBackground, rankText, initialsText, scoreText, durationText]
        : [rowBackground, rankText, initialsText, scoreText, durationText];
      const row = this.add.container(0, y, rowChildren);

      if (glow) {
        this.highlightTween = this.tweens.add({
          targets: glow,
          alpha: 0.52,
          duration: 540,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1
        });
      }

      return row;
    });
  }

  isHighlightedEntry(entry) {
    if (!this.highlightEntry || entry.isPlaceholder) {
      return false;
    }

    return entry.createdAt === this.highlightEntry.createdAt
      && entry.initials === this.highlightEntry.initials
      && entry.score === this.highlightEntry.score;
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
    if (this.hasPlayerEntries) {
      return 'Tus mejores rondas quedan registradas aqui para que puedas perseguir el siguiente record.';
    }

    return 'El ranking arranca con marcas base de la CPU para que nunca quede vacio. Superalas para reclamar el top 10.';
  }

  getFooterText() {
    if (this.hasPlayerEntries) {
      const bestEntry = this.rankingEntries[0];
      return `Mejor marca actual: ${bestEntry.initials} - ${this.formatScore(bestEntry.score)} en ${this.formatDuration(bestEntry.duration)}`;
    }

    const defaultLeader = this.rankingEntries[0];
    return `Marca base actual: ${defaultLeader.initials} - ${this.formatScore(defaultLeader.score)}. Tu siguiente gran ronda puede desplazarla.`;
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
    if (this.popupTween) {
      this.popupTween.remove();
      this.popupTween = null;
    }

    if (this.highlightTween) {
      this.highlightTween.remove();
      this.highlightTween = null;
    }

    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }
  }
}