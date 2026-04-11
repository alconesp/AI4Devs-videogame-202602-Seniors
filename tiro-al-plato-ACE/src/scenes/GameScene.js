import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { PlatePrefab } from '../prefabs/PlatePrefab.js';
import { PlayerPrefab } from '../prefabs/PlayerPrefab.js';
import { sceneKeys } from './sceneKeys.js';

const PLATE_SPAWN_POINT = Object.freeze({ x: 1536, y: 600 });
const PLATE_END_X = -96;
const PLATE_FIXED_SPEED = 660;
const PLATE_SCALE = 0.2;
const PLATE_MIN_ARC_HEIGHT = 160;
const PLATE_MAX_ARC_HEIGHT = 320;
const PLATE_SPAWN_DELAY = 1100;
const SHOOT_ZONE_SIZE = 46;
const SHOOT_ZONE_ALPHA = 0.78;
const SHOOT_ZONE_Y_RATIO = 0.72;
const SHOOT_ZONE_LEFT_X_RATIO = 0.39;
const SHOOT_ZONE_RIGHT_X_RATIO = 0.61;
const SHOT_RESET_DELAY = 180;

export class GameScene extends Phaser.Scene {
  constructor() {
    super(sceneKeys.game);
    this.background = null;
    this.player = null;
    this.leftShootZone = null;
    this.rightShootZone = null;
    this.hud = null;
    this.instructions = null;
    this.scoreText = null;
    this.statusText = null;
    this.score = 0;
    this.elapsedSeconds = 0;
    this.roundTimer = null;
    this.plateSpawnTimer = null;
    this.activePlates = [];
    this.onResize = null;
    this.onScore = null;
    this.onShootLeft = null;
    this.onShootRight = null;
    this.onFinish = null;
    this.onExitToMenu = null;
  }

  init() {
    this.background = null;
    this.player = null;
    this.leftShootZone = null;
    this.rightShootZone = null;
    this.hud = null;
    this.instructions = null;
    this.scoreText = null;
    this.statusText = null;
    this.score = 0;
    this.elapsedSeconds = 0;
    this.roundTimer = null;
    this.plateSpawnTimer = null;
    this.activePlates = [];
    this.onResize = null;
    this.onScore = null;
    this.onShootLeft = null;
    this.onShootRight = null;
    this.onFinish = null;
    this.onExitToMenu = null;
  }

  create() {
    this.createBackground();
    this.createPlayer();
    this.createShootZones();
    this.createHud();
    this.registerSceneEvents();
    this.registerInput();
    this.startRoundTimer();
    this.startPlateSpawner();
    this.handleResize(this.scale.gameSize);
    this.updateHud();
  }

  createBackground() {
    this.background = this.add.image(0, 0, textureKeys.background).setOrigin(0.5).setDepth(0);
  }

  createPlayer() {
    this.player = new PlayerPrefab(this, 0, 0, textureKeys.playerAimCenter);
    this.player.setDepth(1);
  }

  createShootZones() {
    this.leftShootZone = this.createShootZone();
    this.rightShootZone = this.createShootZone();
  }

  createShootZone() {
    return this.add.rectangle(0, 0, SHOOT_ZONE_SIZE, SHOOT_ZONE_SIZE, 0xff4d4d, SHOOT_ZONE_ALPHA)
      .setOrigin(0.5)
      .setDepth(1.25)
      .setStrokeStyle(2, 0xffc2c2, 1);
  }

  createHud() {
    this.hud = this.add.container(0, 0).setDepth(2);

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

    this.instructions = this.add.text(0, 72, 'FLECHAS activan zonas · ESPACIO suma puntos · ENTER finaliza ronda · ESC vuelve al menu', {
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

    this.onShootLeft = () => {
      this.activateShootZone(this.leftShootZone, textureKeys.playerAimLeft);
    };

    this.onShootRight = () => {
      this.activateShootZone(this.rightShootZone, textureKeys.playerAimRight);
    };

    this.onFinish = () => {
      this.finishRound();
    };

    this.onExitToMenu = () => {
      this.scene.start(sceneKeys.mainMenu);
    };

    this.input.keyboard.on('keydown-SPACE', this.onScore);
    this.input.keyboard.on('keydown-LEFT', this.onShootLeft);
    this.input.keyboard.on('keydown-RIGHT', this.onShootRight);
    this.input.keyboard.on('keydown-ENTER', this.onFinish);
    this.input.keyboard.on('keydown-ESC', this.onExitToMenu);
  }

  activateShootZone(zone, textureKey) {
    if (zone) {
      this.tweens.killTweensOf(zone);
      zone.setAlpha(SHOOT_ZONE_ALPHA);
      zone.setScale(1.18);

      this.tweens.add({
        targets: zone,
        scaleX: 1,
        scaleY: 1,
        duration: SHOT_RESET_DELAY,
        ease: 'Sine.easeOut'
      });
    }

    this.player?.playShot(textureKey, { resetDelay: SHOT_RESET_DELAY });
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

  startPlateSpawner() {
    this.spawnPlate();

    this.plateSpawnTimer = this.time.addEvent({
      delay: PLATE_SPAWN_DELAY,
      loop: true,
      callback: () => {
        this.spawnPlate();
      }
    });
  }

  spawnPlate() {
    const travelDistance = PLATE_SPAWN_POINT.x - PLATE_END_X;
    const travelDuration = travelDistance / PLATE_FIXED_SPEED;
    const maxArcHeight = Math.min(PLATE_MAX_ARC_HEIGHT, PLATE_SPAWN_POINT.y - 120);
    const arcHeight = Phaser.Math.FloatBetween(PLATE_MIN_ARC_HEIGHT, maxArcHeight);
    const controlX = (PLATE_SPAWN_POINT.x + PLATE_END_X) * 0.5;
    const controlY = PLATE_SPAWN_POINT.y - (arcHeight * 2);
    const initialVelocityX = (2 * (controlX - PLATE_SPAWN_POINT.x)) / travelDuration;
    const initialVelocityY = (2 * (controlY - PLATE_SPAWN_POINT.y)) / travelDuration;
    const launchAngle = Phaser.Math.RadToDeg(
      Math.atan2(Math.abs(initialVelocityY), Math.abs(initialVelocityX))
    );
    const plate = new PlatePrefab(this, PLATE_SPAWN_POINT.x, PLATE_SPAWN_POINT.y, textureKeys.plate, {
      startX: PLATE_SPAWN_POINT.x,
      startY: PLATE_SPAWN_POINT.y,
      endX: PLATE_END_X,
      endY: PLATE_SPAWN_POINT.y,
      controlX,
      controlY,
      travelDuration,
      launchAngle,
      scale: PLATE_SCALE
    });

    plate.setDepth(1.5);
    this.activePlates.push(plate);
  }

  update(_time, delta) {
    const deltaSeconds = delta / 1000;

    for (let index = this.activePlates.length - 1; index >= 0; index -= 1) {
      const plate = this.activePlates[index];

      plate.advance(deltaSeconds);

      if (!plate.hasExitedLeftBoundary()) {
        continue;
      }

      this.destroyPlateAt(index);
    }

    this.updateShootZoneTracking();
  }

  updateShootZoneTracking() {
    if (!this.leftShootZone || !this.rightShootZone) {
      return;
    }

    const homeY = this.getShootZoneHomeY();

    if (this.activePlates.length === 0) {
      this.leftShootZone.y = homeY;
      this.rightShootZone.y = homeY;
      return;
    }

    const leftPlate = this.getClosestPlateForZone(this.leftShootZone);
    const rightPlate = this.getClosestPlateForZone(this.rightShootZone);

    this.leftShootZone.y = leftPlate ? this.getClampedShootZoneY(leftPlate.y) : homeY;
    this.rightShootZone.y = rightPlate ? this.getClampedShootZoneY(rightPlate.y) : homeY;
  }

  getClosestPlateForZone(zone) {
    if (!zone) {
      return null;
    }

    return this.activePlates.reduce((closestPlate, plate) => {
      if (!closestPlate) {
        return plate;
      }

      const currentDistance = Math.abs(plate.x - zone.x);
      const closestDistance = Math.abs(closestPlate.x - zone.x);

      if (currentDistance < closestDistance) {
        return plate;
      }

      return closestPlate;
    }, null);
  }

  getShootZoneHomeY() {
    return this.scale.height * SHOOT_ZONE_Y_RATIO;
  }

  getClampedShootZoneY(targetY) {
    const halfSize = SHOOT_ZONE_SIZE * 0.5;
    return Phaser.Math.Clamp(targetY, halfSize, this.scale.height - halfSize);
  }

  destroyPlateAt(index) {
    const [plate] = this.activePlates.splice(index, 1);
    plate?.destroy();
  }

  destroyAllPlates() {
    this.activePlates.forEach((plate) => plate.destroy());
    this.activePlates = [];
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

    if (this.player) {
      this.player.resizeToCover(width, height);
    }

    if (this.leftShootZone) {
      this.leftShootZone.setPosition(width * SHOOT_ZONE_LEFT_X_RATIO, this.getShootZoneHomeY());
    }

    if (this.rightShootZone) {
      this.rightShootZone.setPosition(width * SHOOT_ZONE_RIGHT_X_RATIO, this.getShootZoneHomeY());
    }
  }

  handleShutdown() {
    this.player?.stopAnimation();

    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
    }

    if (this.onScore) {
      this.input.keyboard.off('keydown-SPACE', this.onScore);
      this.onScore = null;
    }

    if (this.onShootLeft) {
      this.input.keyboard.off('keydown-LEFT', this.onShootLeft);
      this.onShootLeft = null;
    }

    if (this.onShootRight) {
      this.input.keyboard.off('keydown-RIGHT', this.onShootRight);
      this.onShootRight = null;
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

    if (this.plateSpawnTimer) {
      this.plateSpawnTimer.remove(false);
      this.plateSpawnTimer = null;
    }

    this.destroyAllPlates();
  }
}