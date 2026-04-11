import Phaser from 'phaser';
import { textureKeys } from '../assets/manifest.js';
import { BonusShipPrefab } from '../prefabs/BonusShipPrefab.js';
import { BrokenPlateEffect } from '../prefabs/BrokenPlateEffect.js';
import { PlatePrefab } from '../prefabs/PlatePrefab.js';
import { PlayerPrefab } from '../prefabs/PlayerPrefab.js';
import { sceneKeys } from './sceneKeys.js';

const RIGHT_PLATE_SPAWN_POINT = Object.freeze({ x: 1536, y: 600 });
const LEFT_SPECIAL_PLATE_SPAWN_POINT = Object.freeze({ x: 0, y: 600 });
const PLATE_EXIT_MARGIN = 96;
const PLATE_FIXED_SPEED = 660;
const PLATE_SCALE = 0.2;
const PLATE_MIN_ARC_HEIGHT = 160;
const PLATE_MAX_ARC_HEIGHT = 320;
const PLATE_SPAWN_DELAY = 1100;
const TOTAL_PLATES = 33;
const PLATES_PER_SEQUENCE = 11;
const MIN_SPECIAL_LAUNCH_ANGLE = 18;
const ALIEN_SHIP_SCORE = 5000;
const ALIEN_SHIP_SPEED = 540;
const ALIEN_SHIP_SCALE = 0.3;
const ALIEN_SHIP_MARGIN = 180;
const SHOOT_ZONE_SIZE = 46;
const SHOOT_ZONE_ALPHA = 0.78;
const SHOOT_ZONE_Y_RATIO = 0.72;
const SHOOT_ZONE_LEFT_X_RATIO = 0.39;
const SHOOT_ZONE_RIGHT_X_RATIO = 0.61;
const SHOT_RESET_DELAY = 180;
const HIT_SCORE = 100;
const SHOT_FEEDBACK_DURATION = 650;
const HUD_TOP_OFFSET = 148;
const DIFFICULTY_STEP = 0.1;
const MAX_PLATE_SPEED_MULTIPLIER = 2;
const MAX_SHOOT_ZONE_SCALE_MULTIPLIER = 2;
const DEFAULT_FEEDBACK = '33 platos: cada 10 desde la derecha aparece un especial por la izquierda';
const SPECIAL_PLATE_CONFIGS = Object.freeze([
  { name: 'azul', tint: 0x4d8fff, score: 200, feedbackColor: '#98c7ff' },
  { name: 'rojo', tint: 0xff6767, score: 500, feedbackColor: '#ffc0c0' },
  { name: 'verde', tint: 0x54da78, score: 1000, feedbackColor: '#baf5c6' }
]);

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
    this.feedbackText = null;
    this.score = 0;
    this.hits = 0;
    this.misses = 0;
    this.platesSpawned = 0;
    this.specialPlatesSpawned = 0;
    this.currentRightBlockMisses = 0;
    this.consecutivePerfectBlocks = 0;
    this.sequenceComplete = false;
    this.finalShipSpawned = false;
    this.roundEnding = false;
    this.elapsedSeconds = 0;
    this.roundTimer = null;
    this.plateSpawnTimer = null;
    this.feedbackTimer = null;
    this.activeTargets = [];
    this.plateSpeedMultiplier = 1;
    this.shootZoneScaleMultiplier = 1;
    this.onResize = null;
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
    this.feedbackText = null;
    this.score = 0;
    this.hits = 0;
    this.misses = 0;
    this.platesSpawned = 0;
    this.specialPlatesSpawned = 0;
    this.currentRightBlockMisses = 0;
    this.consecutivePerfectBlocks = 0;
    this.sequenceComplete = false;
    this.finalShipSpawned = false;
    this.roundEnding = false;
    this.elapsedSeconds = 0;
    this.roundTimer = null;
    this.plateSpawnTimer = null;
    this.feedbackTimer = null;
    this.activeTargets = [];
    this.plateSpeedMultiplier = 1;
    this.shootZoneScaleMultiplier = 1;
    this.onResize = null;
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
    this.handleResize(this.scale.gameSize);
    this.startRoundTimer();
    this.startPlateSpawner();
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

    const panel = this.add.rectangle(0, 0, 600, 248, 0x102236, 0.82)
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
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.statusText = this.add.text(0, 20, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#dbe9f4'
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(0, 56, DEFAULT_FEEDBACK, {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f5f1d6',
      align: 'center'
    }).setOrigin(0.5);

    this.instructions = this.add.text(0, 92, 'FLECHA IZQ o DER dispara · si aciertas los 33 platos aparece la nave final · ENTER finaliza ronda · ESC vuelve al menu', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#f5f1d6',
      align: 'center',
      wordWrap: { width: 520 }
    }).setOrigin(0.5);

    this.hud.add([panel, title, this.scoreText, this.statusText, this.feedbackText, this.instructions]);
  }

  registerSceneEvents() {
    this.onResize = this.handleResize.bind(this);
    this.scale.on('resize', this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  registerInput() {
    this.onShootLeft = () => {
      this.handleShot(this.leftShootZone, textureKeys.playerAimLeft);
    };

    this.onShootRight = () => {
      this.handleShot(this.rightShootZone, textureKeys.playerAimRight);
    };

    this.onFinish = () => {
      this.finishRound();
    };

    this.onExitToMenu = () => {
      this.scene.start(sceneKeys.mainMenu);
    };

    this.input.keyboard.on('keydown-LEFT', this.onShootLeft);
    this.input.keyboard.on('keydown-RIGHT', this.onShootRight);
    this.input.keyboard.on('keydown-ENTER', this.onFinish);
    this.input.keyboard.on('keydown-ESC', this.onExitToMenu);
  }

  handleShot(zone, textureKey) {
    this.activateShootZone(zone, textureKey);

    const hitTargetIndex = this.findHittableTargetIndex(zone);

    if (hitTargetIndex >= 0) {
      this.registerHit(hitTargetIndex);
      return;
    }

    this.setFeedback('Fuera de tiempo', '#ffd2a6');
  }

  activateShootZone(zone, textureKey) {
    if (zone) {
      const baseScale = this.getShootZoneBaseScale();

      this.tweens.killTweensOf(zone);
      zone.setAlpha(SHOOT_ZONE_ALPHA);
      zone.setScale(baseScale * 1.18);

      this.tweens.add({
        targets: zone,
        scaleX: baseScale,
        scaleY: baseScale,
        duration: SHOT_RESET_DELAY,
        ease: 'Sine.easeOut'
      });
    }

    this.player?.playShot(textureKey, { resetDelay: SHOT_RESET_DELAY });
  }

  findHittableTargetIndex(zone) {
    if (!zone) {
      return -1;
    }

    let closestIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < this.activeTargets.length; index += 1) {
      const target = this.activeTargets[index];

      if (target.wasHit || !this.doesTargetOverlapZone(target, zone)) {
        continue;
      }

      const distance = Math.abs(target.x - zone.x);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    }

    return closestIndex;
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
    this.spawnNextPlate();

    this.plateSpawnTimer = this.time.addEvent({
      delay: this.getCurrentPlateSpawnDelay(),
      loop: true,
      callback: () => {
        const hasSpawnedPlate = this.spawnNextPlate();

        if (!hasSpawnedPlate) {
          this.stopPlateSpawner();
          this.checkRoundResolution();
          return;
        }

        this.syncPlateSpawnDelay();
      }
    });
  }

  stopPlateSpawner() {
    if (this.plateSpawnTimer) {
      this.plateSpawnTimer.remove(false);
      this.plateSpawnTimer = null;
    }
  }

  getCurrentPlateSpawnDelay() {
    return PLATE_SPAWN_DELAY / this.plateSpeedMultiplier;
  }

  syncPlateSpawnDelay() {
    if (!this.plateSpawnTimer) {
      return;
    }

    this.plateSpawnTimer.delay = this.getCurrentPlateSpawnDelay();
  }

  spawnNextPlate() {
    if (this.platesSpawned >= TOTAL_PLATES) {
      this.sequenceComplete = true;
      return false;
    }

    const launchNumber = this.platesSpawned + 1;

    if (this.isSpecialPlateLaunch(launchNumber)) {
      this.spawnSpecialPlate();
    } else {
      this.spawnRightPlate();
    }

    this.platesSpawned = launchNumber;

    if (this.platesSpawned >= TOTAL_PLATES) {
      this.sequenceComplete = true;
    }

    return true;
  }

  isSpecialPlateLaunch(launchNumber) {
    return launchNumber % PLATES_PER_SEQUENCE === 0;
  }

  spawnRightPlate() {
    const spawnPoint = this.getBackgroundPoint(RIGHT_PLATE_SPAWN_POINT.x, RIGHT_PLATE_SPAWN_POINT.y);
    const exitPoint = this.getBackgroundPoint(-PLATE_EXIT_MARGIN, RIGHT_PLATE_SPAWN_POINT.y);
    const trajectory = this.createArcTrajectory({
      startX: spawnPoint.x,
      startY: spawnPoint.y,
      endX: exitPoint.x,
      endY: exitPoint.y
    });

    this.activeTargets.push(this.createPlateTarget(trajectory, { isRightPlate: true }));
  }

  spawnSpecialPlate() {
    const spawnPoint = this.getBackgroundPoint(LEFT_SPECIAL_PLATE_SPAWN_POINT.x, LEFT_SPECIAL_PLATE_SPAWN_POINT.y);
    const exitPoint = this.getBackgroundPoint(1536 + PLATE_EXIT_MARGIN, LEFT_SPECIAL_PLATE_SPAWN_POINT.y);
    const trajectory = this.createArcTrajectory({
      startX: spawnPoint.x,
      startY: spawnPoint.y,
      endX: exitPoint.x,
      endY: exitPoint.y,
      minLaunchAngle: MIN_SPECIAL_LAUNCH_ANGLE
    });

    const hasPerfectRightBlock = this.currentRightBlockMisses === 0;

    if (hasPerfectRightBlock) {
      const specialPlate = SPECIAL_PLATE_CONFIGS[this.consecutivePerfectBlocks] ?? SPECIAL_PLATE_CONFIGS[SPECIAL_PLATE_CONFIGS.length - 1];

      this.specialPlatesSpawned += 1;
      this.consecutivePerfectBlocks += 1;
      this.activeTargets.push(this.createPlateTarget(trajectory, {
        tint: specialPlate.tint,
        hitScore: specialPlate.score,
        targetLabel: `Plato ${specialPlate.name}`,
        feedbackMessage: `Plato ${specialPlate.name} +${specialPlate.score}`,
        feedbackColor: specialPlate.feedbackColor,
        isSpecialPlate: true
      }));
    } else {
      this.specialPlatesSpawned = 0;
      this.activeTargets.push(this.createPlateTarget(trajectory, {
        targetLabel: 'Plato normal izquierda'
      }));
    }

    this.currentRightBlockMisses = 0;
  }

  createArcTrajectory(config) {
    const startX = config.startX;
    const startY = config.startY;
    const endX = config.endX;
    const endY = config.endY;
    const minLaunchAngle = config.minLaunchAngle ?? MIN_SPECIAL_LAUNCH_ANGLE;
    const travelDistance = Math.abs(endX - startX);
    const travelDuration = travelDistance / PLATE_FIXED_SPEED;
    const maxArcHeight = Math.min(PLATE_MAX_ARC_HEIGHT, Math.min(startY, endY) - 120);
    const minimumArcHeight = Phaser.Math.Clamp(
      Math.max(PLATE_MIN_ARC_HEIGHT, (travelDistance * Math.tan(Phaser.Math.DegToRad(minLaunchAngle))) / 4),
      0,
      maxArcHeight
    );
    const arcHeight = Phaser.Math.FloatBetween(minimumArcHeight, maxArcHeight);
    const controlX = (startX + endX) * 0.5;
    const controlY = Math.min(startY, endY) - (arcHeight * 2);
    const initialVelocityX = (2 * (controlX - startX)) / travelDuration;
    const initialVelocityY = (2 * (controlY - startY)) / travelDuration;
    const launchAngle = Phaser.Math.RadToDeg(
      Math.atan2(Math.abs(initialVelocityY), Math.abs(initialVelocityX))
    );

    return {
      startX,
      startY,
      endX,
      endY,
      controlX,
      controlY,
      travelDuration,
      launchAngle
    };
  }

  createPlateTarget(trajectory, config = {}) {
    const plate = new PlatePrefab(this, trajectory.startX, trajectory.startY, textureKeys.plate, {
      ...trajectory,
      scale: PLATE_SCALE
    });

    plate.setDepth(1.5);

    if (config.tint !== undefined) {
      plate.plateImage.setTint(config.tint);
    }

    plate.hitScore = config.hitScore ?? HIT_SCORE;
    plate.feedbackMessage = config.feedbackMessage ?? `Acierto +${plate.hitScore}`;
    plate.feedbackColor = config.feedbackColor ?? '#a7efb0';
    plate.missFeedback = config.missFeedback ?? 'Fallo';
    plate.countsAsMiss = config.countsAsMiss ?? true;
    plate.countsTowardHits = config.countsTowardHits ?? true;
    plate.modifiesDifficulty = config.modifiesDifficulty ?? true;
    plate.isRightPlate = config.isRightPlate ?? false;
    plate.isSpecialPlate = config.isSpecialPlate ?? false;
    plate.isFinalShip = false;
    plate.usesRoundSpeedMultiplier = true;

    return plate;
  }

  getRightTravelLimit() {
    return Math.max(this.scale.width + PLATE_EXIT_MARGIN, RIGHT_PLATE_SPAWN_POINT.x);
  }

  getBackgroundPoint(sourceX, sourceY) {
    if (!this.background?.texture) {
      return { x: sourceX, y: sourceY };
    }

    const originX = this.background.x - (this.background.displayWidth * 0.5);
    const originY = this.background.y - (this.background.displayHeight * 0.5);
    const normalizedX = sourceX / this.background.width;
    const normalizedY = sourceY / this.background.height;

    return {
      x: originX + (normalizedX * this.background.displayWidth),
      y: originY + (normalizedY * this.background.displayHeight)
    };
  }

  getShipFlightY() {
    return Phaser.Math.Clamp(this.scale.height * 0.24, 136, 240);
  }

  spawnFinalShip() {
    const flightY = this.getShipFlightY();
    const startX = -ALIEN_SHIP_MARGIN;
    const endX = this.getRightTravelLimit() + ALIEN_SHIP_MARGIN;
    const travelDistance = endX - startX;
    const ship = new BonusShipPrefab(this, startX, flightY, {
      startX,
      startY: flightY,
      endX,
      endY: flightY,
      controlX: (startX + endX) * 0.5,
      controlY: Math.max(84, flightY - 34),
      travelDuration: travelDistance / ALIEN_SHIP_SPEED,
      scale: ALIEN_SHIP_SCALE
    });

    ship.setDepth(1.6);
    ship.hitScore = ALIEN_SHIP_SCORE;
    ship.feedbackMessage = `Nave extraterrestre +${ALIEN_SHIP_SCORE}`;
    ship.feedbackColor = '#ffe4a6';
    ship.missFeedback = 'La nave se escapa';
    ship.countsAsMiss = false;
    ship.countsTowardHits = false;
    ship.modifiesDifficulty = false;
    ship.isRightPlate = false;
    ship.isFinalShip = true;
    ship.usesRoundSpeedMultiplier = false;

    this.finalShipSpawned = true;
    this.activeTargets.push(ship);
    this.setFeedback('Nave final en el cielo', '#ffe4a6');
  }

  update(_time, delta) {
    const baseDeltaSeconds = delta / 1000;
    const scaledDeltaSeconds = baseDeltaSeconds * this.plateSpeedMultiplier;

    for (let index = this.activeTargets.length - 1; index >= 0; index -= 1) {
      const target = this.activeTargets[index];
      const deltaSeconds = target.usesRoundSpeedMultiplier ? scaledDeltaSeconds : baseDeltaSeconds;

      target.advance(deltaSeconds);
    }

    this.updateShootZoneTracking();

    for (let index = this.activeTargets.length - 1; index >= 0; index -= 1) {
      const target = this.activeTargets[index];

      this.updateTargetShotWindow(target);

      if (!target.hasExitedPlayfield(this.scale.width)) {
        continue;
      }

      this.destroyTargetAt(index);
    }

    this.checkRoundResolution();
  }

  updateTargetShotWindow(target) {
    const isInsideShootZone = this.isTargetInsideAnyShootZone(target);

    if (isInsideShootZone) {
      target.markShootZoneEntry();
      return;
    }

    if (!target.hasRegisteredMiss && !target.wasHit && this.hasTargetPassedShootZones(target)) {
      this.registerMiss(target);
    }
  }

  updateShootZoneTracking() {
    if (!this.leftShootZone || !this.rightShootZone) {
      return;
    }

    const homeY = this.getShootZoneHomeY();

    if (this.activeTargets.length === 0) {
      this.leftShootZone.y = homeY;
      this.rightShootZone.y = homeY;
      return;
    }

    const leftTarget = this.getClosestTargetForZone(this.leftShootZone);
    const rightTarget = this.getClosestTargetForZone(this.rightShootZone);

    this.leftShootZone.y = leftTarget ? this.getClampedShootZoneY(leftTarget.y) : homeY;
    this.rightShootZone.y = rightTarget ? this.getClampedShootZoneY(rightTarget.y) : homeY;
  }

  getClosestTargetForZone(zone) {
    if (!zone) {
      return null;
    }

    return this.activeTargets.reduce((closestTarget, target) => {
      if (!closestTarget) {
        return target;
      }

      const currentDistance = Math.abs(target.x - zone.x);
      const closestDistance = Math.abs(closestTarget.x - zone.x);

      if (currentDistance < closestDistance) {
        return target;
      }

      return closestTarget;
    }, null);
  }

  getShootZoneHomeY() {
    return this.scale.height * SHOOT_ZONE_Y_RATIO;
  }

  getShootZoneBaseScale() {
    return this.shootZoneScaleMultiplier;
  }

  getClampedShootZoneY(targetY) {
    const zoneHeight = Math.max(
      this.leftShootZone?.displayHeight ?? 0,
      this.rightShootZone?.displayHeight ?? 0,
      SHOOT_ZONE_SIZE * this.shootZoneScaleMultiplier
    );
    const halfSize = zoneHeight * 0.5;

    return Phaser.Math.Clamp(targetY, halfSize, this.scale.height - halfSize);
  }

  hasTargetPassedShootZones(target) {
    if (!target || !this.leftShootZone || !this.rightShootZone) {
      return false;
    }

    const leftmostZoneEdge = Math.min(
      this.leftShootZone.x - (this.leftShootZone.displayWidth * 0.5),
      this.rightShootZone.x - (this.rightShootZone.displayWidth * 0.5)
    );
    const rightmostZoneEdge = Math.max(
      this.leftShootZone.x + (this.leftShootZone.displayWidth * 0.5),
      this.rightShootZone.x + (this.rightShootZone.displayWidth * 0.5)
    );
    const targetBounds = target.getBoundsRect();

    if (target.movementDirection < 0) {
      return targetBounds.right < leftmostZoneEdge;
    }

    return targetBounds.left > rightmostZoneEdge;
  }

  destroyTargetAt(index) {
    const [target] = this.activeTargets.splice(index, 1);
    target?.destroy();
  }

  isTargetInsideAnyShootZone(target) {
    return this.doesTargetOverlapZone(target, this.leftShootZone)
      || this.doesTargetOverlapZone(target, this.rightShootZone);
  }

  doesTargetOverlapZone(target, zone) {
    if (!target || !zone) {
      return false;
    }

    const zoneBounds = new Phaser.Geom.Rectangle(
      zone.x - (zone.displayWidth * 0.5),
      zone.y - (zone.displayHeight * 0.5),
      zone.displayWidth,
      zone.displayHeight
    );

    return Phaser.Geom.Intersects.RectangleToRectangle(target.getBoundsRect(), zoneBounds);
  }

  registerHit(index) {
    const target = this.activeTargets[index];

    if (!target) {
      return;
    }

    target.markHit();
    this.score += target.hitScore ?? HIT_SCORE;

    if (target.countsTowardHits) {
      this.hits += 1;
    }

    if (target.modifiesDifficulty) {
      this.increaseDifficulty();
    }

    this.spawnBrokenPlateEffect(target.x, target.y);
    this.setFeedback(target.feedbackMessage, target.feedbackColor);
    this.updateHud();
    this.destroyTargetAt(index);
    this.checkRoundResolution();
  }

  registerMiss(target) {
    target.markMissRegistered();

    if (!target.countsAsMiss) {
      this.setFeedback(target.missFeedback, '#ffd2a6');
      return;
    }

    this.misses += 1;

    if (target.isRightPlate) {
      this.currentRightBlockMisses += 1;
    }

    if (!target.isFinalShip) {
      this.specialPlatesSpawned = 0;
      this.consecutivePerfectBlocks = 0;
    }

    this.resetDifficulty();
    this.setFeedback(target.missFeedback, '#ffb6b6');
    this.updateHud();
  }

  checkRoundResolution() {
    if (this.roundEnding || !this.sequenceComplete || this.activeTargets.length > 0) {
      return;
    }

    if (!this.finalShipSpawned) {
      if (this.hits === TOTAL_PLATES && this.misses === 0) {
        this.spawnFinalShip();
        return;
      }

      this.finishRound();
      return;
    }

    this.finishRound();
  }

  increaseDifficulty() {
    this.plateSpeedMultiplier = Phaser.Math.Clamp(
      this.plateSpeedMultiplier + DIFFICULTY_STEP,
      1,
      MAX_PLATE_SPEED_MULTIPLIER
    );

    this.shootZoneScaleMultiplier = Phaser.Math.Clamp(
      this.shootZoneScaleMultiplier + DIFFICULTY_STEP,
      1,
      MAX_SHOOT_ZONE_SCALE_MULTIPLIER
    );

    this.applyShootZoneScale();
    this.syncPlateSpawnDelay();
  }

  resetDifficulty() {
    this.plateSpeedMultiplier = 1;
    this.shootZoneScaleMultiplier = 1;
    this.applyShootZoneScale();
    this.syncPlateSpawnDelay();
  }

  applyShootZoneScale() {
    if (this.leftShootZone) {
      this.leftShootZone.setScale(this.shootZoneScaleMultiplier);
    }

    if (this.rightShootZone) {
      this.rightShootZone.setScale(this.shootZoneScaleMultiplier);
    }

    this.updateShootZoneTracking();
  }

  spawnBrokenPlateEffect(x, y) {
    const effect = new BrokenPlateEffect(this, x, y);
    effect.setDepth(1.75);
  }

  setFeedback(message, color) {
    if (!this.feedbackText) {
      return;
    }

    this.feedbackText.setText(message);
    this.feedbackText.setColor(color);

    if (this.feedbackTimer) {
      this.feedbackTimer.remove(false);
    }

    this.feedbackTimer = this.time.delayedCall(SHOT_FEEDBACK_DURATION, () => {
      this.feedbackText?.setText(DEFAULT_FEEDBACK);
      this.feedbackText?.setColor('#f5f1d6');
      this.feedbackTimer = null;
    });
  }

  destroyAllTargets() {
    this.activeTargets.forEach((target) => target.destroy());
    this.activeTargets = [];
  }

  finishRound() {
    if (this.roundEnding) {
      return;
    }

    this.roundEnding = true;
    this.registry.set('lastScore', this.score);
    this.registry.set('lastDuration', this.elapsedSeconds);
    this.registry.set('lastHits', this.hits);
    this.registry.set('lastMisses', this.misses);
    this.scene.start(sceneKeys.scores, {
      score: this.score,
      duration: this.elapsedSeconds,
      hits: this.hits,
      misses: this.misses
    });
  }

  updateHud() {
    if (this.scoreText) {
      this.scoreText.setText(`Puntuacion: ${this.score} · Bloque derecho perfecto: ${this.currentRightBlockMisses === 0 ? 'si' : 'no'}`);
    }

    if (this.statusText) {
      this.statusText.setText(`Tiempo: ${this.elapsedSeconds}s · Platos: ${Math.min(this.hits + this.misses, TOTAL_PLATES)}/${TOTAL_PLATES} · Aciertos: ${this.hits} · Fallos: ${this.misses}`);
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
      this.hud.setPosition(width / 2, Phaser.Math.Clamp(HUD_TOP_OFFSET, 140, height - 140));
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

    this.applyShootZoneScale();
  }

  handleShutdown() {
    this.player?.stopAnimation();

    if (this.onResize) {
      this.scale.off('resize', this.onResize);
      this.onResize = null;
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

    this.stopPlateSpawner();

    if (this.feedbackTimer) {
      this.feedbackTimer.remove(false);
      this.feedbackTimer = null;
    }

    this.destroyAllTargets();
  }
}