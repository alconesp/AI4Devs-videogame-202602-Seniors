import Phaser from 'phaser';

const DEFAULT_FRAGMENT_PALETTE = Object.freeze([0xfff9e3, 0xf1c66c, 0xcf8b2a]);
const FRAGMENT_TEXTURE_KEY = '__plate-fragment__';
const FRAGMENT_COUNT = 12;
const FRAGMENT_LIFESPAN = Object.freeze({ min: 420, max: 720 });
const FLASH_DURATION = 120;

function ensureFragmentTexture(scene) {
  if (scene.textures.exists(FRAGMENT_TEXTURE_KEY)) {
    return FRAGMENT_TEXTURE_KEY;
  }

  const graphics = scene.make.graphics({ add: false });

  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(2, 1);
  graphics.lineTo(15, 4);
  graphics.lineTo(7, 13);
  graphics.lineTo(0, 9);
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture(FRAGMENT_TEXTURE_KEY, 16, 14);
  graphics.destroy();

  return FRAGMENT_TEXTURE_KEY;
}

export class BrokenPlateEffect extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);

    this.fragmentPalette = config.fragmentPalette ?? DEFAULT_FRAGMENT_PALETTE;
    this.cleanupTimer = null;
    this.emitter = scene.add.particles(0, 0, ensureFragmentTexture(scene), {
      emitting: false,
      lifespan: FRAGMENT_LIFESPAN,
      quantity: FRAGMENT_COUNT,
      speedX: { min: -240, max: 240 },
      speedY: { min: -320, max: -120 },
      gravityY: 720,
      rotate: { min: 0, max: 360 },
      angularVelocity: { min: -360, max: 360 },
      scale: { start: 1, end: 0.22 },
      alpha: { start: 0.95, end: 0 },
      tint: { onEmit: () => Phaser.Utils.Array.GetRandom(this.fragmentPalette) }
    });
    this.flash = scene.add.circle(0, 0, 12, 0xffffff, 0.92);

    this.add(this.flash);
    scene.add.existing(this);
    this.play();
  }

  setDepth(value) {
    super.setDepth(value);

    if (this.emitter) {
      this.emitter.setDepth(value);
    }

    return this;
  }

  play() {
    this.emitter.explode(FRAGMENT_COUNT, this.x, this.y);

    this.scene.tweens.add({
      targets: this.flash,
      scaleX: 2.8,
      scaleY: 2.8,
      alpha: 0,
      duration: FLASH_DURATION,
      ease: 'Quad.easeOut'
    });

    this.cleanupTimer = this.scene.time.delayedCall(FRAGMENT_LIFESPAN.max + 140, () => {
      this.destroy();
    });
  }

  destroy(fromScene) {
    if (this.cleanupTimer) {
      this.cleanupTimer.remove(false);
      this.cleanupTimer = null;
    }

    this.emitter?.destroy();
    this.emitter = null;
    super.destroy(fromScene);
  }
}