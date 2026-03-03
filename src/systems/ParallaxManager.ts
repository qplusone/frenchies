import Phaser from 'phaser';

export interface ParallaxLayer {
  image: Phaser.GameObjects.TileSprite;
  scrollFactorX: number;
  scrollFactorY: number;
}

export class ParallaxManager {
  private scene: Phaser.Scene;
  private layers: ParallaxLayer[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  addLayer(
    textureKey: string,
    scrollFactorX: number,
    scrollFactorY: number = 0,
    y: number = 0,
    depth: number = -10,
  ): ParallaxLayer {
    const cam = this.scene.cameras.main;
    const image = this.scene.add.tileSprite(
      0, y,
      cam.width, cam.height,
      textureKey,
    );
    image.setOrigin(0, 0);
    image.setScrollFactor(0);
    image.setDepth(depth);

    const layer: ParallaxLayer = { image, scrollFactorX, scrollFactorY };
    this.layers.push(layer);
    return layer;
  }

  update(): void {
    const cam = this.scene.cameras.main;
    for (const layer of this.layers) {
      layer.image.tilePositionX = cam.scrollX * layer.scrollFactorX;
      layer.image.tilePositionY = cam.scrollY * layer.scrollFactorY;
    }
  }

  destroy(): void {
    for (const layer of this.layers) {
      layer.image.destroy();
    }
    this.layers = [];
  }
}
