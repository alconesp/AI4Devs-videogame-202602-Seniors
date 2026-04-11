import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import {
  DEFAULT_INITIALS,
  MAX_RANKING_ENTRIES,
  getStoredRankingEntries,
  saveRankingEntry,
  wouldScoreEnterRanking
} from '../game/rankingStorage.js';
import { sceneKeys } from './sceneKeys.js';

const ARCADE_INITIALS_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class ScoresScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.scores);
    this.background = null;
    this.layout = null;
    this.onResize = null;
    this.score = 0;
    this.duration = 0;
    this.hits = 0;
    this.misses = 0;
    this.hasRoundActivity = false;
    this.qualifiesForRanking = false;
    this.hasSavedRankingEntry = false;
    this.rankingCutoffScore = 0;
    this.rankingInitials = '';
    this.rankingStatusText = null;
    this.rankingBackdrop = null;
    this.rankingModal = null;
    this.rankingInitialsSlots = [];
    this.rankingLetterIndexes = [0, 0, 0];
    this.rankingActiveIndex = 0;
    this.rankingConfirmedCount = 0;
    this.rankingBlinkTween = null;
    this.onPopupKeyDown = null;
  }

  init(data) {
    this.background = null;
    this.layout = null;
    this.onResize = null;
    this.score = data?.score ?? this.registry.get('lastScore') ?? 0;
    this.duration = data?.duration ?? this.registry.get('lastDuration') ?? 0;
    this.hits = data?.hits ?? this.registry.get('lastHits') ?? 0;
    this.misses = data?.misses ?? this.registry.get('lastMisses') ?? 0;
    this.hasRoundActivity = this.score > 0 || this.hits > 0 || this.misses > 0 || this.duration > 0;
    this.rankingCutoffScore = getStoredRankingEntries()[MAX_RANKING_ENTRIES - 1]?.score ?? 0;
    this.qualifiesForRanking = this.hasRoundActivity && wouldScoreEnterRanking(this.score);
    this.hasSavedRankingEntry = false;
    this.rankingInitials = this.normalizeRankingInitials(this.registry.get('lastRankingInitials') ?? '');
    this.rankingStatusText = null;
    this.rankingBackdrop = null;
    this.rankingModal = null;
    this.rankingInitialsSlots = [];
    this.rankingLetterIndexes = this.buildRankingLetterIndexes(this.rankingInitials || DEFAULT_INITIALS);
    this.rankingActiveIndex = 0;
    this.rankingConfirmedCount = 0;
    this.rankingBlinkTween = null;
    this.onPopupKeyDown = null;
  }

  create() {
    this.background = this.add.image(0, 0, textureKeys.background).setOrigin(0.5);

    if (!this.qualifiesForRanking) {
      this.createResultsLayout();
    }

    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.handleResize(this.scale.gameSize);

    if (this.qualifiesForRanking) {
      this.openRankingPopup();
    }
  }

  createResultsLayout() {
    const panel = this.add.rectangle(0, 0, 560, 500, 0x102236, 0.84)
      .setStrokeStyle(2, 0xf5f1d6, 0.85);

    const title = this.add.text(0, -110, 'Puntuaciones', {
      fontFamily: 'Trebuchet MS',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const summary = this.add.text(0, -38, `Ultima ronda: ${this.score} puntos en ${this.duration}s`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const stats = this.add.text(0, 8, `Aciertos: ${this.hits} · Fallos: ${this.misses}`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#dbe9f4',
      align: 'center'
    }).setOrigin(0.5);

    this.rankingStatusText = this.add.text(0, 68, this.getRankingStatusMessage(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#dbe9f4',
      align: 'center',
      wordWrap: { width: 430 }
    }).setOrigin(0.5);

    const replayButton = this.createButton('Jugar otra vez', () => {
      this.scene.start(sceneKeys.preloader, {
        nextScene: sceneKeys.game
      });
    });
    replayButton.setY(144);

    const menuButton = this.createButton('Volver al menú', () => {
      this.scene.start(sceneKeys.mainMenu);
    });
    menuButton.setY(198);

    this.layout = this.add.container(0, 0, [panel, title, summary, stats, this.rankingStatusText, replayButton, menuButton]);
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

  normalizeRankingInitials(initials) {
    return String(initials ?? '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 3)
      .padEnd(3, 'A');
  }

  buildRankingLetterIndexes(initials) {
    return this.normalizeRankingInitials(initials)
      .split('')
      .map((letter) => Math.max(0, ARCADE_INITIALS_ALPHABET.indexOf(letter)));
  }

  getRankingInitialsFromSelection() {
    return this.rankingLetterIndexes
      .map((index) => ARCADE_INITIALS_ALPHABET[index] ?? 'A')
      .join('');
  }

  getRankingStatusMessage() {
    if (this.hasSavedRankingEntry) {
      return `Ranking actualizado para ${this.rankingInitials}.`;
    }

    if (this.qualifiesForRanking) {
      return `Has entrado en el Top ${MAX_RANKING_ENTRIES}. Registra tus iniciales para guardar la marca.`;
    }

    if (!this.hasRoundActivity) {
      return 'No se ha registrado actividad suficiente para entrar en el ranking.';
    }

    return `No has superado el corte actual del Top ${MAX_RANKING_ENTRIES}, fijado en ${this.rankingCutoffScore} puntos.`;
  }

  openRankingPopup() {
    this.rankingBackdrop = this.add.rectangle(0, 0, 0, 0, 0x08111c, 0.7)
      .setOrigin(0)
      .setInteractive()
      .setDepth(10);

    const panel = this.add.rectangle(0, 0, 500, 360, 0x102236, 0.96)
      .setStrokeStyle(2, 0xe5b75c, 0.92);

    const title = this.add.text(0, -82, 'Nuevo Top 10', {
      fontFamily: 'Trebuchet MS',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const message = this.add.text(0, -42, `Tu ronda de ${this.score} puntos ha entrado en el ranking. Ajusta tus 3 iniciales con flechas y confirma con Espacio o Enter.`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 390 }
    }).setOrigin(0.5);

    const initialsFrame = this.add.rectangle(0, 42, 226, 62, 0x09131f, 0.94)
      .setStrokeStyle(2, 0xf5f1d6, 0.7);

    this.rankingInitialsSlots = [-58, 0, 58].map((x) => this.add.text(x, 42, '_', {
      fontFamily: 'Trebuchet MS',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#f5f1d6',
      align: 'center'
    }).setOrigin(0.5));

    const helper = this.add.text(0, 104, 'Arriba/abajo cambia letra. Enter o Espacio confirma. Backspace retrocede.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#dbe9f4',
      align: 'center',
      wordWrap: { width: 360 }
    }).setOrigin(0.5);

    const saveButton = this.createButton('Guardar marca', () => {
      this.submitRankingEntry();
    });
    saveButton.setY(142);

    this.rankingModal = this.add.container(0, 0, [
      panel,
      title,
      message,
      initialsFrame,
      ...this.rankingInitialsSlots,
      helper,
      saveButton
    ]).setDepth(11);

    this.updateRankingInitialsDisplay();

    this.onPopupKeyDown = (event) => {
      this.handlePopupKeyDown(event);
    };
    this.input.keyboard.on('keydown', this.onPopupKeyDown);
    this.handleResize(this.scale.gameSize);
  }

  handlePopupKeyDown(event) {
    if (!this.rankingModal) {
      return;
    }

    if (event.key === 'ArrowUp') {
      this.shiftActiveInitial(1);
      return;
    }

    if (event.key === 'ArrowDown') {
      this.shiftActiveInitial(-1);
      return;
    }

    if (event.key === 'Enter' || event.code === 'Space') {
      this.confirmActiveInitial();
      return;
    }

    if (event.key === 'Backspace') {
      this.goBackToPreviousInitial();
    }
  }

  shiftActiveInitial(direction) {
    const nextIndex = Phaser.Math.Wrap(
      this.rankingLetterIndexes[this.rankingActiveIndex] + direction,
      0,
      ARCADE_INITIALS_ALPHABET.length
    );

    this.rankingLetterIndexes[this.rankingActiveIndex] = nextIndex;
    this.updateRankingInitialsDisplay();
  }

  confirmActiveInitial() {
    if (this.rankingActiveIndex >= this.rankingLetterIndexes.length - 1) {
      this.rankingConfirmedCount = this.rankingLetterIndexes.length;
      this.submitRankingEntry();
      return;
    }

    this.rankingConfirmedCount = Math.max(this.rankingConfirmedCount, this.rankingActiveIndex + 1);
    this.rankingActiveIndex += 1;
    this.updateRankingInitialsDisplay();
  }

  goBackToPreviousInitial() {
    if (this.rankingActiveIndex === 0 && this.rankingConfirmedCount === 0) {
      return;
    }

    if (this.rankingConfirmedCount === this.rankingLetterIndexes.length) {
      this.rankingConfirmedCount -= 1;
      this.rankingActiveIndex = this.rankingLetterIndexes.length - 1;
    } else {
      this.rankingActiveIndex = Math.max(0, this.rankingActiveIndex - 1);
      this.rankingConfirmedCount = this.rankingActiveIndex;
    }

    this.updateRankingInitialsDisplay();
  }

  updateRankingInitialsDisplay() {
    if (!this.rankingInitialsSlots.length) {
      return;
    }

    this.rankingInitialsSlots.forEach((slot, index) => {
      const letter = ARCADE_INITIALS_ALPHABET[this.rankingLetterIndexes[index]] ?? 'A';
      const isConfirmed = index < this.rankingConfirmedCount;
      const isActive = index === this.rankingActiveIndex && this.rankingConfirmedCount < this.rankingLetterIndexes.length;
      const isPending = index > this.rankingActiveIndex;

      slot.setText(isPending ? '_' : letter);
      slot.setColor(isActive ? '#e5b75c' : (isConfirmed ? '#f5f1d6' : '#dbe9f4'));
      slot.setScale(isActive ? 1.12 : 1);
      slot.setAlpha(1);
    });

    this.refreshRankingBlink();
  }

  refreshRankingBlink() {
    if (this.rankingBlinkTween) {
      this.rankingBlinkTween.remove();
      this.rankingBlinkTween = null;
    }

    const activeSlot = this.rankingInitialsSlots[this.rankingActiveIndex];

    if (!activeSlot || this.rankingConfirmedCount >= this.rankingLetterIndexes.length) {
      return;
    }

    this.rankingBlinkTween = this.tweens.add({
      targets: activeSlot,
      alpha: 0.24,
      duration: 220,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });
  }

  submitRankingEntry() {
    if (this.hasSavedRankingEntry) {
      return;
    }

    const initials = this.normalizeRankingInitials(this.getRankingInitialsFromSelection() || DEFAULT_INITIALS);

    const { savedEntry } = saveRankingEntry({
      initials,
      score: this.score,
      duration: this.duration,
      hits: this.hits,
      misses: this.misses
    });

    this.rankingInitials = initials;
    this.hasSavedRankingEntry = true;
    this.registry.set('lastRankingInitials', initials);
    this.registry.set('pendingRankingHighlightEntry', savedEntry);

    this.scene.start(sceneKeys.ranking, {
      highlightEntry: savedEntry
    });
  }

  closeRankingPopup() {
    if (this.onPopupKeyDown) {
      this.input.keyboard.off('keydown', this.onPopupKeyDown);
      this.onPopupKeyDown = null;
    }

    if (this.rankingBlinkTween) {
      this.rankingBlinkTween.remove();
      this.rankingBlinkTween = null;
    }

    this.rankingModal?.destroy();
    this.rankingModal = null;
    this.rankingInitialsSlots = [];

    this.rankingBackdrop?.destroy();
    this.rankingBackdrop = null;
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

    if (this.rankingBackdrop) {
      this.rankingBackdrop.setSize(width, height);
    }

    if (this.rankingModal) {
      this.rankingModal.setPosition(width / 2, height / 2);
    }
  }

  handleShutdown() {
    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }

    this.closeRankingPopup();
  }
}