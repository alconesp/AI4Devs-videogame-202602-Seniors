import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { sceneKeys } from './sceneKeys.js';

export class RankingScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.ranking);
    this.background = null;
    this.layout = null;
    this.onResize = null;
    this.bestScore = 0;
    this.bestDuration = 0;
    this.bestHits = 0;
    this.bestMisses = 0;
    this.lastScore = 0;
    this.lastDuration = 0;
    this.lastHits = 0;
    this.lastMisses = 0;
  }

  init() {
    this.background = null;
    this.layout = null;
    this.onResize = null;
    this.bestScore = this.registry.get('bestScore') ?? 0;
    this.bestDuration = this.registry.get('bestDuration') ?? 0;
    this.bestHits = this.registry.get('bestHits') ?? 0;
    this.bestMisses = this.registry.get('bestMisses') ?? 0;
    this.lastScore = this.registry.get('lastScore') ?? 0;
    this.lastDuration = this.registry.get('lastDuration') ?? 0;
    this.lastHits = this.registry.get('lastHits') ?? 0;
    this.lastMisses = this.registry.get('lastMisses') ?? 0;
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
    const panel = this.add.rectangle(0, 0, 560, 360, 0x102236, 0.84)
      .setStrokeStyle(2, 0xf5f1d6, 0.88);

    const accent = this.add.rectangle(0, -146, 478, 30, 0xe5b75c, 0.12)
      .setStrokeStyle(1, 0xe5b75c, 0.42);

    const title = this.add.text(0, -146, 'Ranking', {
      fontFamily: 'Trebuchet MS',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const intro = this.add.text(0, -104, this.getIntroText(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 440 }
    }).setOrigin(0.5);

    const bestSummary = this.add.text(0, -28, this.getBestSummary(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f5f1d6',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    const bestStats = this.add.text(0, 28, this.getBestStats(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#dbe9f4',
      align: 'center',
      wordWrap: { width: 440 }
    }).setOrigin(0.5);

    const lastRound = this.add.text(0, 94, this.getLastRoundSummary(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 440 }
    }).setOrigin(0.5);

    const menuButton = this.createButton('Volver al menu', () => {
      this.scene.start(sceneKeys.mainMenu);
    });
    menuButton.setY(152);

    this.layout = this.add.container(0, 0, [
      panel,
      accent,
      title,
      intro,
      bestSummary,
      bestStats,
      lastRound,
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

  getIntroText() {
    if (this.bestScore > 0) {
      return 'Consulta la mejor marca de la sesion y compite contra tu ultima ronda.';
    }

    return 'Aun no hay rondas registradas. Empieza una nueva partida para llenar este ranking.';
  }

  getBestSummary() {
    if (this.bestScore > 0) {
      return `Mejor puntuacion: ${this.bestScore} puntos en ${this.bestDuration}s`;
    }

    return 'Mejor puntuacion: pendiente';
  }

  getBestStats() {
    if (this.bestScore > 0) {
      return `Aciertos: ${this.bestHits} · Fallos: ${this.bestMisses} · Precision: ${this.getAccuracy(this.bestHits, this.bestMisses)}%`;
    }

    return 'Todavia no hay estadisticas disponibles para esta sesion.';
  }

  getLastRoundSummary() {
    if (this.lastScore > 0 || this.lastHits > 0 || this.lastMisses > 0) {
      return `Ultima ronda: ${this.lastScore} puntos · ${this.lastHits} aciertos · ${this.lastMisses} fallos · ${this.lastDuration}s`;
    }

    return 'Ultima ronda: aun sin datos registrados.';
  }

  getAccuracy(hits, misses) {
    const totalShots = hits + misses;

    if (totalShots === 0) {
      return 0;
    }

    return Math.round((hits / totalShots) * 100);
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