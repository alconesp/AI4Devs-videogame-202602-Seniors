import Phaser from 'phaser';

export class PlayerPrefab extends Phaser.GameObjects.Container {
  constructor(scene, x, y, textureKey) {
    const playerImage = scene.add.image(0, 0, textureKey).setOrigin(0.5);

    super(scene, x, y, [playerImage]);

    this.playerImage = playerImage;
    this.textureKey = textureKey;
    this.defaultTextureKey = textureKey;
    this.frameTimer = null;
    this.shotTimer = null;
    this.animationSequence = [];
    this.animationStepIndex = 0;

    scene.add.existing(this);
  }

  setTextureKey(textureKey) {
    if (!this.playerImage || !this.scene.textures.exists(textureKey)) {
      return;
    }

    this.textureKey = textureKey;
    this.playerImage.setTexture(textureKey);
  }

  playShot(textureKey, config = {}) {
    const resetDelay = config.resetDelay ?? 180;

    this.stopAnimation();
    this.setTextureKey(textureKey);

    this.shotTimer = this.scene.time.delayedCall(resetDelay, () => {
      this.setTextureKey(this.defaultTextureKey);
      this.shotTimer = null;
    });
  }

  resizeToCover(width, height) {
    if (!this.playerImage?.texture) {
      return;
    }

    const scale = Math.max(width / this.playerImage.width, height / this.playerImage.height);

    this.setPosition(width / 2, height / 2);
    this.playerImage.setScale(scale);
  }

  playLoop(sequence, config = {}) {
    if (!Array.isArray(sequence) || sequence.length === 0) {
      return;
    }

    this.stopAnimation();
    this.animationSequence = sequence.slice();
    this.animationStepIndex = 0;
    this.setTextureKey(this.animationSequence[0]);
    this.scheduleNextFrame(config);
  }

  scheduleNextFrame(config) {
    const minDelay = config.minDelay ?? 900;
    const maxDelay = config.maxDelay ?? 2200;
    const delay = Phaser.Math.Between(minDelay, maxDelay);

    this.frameTimer = this.scene.time.delayedCall(delay, () => {
      if (this.animationSequence.length === 0) {
        return;
      }

      this.animationStepIndex = (this.animationStepIndex + 1) % this.animationSequence.length;
      this.setTextureKey(this.animationSequence[this.animationStepIndex]);
      this.scheduleNextFrame(config);
    });
  }

  stopAnimation() {
    if (this.frameTimer) {
      this.frameTimer.remove(false);
      this.frameTimer = null;
    }

    if (this.shotTimer) {
      this.shotTimer.remove(false);
      this.shotTimer = null;
    }

    this.animationSequence = [];
    this.animationStepIndex = 0;
  }

  destroy(fromScene) {
    this.stopAnimation();
    super.destroy(fromScene);
  }
}