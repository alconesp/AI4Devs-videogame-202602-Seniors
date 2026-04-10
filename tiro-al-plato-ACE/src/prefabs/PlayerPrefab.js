import Phaser from 'phaser';

export class PlayerPrefab extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    const silhouette = scene.add.rectangle(0, 0, 64, 104, 0x11212f, 0.9).setStrokeStyle(2, 0xf5f1d6, 0.9);
    const shoulders = scene.add.rectangle(0, 36, 110, 24, 0x1c3347, 0.95).setStrokeStyle(2, 0xe5b75c, 0.9);
    const marker = scene.add.text(0, -78, 'Jugador', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#f5f1d6'
    }).setOrigin(0.5);

    super(scene, x, y, [shoulders, silhouette, marker]);

    scene.add.existing(this);
  }
}