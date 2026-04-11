import Phaser from 'phaser';

export class PlatePrefab extends Phaser.GameObjects.Container {
  constructor(scene, x, y, textureKey, config = {}) {
    const plateImage = scene.add.image(0, 0, textureKey).setOrigin(0.5);

    super(scene, x, y, [plateImage]);

    this.plateImage = plateImage;
    this.startPoint = new Phaser.Math.Vector2(config.startX ?? x, config.startY ?? y);
    this.endPoint = new Phaser.Math.Vector2(config.endX ?? x, config.endY ?? y);
    this.controlPoint = new Phaser.Math.Vector2(config.controlX ?? x, config.controlY ?? y);
    this.travelDuration = config.travelDuration ?? 1;
    this.elapsedTravel = 0;
    this.launchAngle = config.launchAngle ?? 0;
    this.wasInShootZone = false;
    this.hasRegisteredMiss = false;
    this.wasHit = false;

    if (config.scale !== undefined) {
      this.plateImage.setScale(config.scale);
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

  hasExitedLeftBoundary() {
    const halfWidth = this.plateImage.displayWidth * 0.5;

    return this.x < -halfWidth;
  }

  getBoundsRect() {
    const width = this.plateImage.displayWidth;
    const height = this.plateImage.displayHeight;

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