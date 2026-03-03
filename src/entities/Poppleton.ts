import Phaser from 'phaser';
import { Player } from './Player';
import {
  FLUTTER_GRAVITY,
  GRAVITY,
  POUNCE_VELOCITY,
  POUNCE_BOUNCE_VELOCITY,
} from '../config/GameConfig';

export class Poppleton extends Player {
  readonly characterName = 'poppleton';
  private isFluttering: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'poppleton');
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    // Sustain flutter while holding jump
    if (this.isFluttering && this.isJumpPressed) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setGravityY(FLUTTER_GRAVITY - GRAVITY);
    } else if (this.isFluttering && !this.isJumpPressed) {
      this.isFluttering = false;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setGravityY(0);
    }
  }

  specialAbility(): void {
    // Butterfly Float — double jump with slow descent
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-200); // second jump, slightly weaker
    this.isFluttering = true;
    body.setGravityY(FLUTTER_GRAVITY - GRAVITY);
    this.state = 'special';
  }

  attack(): void {
    // Pounce — short forward lunge
    this.state = 'attack';
    this.attackCooldown = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const direction = this.facingRight ? 1 : -1;
    body.setVelocityX(POUNCE_VELOCITY * direction);

    // Create a hitbox in front of the player
    const hitbox = this.scene.add.zone(
      this.x + (direction * 12),
      this.y,
      14,
      14
    );
    this.scene.physics.add.existing(hitbox, false);
    const hitboxBody = hitbox.body as Phaser.Physics.Arcade.Body;
    hitboxBody.setAllowGravity(false);

    // Emit event for enemy collision handling
    this.scene.events.emit('player-attack', hitbox, 'pounce');

    // Clean up
    this.scene.time.delayedCall(150, () => {
      hitbox.destroy();
      this.state = 'idle';
    });

    this.scene.time.delayedCall(300, () => {
      this.attackCooldown = false;
    });
  }

  bounceOffEnemy(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(POUNCE_BOUNCE_VELOCITY);
  }
}
