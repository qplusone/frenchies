import Phaser from 'phaser';
import { Boss, BossConfig } from './Boss';
import {
  BOSS_HP,
  BOSS_PHASE_THRESHOLDS,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '../../config/GameConfig';

type CygneState = 'spawning_clones' | 'gliding' | 'vulnerable' | 'diving' | 'idle';

interface PhaseParams {
  cloneCount: number;
  glideSpeed: number;
  diveDuration: number;
  vulnerabilityDuration: number;
}

const PHASE_CONFIG: Record<number, PhaseParams> = {
  1: { cloneCount: 2, glideSpeed: 100, diveDuration: 800, vulnerabilityDuration: 2000 },
  2: { cloneCount: 3, glideSpeed: 140, diveDuration: 600, vulnerabilityDuration: 2000 },
};

const REAL_ALPHA = 0.95;
const CLONE_ALPHA = 0.85;
const IDLE_DURATION = 800;
const SPAWN_STAGGER_DELAY = 200;
const DIVE_ZONE_RADIUS = 20;
const DIVE_ZONE_DURATION = 1500;
const SHATTER_PARTICLE_COUNT = 8;
const SHATTER_PARTICLE_SPEED = 60;

export class CygneGris extends Boss {
  readonly bossName = 'Le Cygne Gris';

  private bossState: CygneState = 'idle';
  private phaseParams: PhaseParams = PHASE_CONFIG[1];
  private cloneGroup!: Phaser.Physics.Arcade.Group;
  private diveZoneGroup!: Phaser.Physics.Arcade.Group;

  private glideDirection: number = 1; // 1 = right, -1 = left
  private glideHeights: number[] = [];
  private idleTimer: number = 0;
  private cycleStarted: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      hp: BOSS_HP.CYGNE,
      damage: 1,
      phaseThresholds: BOSS_PHASE_THRESHOLDS.CYGNE,
    };
    super(scene, x, y, 'boss_cygne', config);

    this.setDisplaySize(32, 32);
    this.setAlpha(REAL_ALPHA);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCollideWorldBounds(false);

    this.cloneGroup = this.scene.physics.add.group({
      allowGravity: false,
      immovable: false,
    });

    this.diveZoneGroup = this.scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
  }

  /** Returns the clone group for external collision setup (player attacks vs clones). */
  getCloneGroup(): Phaser.Physics.Arcade.Group {
    return this.cloneGroup;
  }

  /** Returns the dive damage zone group for external collision setup. */
  getDiveZoneGroup(): Phaser.Physics.Arcade.Group {
    return this.diveZoneGroup;
  }

  initBehavior(): void {
    this.phaseParams = PHASE_CONFIG[this.currentPhase];
    this.cycleStarted = true;
    this.bossState = 'idle';
    this.idleTimer = 0;
    this.isVulnerable = false;

    this.glideDirection = this.x < GAME_WIDTH / 2 ? 1 : -1;
  }

  update(_time: number, delta: number): void {
    if (this.isDying || !this.active || !this.cycleStarted) return;

    switch (this.bossState) {
      case 'idle':
        this.updateIdle(delta);
        break;
      case 'spawning_clones':
        // Spawning is driven by delayed calls; nothing to tick here
        break;
      case 'gliding':
        this.updateGliding();
        break;
      case 'vulnerable':
        // Vulnerability window is timer-driven
        break;
      case 'diving':
        // Dive is tween-driven
        break;
    }
  }

  // -------------------------------------------------------
  // Idle
  // -------------------------------------------------------

  private updateIdle(delta: number): void {
    this.idleTimer += delta;

    if (this.idleTimer >= IDLE_DURATION) {
      this.enterSpawningClones();
    }
  }

  // -------------------------------------------------------
  // Clone spawning
  // -------------------------------------------------------

  private enterSpawningClones(): void {
    this.bossState = 'spawning_clones';
    this.isVulnerable = false;
    this.isAttacking = false;

    // Destroy any leftover clones from previous cycle
    this.destroyAllClones();

    // Generate randomised heights for real boss + clones
    const totalSwans = 1 + this.phaseParams.cloneCount;
    this.glideHeights = this.generateGlideHeights(totalSwans);

    // Place the real boss at the first height slot
    const realIndex = Phaser.Math.Between(0, totalSwans - 1);
    const startX = this.glideDirection === 1 ? -16 : GAME_WIDTH + 16;
    this.setPosition(startX, this.glideHeights[realIndex]);
    this.setFlipX(this.glideDirection === -1);

    // Spawn clones at the remaining height slots with a small stagger
    let cloneSlot = 0;
    for (let i = 0; i < totalSwans; i++) {
      if (i === realIndex) continue;

      const height = this.glideHeights[i];
      const delay = cloneSlot * SPAWN_STAGGER_DELAY;
      cloneSlot++;

      this.scene.time.delayedCall(delay, () => {
        if (this.isDying || !this.active) return;
        this.spawnClone(startX, height);
      });
    }

    // After all clones are spawned, begin the glide
    const totalSpawnTime = (this.phaseParams.cloneCount - 1) * SPAWN_STAGGER_DELAY + 100;
    this.scene.time.delayedCall(totalSpawnTime, () => {
      if (this.isDying || !this.active) return;
      this.enterGliding();
    });
  }

  private spawnClone(x: number, y: number): void {
    const clone = this.cloneGroup.create(
      x,
      y,
      'boss_cygne_clone',
    ) as Phaser.Physics.Arcade.Sprite;

    if (!clone) return;

    clone.setActive(true).setVisible(true);
    clone.setDisplaySize(32, 32);
    clone.setAlpha(CLONE_ALPHA);
    clone.setFlipX(this.glideDirection === -1);

    const cloneBody = clone.body as Phaser.Physics.Arcade.Body;
    cloneBody.setAllowGravity(false);
    cloneBody.setSize(28, 28);
    cloneBody.setOffset(2, 2);
  }

  private generateGlideHeights(count: number): number[] {
    const minY = 40;
    const maxY = GAME_HEIGHT - 60;
    const spacing = (maxY - minY) / count;
    const heights: number[] = [];

    for (let i = 0; i < count; i++) {
      const base = minY + spacing * i + spacing * 0.5;
      const jitter = Phaser.Math.FloatBetween(-spacing * 0.2, spacing * 0.2);
      heights.push(Phaser.Math.Clamp(base + jitter, minY, maxY));
    }

    // Shuffle so the real boss position is not predictable by height order
    Phaser.Utils.Array.Shuffle(heights);
    return heights;
  }

  // -------------------------------------------------------
  // Glide attack
  // -------------------------------------------------------

  private enterGliding(): void {
    this.bossState = 'gliding';
    this.isAttacking = true;
    this.isVulnerable = false;

    const vx = this.phaseParams.glideSpeed * this.glideDirection;

    // Set velocity on real boss
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(vx);

    // Set velocity on all clones
    this.cloneGroup.getChildren().forEach((child) => {
      const clone = child as Phaser.Physics.Arcade.Sprite;
      if (!clone.active) return;
      const cloneBody = clone.body as Phaser.Physics.Arcade.Body;
      cloneBody.setVelocityX(vx);
    });
  }

  private updateGliding(): void {
    // Check if real boss has crossed the arena
    const pastEnd =
      (this.glideDirection === 1 && this.x >= GAME_WIDTH + 16) ||
      (this.glideDirection === -1 && this.x <= -16);

    if (pastEnd) {
      this.enterVulnerabilityWindow();
    }
  }

  // -------------------------------------------------------
  // Vulnerability window
  // -------------------------------------------------------

  private enterVulnerabilityWindow(): void {
    this.bossState = 'vulnerable';
    this.isAttacking = false;
    this.isVulnerable = true;

    // Stop all movement and reposition swans in a line inside the arena
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);

    // Place the real boss and clones at evenly spaced positions inside the arena
    const totalSwans = 1 + this.getActiveCloneCount();
    const spacing = GAME_WIDTH / (totalSwans + 1);
    const positionsX: number[] = [];
    for (let i = 0; i < totalSwans; i++) {
      positionsX.push(spacing * (i + 1));
    }
    Phaser.Utils.Array.Shuffle(positionsX);

    // Assign position to real boss
    let posIndex = 0;
    const targetY = GAME_HEIGHT * 0.35;

    this.scene.tweens.add({
      targets: this,
      x: positionsX[posIndex],
      y: targetY,
      duration: 300,
      ease: 'Sine.easeOut',
    });
    posIndex++;

    // Assign positions to clones
    this.cloneGroup.getChildren().forEach((child) => {
      const clone = child as Phaser.Physics.Arcade.Sprite;
      if (!clone.active || posIndex >= positionsX.length) return;

      const cloneBody = clone.body as Phaser.Physics.Arcade.Body;
      cloneBody.setVelocityX(0);

      this.scene.tweens.add({
        targets: clone,
        x: positionsX[posIndex],
        y: targetY + Phaser.Math.FloatBetween(-8, 8),
        duration: 300,
        ease: 'Sine.easeOut',
      });
      posIndex++;
    });

    // End vulnerability after the window expires
    this.scene.time.delayedCall(this.phaseParams.vulnerabilityDuration, () => {
      if (this.isDying || !this.active) return;
      this.exitVulnerabilityWindow();
    });
  }

  private exitVulnerabilityWindow(): void {
    this.isVulnerable = false;

    // Check phase transitions after vulnerability closes
    this.checkPhaseTransition();

    // Alternate glide direction for next cycle
    this.glideDirection *= -1;

    this.enterDive();
  }

  // -------------------------------------------------------
  // Dive attack
  // -------------------------------------------------------

  private enterDive(): void {
    this.bossState = 'diving';
    this.isAttacking = true;
    this.isVulnerable = false;

    // Destroy remaining clones before dive
    this.destroyAllClones();

    // Move boss to top of screen
    const diveTargetX = Phaser.Math.Between(40, GAME_WIDTH - 40);
    const diveTargetY = GAME_HEIGHT - 40;

    // Rise to top
    this.scene.tweens.add({
      targets: this,
      x: diveTargetX,
      y: 0,
      duration: 300,
      ease: 'Sine.easeIn',
      onComplete: () => {
        if (this.isDying || !this.active) return;

        // Dive down
        this.scene.tweens.add({
          targets: this,
          y: diveTargetY,
          duration: this.phaseParams.diveDuration,
          ease: 'Quad.easeIn',
          onComplete: () => {
            if (this.isDying || !this.active) return;
            this.createDiveZone(diveTargetX, diveTargetY);

            // Rise back up and return to idle
            this.scene.tweens.add({
              targets: this,
              y: GAME_HEIGHT * 0.3,
              duration: 400,
              ease: 'Sine.easeOut',
              onComplete: () => {
                if (this.isDying || !this.active) return;
                this.enterIdle();
              },
            });
          },
        });
      },
    });
  }

  private createDiveZone(x: number, y: number): void {
    const zone = this.diveZoneGroup.create(
      x,
      y,
      '__DEFAULT',
    ) as Phaser.Physics.Arcade.Sprite;

    if (!zone) return;

    zone.setActive(true).setVisible(true);
    zone.setDisplaySize(DIVE_ZONE_RADIUS * 2, DIVE_ZONE_RADIUS * 2);
    zone.setAlpha(0.5);
    zone.setTint(0xcccccc);

    const zoneBody = zone.body as Phaser.Physics.Arcade.Body;
    zoneBody.setAllowGravity(false);
    zoneBody.setCircle(DIVE_ZONE_RADIUS);

    // Fade out and destroy after duration
    this.scene.tweens.add({
      targets: zone,
      alpha: 0,
      duration: DIVE_ZONE_DURATION,
      onComplete: () => {
        zone.setActive(false).setVisible(false);
        zone.destroy();
      },
    });
  }

  // -------------------------------------------------------
  // Idle (between cycles)
  // -------------------------------------------------------

  private enterIdle(): void {
    this.bossState = 'idle';
    this.idleTimer = 0;
    this.isAttacking = false;
    this.isVulnerable = false;
  }

  // -------------------------------------------------------
  // Clone hit / shatter
  // -------------------------------------------------------

  /** Call this when a player attack overlaps a clone sprite. */
  shatterClone(clone: Phaser.Physics.Arcade.Sprite): void {
    if (!clone.active) return;

    this.emitShatterParticles(clone.x, clone.y);

    clone.setActive(false).setVisible(false);
    clone.destroy();
  }

  private emitShatterParticles(x: number, y: number): void {
    for (let i = 0; i < SHATTER_PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / SHATTER_PARTICLE_COUNT;
      const particle = this.scene.add.rectangle(
        x,
        y,
        3,
        3,
        0xc0c0c0,
      );
      particle.setAlpha(0.9);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * SHATTER_PARTICLE_SPEED,
        y: y + Math.sin(angle) * SHATTER_PARTICLE_SPEED,
        alpha: 0,
        duration: 400,
        ease: 'Sine.easeOut',
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  // -------------------------------------------------------
  // Phase changes
  // -------------------------------------------------------

  protected onPhaseChange(_oldPhase: number, newPhase: number): void {
    this.phaseParams = PHASE_CONFIG[newPhase] ?? PHASE_CONFIG[2];

    // Flash to signal phase change
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        if (this.active) this.setAlpha(REAL_ALPHA);
      },
    });
  }

  // -------------------------------------------------------
  // Utility
  // -------------------------------------------------------

  private getActiveCloneCount(): number {
    let count = 0;
    this.cloneGroup.getChildren().forEach((child) => {
      if ((child as Phaser.Physics.Arcade.Sprite).active) {
        count++;
      }
    });
    return count;
  }

  private destroyAllClones(): void {
    this.cloneGroup.getChildren().forEach((child) => {
      const clone = child as Phaser.Physics.Arcade.Sprite;
      if (clone.active) {
        clone.setActive(false).setVisible(false);
        clone.destroy();
      }
    });
    this.cloneGroup.clear(true, true);
  }

  destroy(fromScene?: boolean): void {
    if (this.attackTimer) {
      this.attackTimer.destroy();
      this.attackTimer = null;
    }

    // During scene shutdown (fromScene=true), Phaser's physics world has
    // already destroyed groups before UpdateList calls destroy() on sprites.
    // Accessing the group's children would crash.
    if (!fromScene) {
      this.destroyAllClones();
      this.cloneGroup.destroy(true);
      this.diveZoneGroup.destroy(true);
    }

    super.destroy(fromScene);
  }
}
