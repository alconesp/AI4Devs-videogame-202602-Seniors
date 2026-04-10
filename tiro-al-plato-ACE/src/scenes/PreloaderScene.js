import Phaser from 'phaser';
import { criticalTextureKeys, texturePaths } from '../assets/manifest.js';
import { sceneKeys } from './sceneKeys.js';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.preloader);
    this.nextScene = sceneKeys.mainMenu;
    this.nextSceneData = undefined;
    this.background = null;
    this.loadingPanel = null;
    this.panelBackground = null;
    this.titleText = null;
    this.subtitleText = null;
    this.progressTrack = null;
    this.progressFill = null;
    this.progressText = null;
    this.failedAssets = [];
    this.progressValue = 0;
    this.queuedAssetCount = 0;
    this.onResize = null;
    this.transitionTimer = null;
  }

  init(data) {
    this.nextScene = data?.nextScene ?? sceneKeys.mainMenu;
    this.nextSceneData = data?.data;
    this.background = null;
    this.loadingPanel = null;
    this.panelBackground = null;
    this.titleText = null;
    this.subtitleText = null;
    this.progressTrack = null;
    this.progressFill = null;
    this.progressText = null;
    this.failedAssets = [];
    this.progressValue = 0;
    this.queuedAssetCount = 0;
    this.onResize = null;
    this.transitionTimer = null;
  }

  preload() {
    this.createLoadingUi();
    this.registerLoaderEvents();
    this.queuedAssetCount = this.queueCriticalAssets();

    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.handleResize(this.scale.gameSize);

    if (this.queuedAssetCount === 0) {
      this.progressValue = 1;
      this.updateProgressDisplay();
      this.subtitleText?.setText('Recursos listos. Entrando...');
    }
  }

  create() {
    const nextScene = this.failedAssets.length > 0 ? sceneKeys.mainMenu : this.nextScene;
    const nextSceneData = nextScene === this.nextScene ? this.nextSceneData : undefined;
    const transitionDelay = this.failedAssets.length > 0 ? 420 : 180;

    this.transitionTimer = this.time.delayedCall(transitionDelay, () => {
      this.scene.start(nextScene, nextSceneData);
    });
  }

  createLoadingUi() {
    this.background = this.add.rectangle(0, 0, 1, 1, 0x09131f, 0.96).setOrigin(0);
    this.panelBackground = this.add.rectangle(0, 0, 540, 220, 0x102236, 0.86)
      .setStrokeStyle(2, 0xe5b75c, 0.8);

    this.titleText = this.add.text(0, -58, 'Cargando recursos', {
      fontFamily: 'Trebuchet MS',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    this.subtitleText = this.add.text(0, -12, 'Preparando fondo, jugador y plato...', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.progressTrack = this.add.rectangle(0, 30, 420, 20, 0x0b1723, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x36597a, 0.9);

    this.progressFill = this.add.rectangle(0, 30, 0, 20, 0xe5b75c, 1).setOrigin(0, 0.5);

    this.progressText = this.add.text(0, 72, '0%', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    this.loadingPanel = this.add.container(0, 0, [
      this.panelBackground,
      this.titleText,
      this.subtitleText,
      this.progressTrack,
      this.progressFill,
      this.progressText
    ]);
  }

  registerLoaderEvents() {
    this.load.on('progress', this.handleLoadProgress, this);
    this.load.on('loaderror', this.handleLoadError, this);
    this.load.once('complete', this.handleLoadComplete, this);
  }

  queueCriticalAssets() {
    let queuedAssetCount = 0;

    criticalTextureKeys.forEach((key) => {
      if (this.textures.exists(key)) {
        return;
      }

      const assetPath = texturePaths[key];

      if (!assetPath) {
        this.failedAssets.push(key);
        console.error(`[Preloader] No existe path configurado para el asset "${key}".`);
        return;
      }

      if (assetPath.endsWith('.svg')) {
        this.load.svg(key, assetPath);
        queuedAssetCount += 1;
        return;
      }

      this.load.image(key, assetPath);
      queuedAssetCount += 1;
    });

    return queuedAssetCount;
  }

  handleLoadProgress(value) {
    this.progressValue = Phaser.Math.Clamp(value, 0, 1);
    this.updateProgressDisplay();
  }

  handleLoadError(file) {
    const assetKey = file?.key ?? 'desconocido';

    if (!this.failedAssets.includes(assetKey)) {
      this.failedAssets.push(assetKey);
    }

    console.error(`[Preloader] Error al cargar asset "${assetKey}" desde "${file?.src ?? 'origen desconocido'}".`);

    if (this.subtitleText) {
      this.subtitleText.setText('Algunos recursos fallaron. Se abrira el menu.');
    }
  }

  handleLoadComplete() {
    this.progressValue = 1;
    this.updateProgressDisplay();

    if (this.subtitleText) {
      this.subtitleText.setText(
        this.failedAssets.length > 0
          ? 'Carga incompleta. Continuando al menu...'
          : 'Recursos listos. Entrando...'
      );
    }
  }

  updateProgressDisplay() {
    if (this.progressText) {
      this.progressText.setText(`${Math.round(this.progressValue * 100)}%`);
    }

    if (this.progressTrack && this.progressFill) {
      const trackWidth = this.progressTrack.displayWidth;
      this.progressFill.setDisplaySize(trackWidth * this.progressValue, this.progressTrack.displayHeight);
    }
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;
    const panelWidth = Math.min(Math.max(width - 40, 280), 540);
    const trackWidth = Math.max(panelWidth - 64, 180);

    if (this.background) {
      this.background.setDisplaySize(width, height);
    }

    if (this.loadingPanel) {
      this.loadingPanel.setPosition(width / 2, height / 2);
    }

    if (this.panelBackground) {
      this.panelBackground.setDisplaySize(panelWidth, 220);
    }

    if (this.progressTrack) {
      this.progressTrack.setPosition(-trackWidth / 2, 30);
      this.progressTrack.setDisplaySize(trackWidth, 20);
    }

    if (this.progressFill) {
      this.progressFill.setPosition(-trackWidth / 2, 30);
    }

    this.updateProgressDisplay();
  }

  handleShutdown() {
    this.load.off('progress', this.handleLoadProgress, this);
    this.load.off('loaderror', this.handleLoadError, this);

    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }

    if (this.transitionTimer) {
      this.transitionTimer.remove(false);
      this.transitionTimer = null;
    }
  }
}