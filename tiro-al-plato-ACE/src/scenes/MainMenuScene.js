import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { GameAudioController } from '../game/GameAudioController.js';
import { clampAudioVolume, getAudioSettingsFromRegistry, syncStoredAudioSettings } from '../game/audioSettings.js';
import { PlayerPrefab } from '../prefabs/PlayerPrefab.js';
import { sceneKeys } from './sceneKeys.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.mainMenu);
    this.background = null;
    this.player = null;
    this.menuPanel = null;
    this.menuPanelContent = null;
    this.audioConfigPanel = null;
    this.audioConfigPanelContent = null;
    this.audioOpenButton = null;
    this.titleText = null;
    this.subtitleText = null;
    this.statusText = null;
    this.playButton = null;
    this.rankingButton = null;
    this.controlsButton = null;
    this.audioMuteButton = null;
    this.audioMuteButtonLabel = null;
    this.musicVolumeText = null;
    this.musicVolumeFill = null;
    this.sfxVolumeText = null;
    this.sfxVolumeFill = null;
    this.audioPreviewController = null;
    this.audioSettings = getAudioSettingsFromRegistry(this.registry);
    this.onResize = null;
    this.popupTween = null;
    this.isTransitioning = false;
  }

  init() {
    this.background = null;
    this.player = null;
    this.menuPanel = null;
    this.menuPanelContent = null;
    this.audioConfigPanel = null;
    this.audioConfigPanelContent = null;
    this.audioOpenButton = null;
    this.titleText = null;
    this.subtitleText = null;
    this.statusText = null;
    this.playButton = null;
    this.rankingButton = null;
    this.controlsButton = null;
    this.audioMuteButton = null;
    this.audioMuteButtonLabel = null;
    this.musicVolumeText = null;
    this.musicVolumeFill = null;
    this.sfxVolumeText = null;
    this.sfxVolumeFill = null;
    this.audioPreviewController = null;
    this.audioSettings = getAudioSettingsFromRegistry(this.registry);
    this.onResize = null;
    this.popupTween = null;
    this.isTransitioning = false;
  }

  create() {
    this.createBackground();
    this.createPlayer();
    this.createMainMenuView();
    this.createAudioConfigView();
    this.showMainMenuView();

    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.handleResize(this.scale.gameSize);
    this.animatePopup(this.menuPanelContent);
  }

  createBackground() {
    this.background = this.add.image(0, 0, textureKeys.background).setOrigin(0.5).setDepth(0);
  }

  createMainMenuView() {
    const outerGlow = this.add.rectangle(0, 0, 588, 540, 0x09131f, 0.46)
      .setStrokeStyle(2, 0x36597a, 0.55);

    const panel = this.add.rectangle(0, 0, 548, 500, 0x102236, 0.84)
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
      this.startNewGameTransition();
    });

    this.rankingButton = this.createMenuButton('Ranking', () => {
      this.scene.start(sceneKeys.ranking);
    });

    this.controlsButton = this.createMenuButton('Controles', () => {
      this.scene.start(sceneKeys.controls);
    });

    this.audioOpenButton = this.createAudioOpenButton();
    this.audioOpenButton.setPosition(226, 206);

    this.menuPanelContent = this.add.container(0, 0, [
      outerGlow,
      panel,
      headerBar,
      this.titleText,
      this.subtitleText,
      this.statusText,
      this.playButton,
      this.rankingButton,
      this.controlsButton,
      this.audioOpenButton
    ]);

    this.menuPanel = this.add.container(0, 0, [this.menuPanelContent]).setDepth(2);
    this.menuPanelContent.setScale(0.94);

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

  createAudioConfigView() {
    const outerGlow = this.add.rectangle(0, 0, 652, 604, 0x09131f, 0.52)
      .setStrokeStyle(2, 0x36597a, 0.55);

    const panel = this.add.rectangle(0, 0, 612, 564, 0x102236, 0.9)
      .setStrokeStyle(2, 0xf5f1d6, 0.88);

    const headerBar = this.add.rectangle(0, -190, 520, 34, 0xe5b75c, 0.14)
      .setStrokeStyle(1, 0xe5b75c, 0.45);

    const title = this.add.text(0, -190, 'Configuracion de audio', {
      fontFamily: 'Trebuchet MS',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -145, 'Ajusta musica y efectos por separado. Esta vista reproduce una preescucha real para calibrar el balance.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 470 }
    }).setOrigin(0.5);

    const musicControls = this.createVolumeRow({
      title: 'Musica de fondo',
      y: -48,
      onDecrease: () => this.adjustMusicVolume(-0.1),
      onIncrease: () => this.adjustMusicVolume(0.1),
      fillKey: 'music'
    });

    const sfxControls = this.createVolumeRow({
      title: 'Efectos y disparos',
      y: 72,
      onDecrease: () => this.adjustSfxVolume(-0.1),
      onIncrease: () => this.adjustSfxVolume(0.1),
      fillKey: 'sfx'
    });

    const previewLabel = this.add.text(0, 172, 'Preview', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    const shotPreviewButton = this.createAudioButton('Disparo', () => {
      this.audioPreviewController?.playShot();
    }, 118);
    shotPreviewButton.setPosition(-126, 220);

    const impactPreviewButton = this.createAudioButton('Impacto', () => {
      this.audioPreviewController?.playImpact();
    }, 118);
    impactPreviewButton.setPosition(0, 220);

    const missPreviewButton = this.createAudioButton('Fallo', () => {
      this.audioPreviewController?.playMiss();
    }, 118);
    missPreviewButton.setPosition(126, 220);

    this.audioMuteButton = this.createAudioButton('Silencio', () => {
      this.toggleMute();
    }, 158);
    this.audioMuteButton.setPosition(-122, 272);
    this.audioMuteButtonLabel = this.audioMuteButton.list[1];

    const backButton = this.createAudioButton('Volver al menú', () => {
      this.showMainMenuView();
    }, 198);
    backButton.setPosition(112, 272);

    this.audioConfigPanelContent = this.add.container(0, 0, [
      outerGlow,
      panel,
      headerBar,
      title,
      subtitle,
      musicControls,
      sfxControls,
      previewLabel,
      shotPreviewButton,
      impactPreviewButton,
      missPreviewButton,
      this.audioMuteButton,
      backButton
    ]);

    this.audioConfigPanel = this.add.container(0, 0, [this.audioConfigPanelContent]).setDepth(2);
    this.audioConfigPanelContent.setScale(0.94);

    this.audioConfigPanel.setVisible(false);
    this.updateAudioPanel();
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

  createVolumeRow({ title, y, onDecrease, onIncrease, fillKey }) {
    const row = this.add.container(0, y);

    const panel = this.add.rectangle(0, 0, 488, 104, 0x0b1724, 0.72)
      .setStrokeStyle(2, 0xe5b75c, 0.24);

    const label = this.add.text(-208, -24, title, {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f5f1d6'
    }).setOrigin(0, 0.5);

    const volumeText = this.add.text(-208, 2, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#dbe9f4'
    }).setOrigin(0, 0.5);

    const volumeTrack = this.add.rectangle(-60, 30, 260, 14, 0x09131f, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x36597a, 0.9);

    const volumeFill = this.add.rectangle(-190, 30, 0, 14, 0xe5b75c, 1).setOrigin(0, 0.5);

    const decreaseButton = this.createAudioButton('-', onDecrease, 42);
    decreaseButton.setPosition(168, -2);

    const increaseButton = this.createAudioButton('+', onIncrease, 42);
    increaseButton.setPosition(220, -2);

    row.add([
      panel,
      label,
      volumeText,
      volumeTrack,
      volumeFill,
      decreaseButton,
      increaseButton
    ]);

    if (fillKey === 'music') {
      this.musicVolumeText = volumeText;
      this.musicVolumeFill = volumeFill;
    }

    if (fillKey === 'sfx') {
      this.sfxVolumeText = volumeText;
      this.sfxVolumeFill = volumeFill;
    }

    return row;
  }

  createAudioButton(label, onClick, width) {
    const background = this.add.rectangle(0, 0, width, 34, 0xe5b75c, 1)
      .setStrokeStyle(2, 0x0f2233, 0.9)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#0f2233'
    }).setOrigin(0.5);

    background.on('pointerover', () => background.setFillStyle(0xf2cb7d, 1));
    background.on('pointerout', () => background.setFillStyle(0xe5b75c, 1));
    background.on('pointerup', onClick);

    return this.add.container(0, 0, [background, text]);
  }

  createAudioOpenButton() {
    const background = this.add.circle(0, 0, 28, 0xe5b75c, 1)
      .setStrokeStyle(2, 0x0f2233, 0.95)
      .setInteractive({ useHandCursor: true });

    const icon = this.add.image(0, 0, textureKeys.speaker)
      .setDisplaySize(30, 30);

    background.on('pointerover', () => background.setFillStyle(0xf2cb7d, 1));
    background.on('pointerout', () => background.setFillStyle(0xe5b75c, 1));
    background.on('pointerup', () => {
      this.showAudioConfigView();
    });

    return this.add.container(0, 0, [background, icon]);
  }

  adjustMusicVolume(delta) {
    const nextVolume = clampAudioVolume(this.audioSettings.musicVolume + delta);

    this.persistAudioSettings({
      musicVolume: nextVolume,
      muted: nextVolume > 0 ? false : this.audioSettings.muted
    });
  }

  adjustSfxVolume(delta) {
    const nextVolume = clampAudioVolume(this.audioSettings.sfxVolume + delta);

    this.persistAudioSettings({
      sfxVolume: nextVolume,
      muted: nextVolume > 0 ? false : this.audioSettings.muted
    });
  }

  toggleMute() {
    this.persistAudioSettings({
      muted: !this.audioSettings.muted,
      musicVolume: this.audioSettings.musicVolume,
      sfxVolume: this.audioSettings.sfxVolume
    });
  }

  persistAudioSettings(nextSettings) {
    this.audioSettings = syncStoredAudioSettings(this.registry, {
      ...this.audioSettings,
      ...nextSettings
    });

    this.updateAudioPanel();
    this.audioPreviewController?.updateSettings(this.audioSettings);
  }

  updateAudioPanel() {
    if (!this.musicVolumeText || !this.musicVolumeFill || !this.sfxVolumeText || !this.sfxVolumeFill || !this.audioMuteButtonLabel) {
      return;
    }

    const musicPercentage = Math.round(this.audioSettings.musicVolume * 100);
    const sfxPercentage = Math.round(this.audioSettings.sfxVolume * 100);
    const visibleMusicPercentage = this.audioSettings.muted ? 0 : musicPercentage;
    const visibleSfxPercentage = this.audioSettings.muted ? 0 : sfxPercentage;

    this.musicVolumeText.setText(
      this.audioSettings.muted
        ? `Musica ${musicPercentage}% · salida silenciada`
        : `Musica ${musicPercentage}% · melodias arcade en loop`
    );

    this.sfxVolumeText.setText(
      this.audioSettings.muted
        ? `Efectos ${sfxPercentage}% · salida silenciada`
        : `Efectos ${sfxPercentage}% · prueba disparo, impacto y fallo`
    );

    this.musicVolumeFill.setDisplaySize(260 * (visibleMusicPercentage / 100), 14);
    this.sfxVolumeFill.setDisplaySize(260 * (visibleSfxPercentage / 100), 14);
    this.audioMuteButtonLabel.setText(this.audioSettings.muted ? 'Activar' : 'Silencio');
  }

  showMainMenuView() {
    this.menuPanel?.setVisible(true);
    this.audioConfigPanel?.setVisible(false);
    this.stopAudioPreview();
  }

  animatePopup(target) {
    if (!target) {
      return;
    }

    if (this.popupTween) {
      this.popupTween.remove();
    }

    target.setScale(0.94);
    target.setAlpha(0);
    this.popupTween = this.tweens.add({
      targets: target,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 320,
      ease: 'Cubic.Out'
    });
  }

  startNewGameTransition() {
    if (this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;
    this.input.enabled = false;
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(sceneKeys.preloader, {
        nextScene: sceneKeys.game
      });
    });
    this.cameras.main.fadeOut(280, 0, 0, 0);
  }

  showAudioConfigView() {
    this.menuPanel?.setVisible(false);
    this.audioConfigPanel?.setVisible(true);
    this.animatePopup(this.audioConfigPanelContent);
    this.startAudioPreview();
    this.updateAudioPanel();
  }

  startAudioPreview() {
    if (!this.audioPreviewController) {
      this.audioPreviewController = new GameAudioController(this);
    }

    this.audioPreviewController.updateSettings(this.audioSettings);
    this.audioPreviewController.startMusicLoop();
  }

  stopAudioPreview() {
    this.audioPreviewController?.destroy();
    this.audioPreviewController = null;
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
      this.menuPanel.setScale(Math.min((width - 24) / 588, (height - 24) / 540, 1));
    }

    if (this.audioConfigPanel) {
      this.audioConfigPanel.setPosition(width / 2, height / 2);
      this.audioConfigPanel.setScale(Math.min((width - 24) / 652, (height - 24) / 604, 1));
    }

    if (this.player) {
      this.player.resizeToCover(width, height);
    }
  }

  handleShutdown() {
    if (this.popupTween) {
      this.popupTween.remove();
      this.popupTween = null;
    }

    this.stopAudioPreview();
    this.player?.stopAnimation();

    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }

    this.isTransitioning = false;
  }
}
