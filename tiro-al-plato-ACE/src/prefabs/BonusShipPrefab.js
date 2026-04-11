import Phaser from 'phaser';

const WINDOW_COLOR = 0xdff8ff;
const LIGHT_COLORS = [0xf5f1d6, 0xe5b75c, 0x89d4ff, 0xf5f1d6, 0xe5b75c];

export class BonusShipPrefab extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);

    this.startPoint = new Phaser.Math.Vector2(config.startX ?? x, config.startY ?? y);
    this.endPoint = new Phaser.Math.Vector2(config.endX ?? x, config.endY ?? y);
    this.controlPoint = new Phaser.Math.Vector2(config.controlX ?? x, config.controlY ?? y);
    this.travelDuration = config.travelDuration ?? 1;
    this.elapsedTravel = 0;
    this.wasInShootZone = false;
    this.hasRegisteredMiss = false;
    this.wasHit = false;
    this.movementDirection = Math.sign(this.endPoint.x - this.startPoint.x) || 1;

    const hull = scene.add.ellipse(0, 12, 170, 56, 0x5f9bd3, 0.98)
      .setStrokeStyle(3, 0xe5b75c, 1);
    const dome = scene.add.ellipse(0, -8, 74, 40, WINDOW_COLOR, 0.94)
      .setStrokeStyle(2, 0x0f2233, 0.85);
    const beam = scene.add.rectangle(0, 24, 64, 10, 0xf6e38a, 0.9)
      .setStrokeStyle(2, 0xe5b75c, 0.9);
    const lights = LIGHT_COLORS.map((color, index) => scene.add.circle(-52 + (index * 26), 18, 6, color, 1));

    this.add([beam, hull, dome, ...lights]);
    this.setSize(176, 74);

    if (config.scale !== undefined) {
      this.setScale(config.scale);
    }

    scene.add.existing(this);
  }

  advance(deltaSeconds) {
    this.elapsedTravel = Math.min(this.elapsedTravel + deltaSeconds, this.travelDuration);

    const progress = Phaser.Math.Clamp(this.elapsedTravel / this.travelDuration, 0, 1);
    const inverseProgress = 1 - progress;

    this.x = (inverseProgress * inverseProgress * this.startPoint.x)
      + (2 * inverseProgress * progress * this.controlPoint.x)
      + (progress * progress * this.endPoint.x);

    this.y = (inverseProgress * inverseProgress * this.startPoint.y)
      + (2 * inverseProgress * progress * this.controlPoint.y)
      + (progress * progress * this.endPoint.y);
  }

  hasExitedPlayfield(viewWidth) {
    const halfWidth = (this.width * this.scaleX) * 0.5;

    if (this.movementDirection < 0) {
      return this.x < -halfWidth;
    }

    return this.x > viewWidth + halfWidth;
  }

  getBoundsRect() {
    const width = this.width * this.scaleX;
    const height = this.height * this.scaleY;

    return new Phaser.Geom.Rectangle(
      this.x - (width * 0.5),
      this.y - (height * 0.5),
      width,
      height
    );
  }

  markShootZoneEntry() {
    this.wasInShootZone = true;
  }

  markMissRegistered() {
    this.hasRegisteredMiss = true;
  }

  markHit() {
    this.wasHit = true;
  }
}