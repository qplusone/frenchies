import Phaser from 'phaser';
import { Boss, BossConfig } from './Boss';
import {
  BOSS_HP,
  BOSS_PHASE_THRESHOLDS,
  GAME_WIDTH,
} from '../../config/GameConfig';

interface PhaseParams {
  waveCount: number;
  bubbleCount: number;
  attackInterval: number;
  hopDistance: number;
}

const PHASE_CONFIG: Record<number, PhaseParams> = {
  1: { waveCount: 2, bubbleCount: 1, attackInterval: 3000, hopDistance: 32 },
  2: { waveCount: 3, bubbleCount: 2, attackInterval: 2500, hopDistance: 48 },
  3: { waveCount: 4, bubbleCount: 3, attackInterval: 2000, hopDistance: 64 },
};

const VULNERABILITY_DURATION = 2000;
const WAVE_SPEED = 120;
const WAVE_AMPLITUDE = 24;
const WAVE_FREQUENCY = 0.008;
const BUBBLE_SPEED = 40;
const BUBBLE_HOMING_STRENGTH = 0.02;
const HOP_DURATION = 400;
const MOUTH_OPEN_TINT = 0x66ff66;

export class GrandGrenouille extends Boss {
  readonly bossName = 'Le Grand Grenouille';

  private waveGroup!: Phaser.Physics.Arcade.Group;
  private bubbleGroup!: Phaser.Physics.Arcade.Group;
  private phaseParams: PhaseParams = PHASE_CONFIG[1];
  private isHopping: boolean = false;
  private hopTween: Phaser.Tweens.Tween | null = null;
  private vulnerabilityTimer: Phaser.Time.TimerEvent | null = null;
  private attackCycleStep: 'wave' | 'bubble' | 'vulnerable' | 'idle' = 'idle';

  /** Track sine-wave origin Y for each wave projectile */
  private waveOrigins: Map<Phaser.Physics.Arcade.Sprite, number> = new Map();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      hp: BOSS_HP.GRENOUILLE,
      damage: 1,
      phaseThresholds: BOSS_PHASE_THRESHOLDS.GRENOUILLE,
    };
    super(scene, x, y, 'boss_grenouille', config);

    this.waveGroup = this.scene.physics.add.group({
      allowGravity: false,
      immovable: false,
    });

    this.bubbleGroup = this.scene.physics.add.group({
      allowGravity: false,
      immovable: false,
    });

    this.setScale(2);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 28);
    body.setOffset(2, 4);
  }

  /** Returns the wave projectile group for external collision setup. */
  getWaveGroup(): Phaser.Physics.Arcade.Group {
    return this.waveGroup;
  }

  /** Returns the fog bubble group for external collision setup. */
  getBubbleGroup(): Phaser.Physics.Arcade.Group {
    return this.bubbleGroup;
  }

  initBehavior(): void {
    this.phaseParams = PHASE_CONFIG[this.currentPhase];
    this.startAttackLoop();
    this.startHopLoop();
  }

  update(time: number, delta: number): void {
    if (this.isDying || !this.active) return;

    this.updateWaveProjectiles(time);
    this.updateFogBubbles(delta);
    this.cleanOffscreenProjectiles();
  }

  protected onPhaseChange(_oldPhase: number, newPhase: number): void {
    this.phaseParams = PHASE_CONFIG[newPhase] ?? PHASE_CONFIG[3];

    // Flash to indicate phase change
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        if (this.active) this.setAlpha(1);
      },
    });

    // Restart attack timer with new interval
    this.restartAttackLoop();
  }

  // -------------------------------------------------------
  // Attack loop
  // -------------------------------------------------------

  private startAttackLoop(): void {
    if (this.attackTimer) {
      this.attackTimer.destroy();
    }

    this.attackTimer = this.scene.time.addEvent({
      delay: this.phaseParams.attackInterval,
      callback: this.runAttackCycle,
      callbackScope: this,
      loop: true,
    });

    // Fire the first attack immediately
    this.runAttackCycle();
  }

  private restartAttackLoop(): void {
    if (this.attackTimer) {
      this.attackTimer.destroy();
      this.attackTimer = null;
    }
    this.startAttackLoop();
  }

  private runAttackCycle(): void {
    if (this.isDying || !this.active) return;

    this.isAttacking = true;
    this.attackCycleStep = 'wave';

    // Step 1: Fire wave attack
    this.fireWaveAttack();

    // Step 2: After a short delay, fire fog bubbles
    this.scene.time.delayedCall(500, () => {
      if (this.isDying || !this.active) return;
      this.attackCycleStep = 'bubble';
      this.fireFogBubbles();

      // Step 3: After bubbles, open vulnerability window
      this.scene.time.delayedCall(600, () => {
        if (this.isDying || !this.active) return;
        this.openVulnerabilityWindow();
      });
    });
  }

  // -------------------------------------------------------
  // Wave attack
  // -------------------------------------------------------

  private fireWaveAttack(): void {
    const count = this.phaseParams.waveCount;
    const facingLeft = this.flipX;
    const dirX = facingLeft ? -1 : 1;

    for (let i = 0; i < count; i++) {
      const offsetY = (i - (count - 1) / 2) * 16;
      const spawnX = this.x + dirX * 20;
      const spawnY = this.y + offsetY;

      const projectile = this.waveGroup.create(
        spawnX,
        spawnY,
        'wave_projectile',
      ) as Phaser.Physics.Arcade.Sprite;

      if (!projectile) continue;

      projectile.setActive(true).setVisible(true);
      const pBody = projectile.body as Phaser.Physics.Arcade.Body;
      pBody.setAllowGravity(false);
      pBody.setVelocityX(dirX * WAVE_SPEED);

      // Store the origin Y for sine calculation
      this.waveOrigins.set(projectile, spawnY);

      // Set data for sine-wave tracking
      projectile.setData('startTime', this.scene.time.now);
      projectile.setData('dirX', dirX);
    }
  }

  private updateWaveProjectiles(time: number): void {
    this.waveGroup.getChildren().forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;

      const startTime = sprite.getData('startTime') as number;
      const elapsed = time - startTime;
      const originY = this.waveOrigins.get(sprite);
      if (originY === undefined) return;

      sprite.y = originY + Math.sin(elapsed * WAVE_FREQUENCY) * WAVE_AMPLITUDE;
    });
  }

  // -------------------------------------------------------
  // Fog bubble attack
  // -------------------------------------------------------

  private fireFogBubbles(): void {
    const count = this.phaseParams.bubbleCount;

    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(-0.6, 0.6);
      const spawnX = this.x;
      const spawnY = this.y - 10;

      const bubble = this.bubbleGroup.create(
        spawnX,
        spawnY,
        'fog_bubble',
      ) as Phaser.Physics.Arcade.Sprite;

      if (!bubble) continue;

      bubble.setActive(true).setVisible(true);
      const bBody = bubble.body as Phaser.Physics.Arcade.Body;
      bBody.setAllowGravity(false);

      // Initial velocity with slight spread
      const dirX = this.flipX ? -1 : 1;
      bBody.setVelocity(
        dirX * BUBBLE_SPEED + Math.sin(angle) * 30,
        -BUBBLE_SPEED * 0.5 + Math.cos(angle) * 20,
      );

      bubble.setData('lifetime', 0);
      bubble.setAlpha(0.8);
    }
  }

  private updateFogBubbles(delta: number): void {
    const player = this.findPlayer();
    if (!player) return;

    this.bubbleGroup.getChildren().forEach((child) => {
      const bubble = child as Phaser.Physics.Arcade.Sprite;
      if (!bubble.active) return;

      // Track lifetime for despawn
      const lifetime = (bubble.getData('lifetime') as number) + delta;
      bubble.setData('lifetime', lifetime);

      if (lifetime > 6000) {
        this.destroyBubble(bubble);
        return;
      }

      // Loose homing toward player
      const bBody = bubble.body as Phaser.Physics.Arcade.Body;
      const dx = player.x - bubble.x;
      const dy = player.y - bubble.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        bBody.setVelocity(
          bBody.velocity.x + nx * BUBBLE_HOMING_STRENGTH * delta,
          bBody.velocity.y + ny * BUBBLE_HOMING_STRENGTH * delta,
        );

        // Clamp bubble speed
        const maxSpeed = BUBBLE_SPEED * 2;
        const speed = bBody.velocity.length();
        if (speed > maxSpeed) {
          bBody.velocity.scale(maxSpeed / speed);
        }
      }

      // Pulse alpha for foggy effect
      bubble.setAlpha(0.6 + Math.sin(lifetime * 0.005) * 0.2);
    });
  }

  private destroyBubble(bubble: Phaser.Physics.Arcade.Sprite): void {
    bubble.setActive(false).setVisible(false);
    bubble.destroy();
  }

  // -------------------------------------------------------
  // Vulnerability window
  // -------------------------------------------------------

  private openVulnerabilityWindow(): void {
    if (this.isDying || !this.active) return;

    this.attackCycleStep = 'vulnerable';
    this.isVulnerable = true;
    this.isAttacking = false;

    // Visual indicator: mouth open (green tint)
    this.setTint(MOUTH_OPEN_TINT);

    this.vulnerabilityTimer = this.scene.time.delayedCall(
      VULNERABILITY_DURATION,
      () => {
        if (this.isDying || !this.active) return;
        this.closeVulnerabilityWindow();
      },
    );
  }

  private closeVulnerabilityWindow(): void {
    this.isVulnerable = false;
    this.attackCycleStep = 'idle';
    this.clearTint();
  }

  // -------------------------------------------------------
  // Hop / idle movement
  // -------------------------------------------------------

  private startHopLoop(): void {
    this.performHop();
  }

  private performHop(): void {
    if (this.isDying || !this.active) return;

    this.isHopping = true;
    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    const distance = this.phaseParams.hopDistance;
    let targetX = this.x + direction * distance;

    // Clamp within world bounds (leave some margin for the sprite)
    const margin = 24;
    targetX = Phaser.Math.Clamp(targetX, margin, GAME_WIDTH - margin);

    // Flip sprite to face hop direction
    this.setFlipX(direction > 0);

    this.hopTween = this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: this.y - distance * 0.4,
      duration: HOP_DURATION * 0.5,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.isDying || !this.active) return;

        // Come back down
        this.hopTween = this.scene.tweens.add({
          targets: this,
          y: this.y + distance * 0.4,
          duration: HOP_DURATION * 0.5,
          ease: 'Sine.easeIn',
          onComplete: () => {
            this.isHopping = false;

            if (this.isDying || !this.active) return;

            // Wait a beat then hop again
            const hopDelay = Phaser.Math.Between(600, 1200);
            this.scene.time.delayedCall(hopDelay, () => {
              this.performHop();
            });
          },
        });
      },
    });
  }

  // -------------------------------------------------------
  // Utility
  // -------------------------------------------------------

  private findPlayer(): Phaser.Physics.Arcade.Sprite | null {
    // Search for player in the scene's physics world
    const bodies = this.scene.physics.world.bodies;
    let player: Phaser.Physics.Arcade.Sprite | null = null;

    bodies.iterate((body: Phaser.Physics.Arcade.Body) => {
      const gameObject = body.gameObject;
      if (
        gameObject &&
        gameObject !== this &&
        gameObject.getData('isPlayer') === true
      ) {
        player = gameObject as Phaser.Physics.Arcade.Sprite;
      }
      return true;
    });

    return player;
  }

  private cleanOffscreenProjectiles(): void {
    const margin = 32;

    this.waveGroup.getChildren().forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      if (
        sprite.active &&
        (sprite.x < -margin ||
          sprite.x > GAME_WIDTH + margin ||
          sprite.y < -margin ||
          sprite.y > GAME_WIDTH + margin)
      ) {
        this.waveOrigins.delete(sprite);
        sprite.setActive(false).setVisible(false);
        sprite.destroy();
      }
    });

    this.bubbleGroup.getChildren().forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      if (
        sprite.active &&
        (sprite.x < -margin * 2 || sprite.x > GAME_WIDTH + margin * 2)
      ) {
        this.destroyBubble(sprite);
      }
    });
  }

  destroy(fromScene?: boolean): void {
    if (this.hopTween) {
      this.hopTween.stop();
      this.hopTween = null;
    }
    if (this.attackTimer) {
      this.attackTimer.destroy();
      this.attackTimer = null;
    }
    if (this.vulnerabilityTimer) {
      this.vulnerabilityTimer.destroy();
      this.vulnerabilityTimer = null;
    }

    this.waveOrigins.clear();
    this.waveGroup.destroy(true);
    this.bubbleGroup.destroy(true);

    super.destroy(fromScene);
  }
}
