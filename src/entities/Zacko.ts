import Phaser from 'phaser';
import { Player } from './Player';
import {
  DASH_VELOCITY,
  DASH_DURATION,
  BARK_SPEED,
  BARK_LIFESPAN,
} from '../config/GameConfig';

export class Zacko extends Player {
  readonly characterName = 'zacko';
  private isDashing: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'zacko');
  }

  update(time: number, delta: number): void {
    // During dash, skip normal horizontal movement
    if (this.isDashing) return;
    super.update(time, delta);
  }

  specialAbility(): void {
    // Bat Dash — quick horizontal air-dash
    this.state = 'special';
    this.isDashing = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const direction = this.facingRight ? 1 : -1;
    body.setVelocityX(DASH_VELOCITY * direction);
    body.setVelocityY(0);
    body.setAllowGravity(false);

    // End dash after duration
    this.scene.time.delayedCall(DASH_DURATION, () => {
      this.isDashing = false;
      body.setAllowGravity(true);
      if (this.state === 'special') {
        this.state = 'fall';
      }
    });
  }

  attack(): void {
    // Bark — short-range sonic projectile
    this.state = 'attack';
    this.attackCooldown = true;

    const direction = this.facingRight ? 1 : -1;
    const projectile = this.scene.physics.add.sprite(
      this.x + (direction * 10),
      this.y,
      'bark_projectile'
    );

    const projBody = projectile.body as Phaser.Physics.Arcade.Body;
    projBody.setAllowGravity(false);
    projBody.setVelocityX(BARK_SPEED * direction);

    // Emit event for enemy collision handling
    this.scene.events.emit('player-attack', projectile, 'bark');

    // Destroy after lifespan
    this.scene.time.delayedCall(BARK_LIFESPAN, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });

    this.scene.time.delayedCall(150, () => {
      this.state = 'idle';
    });

    this.scene.time.delayedCall(400, () => {
      this.attackCooldown = false;
    });
  }
}
