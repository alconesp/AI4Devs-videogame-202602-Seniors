import Phaser from 'phaser';

const SHARD_COLORS = [0xf5f1d6, 0xe5b75c, 0xcf8b2a];
const SHARD_LAYOUT = [
  { x: -10, y: -5, angle: -34 },
  { x: 9, y: -6, angle: 26 },
  { x: -12, y: 7, angle: 208 },
  { x: 10, y: 8, angle: 146 },
  { x: 0, y: -12, angle: -90 },
  { x: 0, y: 12, angle: 90 }
];

export class BrokenPlateEffect extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.flash = scene.add.circle(0, 0, 7, 0xfff9e3, 0.9).setDepth(0.1);
    this.shards = SHARD_LAYOUT.map((layout, index) => {
      const shard = scene.add.triangle(0, 0, 0, -7, 9, 0, 0, 7, SHARD_COLORS[index % SHARD_COLORS.length], 1)
        .setPosition(layout.x, layout.y)
        .setRotation(Phaser.Math.DegToRad(layout.angle))
        .setStrokeStyle(2, 0x7a4d14, 1);

      return shard;
    });

    this.add([this.flash, ...this.shards]);
    scene.add.existing(this);
    this.play();
  }

  play() {
    this.scene.tweens.add({
      targets: this.flash,
      scaleX: 2.4,
      scaleY: 2.4,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut'
    });

    this.shards.forEach((shard) => {
      const distance = Phaser.Math.Between(16, 30);
      const direction = Phaser.Math.FloatBetween(-0.55, 0.55);

      this.scene.tweens.add({
        targets: shard,
        x: shard.x + Math.cos(shard.rotation + direction) * distance,
        y: shard.y + Math.sin(shard.rotation + direction) * distance,
        angle: shard.angle + Phaser.Math.Between(-80, 80),
        alpha: 0,
        scaleX: 0.55,
        scaleY: 0.55,
        duration: Phaser.Math.Between(280, 420),
        ease: 'Cubic.easeOut'
      });
    });

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 440,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.destroy();
      }
    });
  }
}