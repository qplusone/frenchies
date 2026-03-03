import { Boss, BossConfig } from './Boss';
import {
  BOSS_HP,
  BOSS_PHASE_THRESHOLDS,
  GAME_WIDTH,
  GAME_HEIGHT,
  PALETTE,
} from '../../config/GameConfig';

type BrumeState = 'floating' | 'firing' | 'contracting' | 'expanding';

interface PhaseParams {
  projectileCount: number;
  fanAngle: number;
  floatSpeed: number;
  bodyScale: number;
  attackInterval: number;
}

const PHASE_CONFIG: Record<number, PhaseParams> = {
  1: { projectileCount: 2, fanAngle: 30, floatSpeed: 1.0, bodyScale: 1.0, attackInterval: 3000 },
  2: { projectileCount: 3, fanAngle: 45, floatSpeed: 1.4, bodyScale: 1.5, attackInterval: 2500 },
  3: { projectileCount: 5, fanAngle: 70, floatSpeed: 1.8, bodyScale: 2.0, attackInterval: 2000 },
};

const VULNERABILITY_DURATION = 2000;
const CONTRACT_SCALE = 0.6;
const EXPAND_DURATION = 400;
const CONTRACT_DURATION = 300;
const PROJECTILE_SPEED = 120;
const PROJECTILE_SIZE = 6;
const FLOAT_AMPLITUDE_X = 60;
const FLOAT_AMPLITUDE_Y = 30;
const COLOR_DRAIN_INTERVAL = 5000;
const COLOR_DRAIN_DURATION = 800;
const EYE_FLASH_TINT = 0xffffff;

export class LaBrume extends Boss {
  readonly bossName = 'La Brume';

  private bossState: BrumeState = 'floating';
  private projectileGroup: Phaser.Physics.Arcade.Group | null = null;

  private floatTime: number = 0;
  private floatSpeed: number = PHASE_CONFIG[1].floatSpeed;
  private projectileCount: number = PHASE_CONFIG[1].projectileCount;
  private fanAngle: number = PHASE_CONFIG[1].fanAngle;
  private targetScale: number = PHASE_CONFIG[1].bodyScale;
  private attackInterval: number = PHASE_CONFIG[1].attackInterval;

  private centerX: number;
  private centerY: number;
  private cycleStarted: boolean = false;
  private attackCycleTimer: number = 0;
  private vulnerabilityTimer: number = 0;
  private colorDrainTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      hp: BOSS_HP.BRUME,
      phaseThresholds: BOSS_PHASE_THRESHOLDS.BRUME,
    };

    super(scene, x, y, 'boss_brume', config);

    this.setDisplaySize(32, 32);
    this.setTint(PALETTE.fog);

    // Floating boss -- disable gravity
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    this.centerX = x;
    this.centerY = y;

    // Create projectile group
    this.projectileGroup = this.scene.physics.add.group({
      defaultKey: 'fog_projectile',
      maxSize: 30,
      allowGravity: false,
      collideWorldBounds: false,
    });
  }

  getProjectileGroup(): Phaser.Physics.Arcade.Group {
    if (!this.projectileGroup) {
      this.projectileGroup = this.scene.physics.add.group({
        defaultKey: 'fog_projectile',
        maxSize: 30,
        allowGravity: false,
        collideWorldBounds: false,
      });
    }
    return this.projectileGroup;
  }

  initBehavior(): void {
    this.bossState = 'floating';
    this.floatTime = 0;
    this.attackCycleTimer = 0;
    this.colorDrainTimer = 0;
    this.cycleStarted = true;
    this.isVulnerable = false;

    this.centerX = GAME_WIDTH / 2;
    this.centerY = GAME_HEIGHT * 0.35;
  }

  update(time: number, delta: number): void {
    if (this.isDying || !this.active || !this.cycleStarted) return;

    this.updateFloatPosition(delta);
    this.updateColorDrain(delta);
    this.cleanupProjectiles();

    switch (this.bossState) {
      case 'floating':
        this.updateFloating(delta);
        break;
      case 'firing':
        // Firing is instant; state transitions happen in fireProjectiles()
        break;
      case 'contracting':
        this.updateContracting(delta);
        break;
      case 'expanding':
        // Expanding is tween-driven; no per-frame logic needed
        break;
    }
  }

  // -- Float movement: figure-8 using Lissajous curve --

  private updateFloatPosition(delta: number): void {
    this.floatTime += delta * 0.001 * this.floatSpeed;

    // Figure-8 pattern: x uses sin(t), y uses sin(2t)
    const newX = this.centerX + Math.sin(this.floatTime) * FLOAT_AMPLITUDE_X;
    const newY = this.centerY + Math.sin(this.floatTime * 2) * FLOAT_AMPLITUDE_Y;

    this.setPosition(newX, newY);

    // Face direction of horizontal movement
    this.flipX = Math.cos(this.floatTime) < 0;
  }

  // -- State updates --

  private updateFloating(delta: number): void {
    this.attackCycleTimer += delta;

    if (this.attackCycleTimer >= this.attackInterval) {
      this.attackCycleTimer = 0;
      this.enterFiring();
    }
  }

  private enterFiring(): void {
    this.bossState = 'firing';
    this.isAttacking = true;

    this.fireProjectiles();

    // After firing, immediately enter contraction (vulnerability)
    this.enterContracting();
  }

  private fireProjectiles(): void {
    const count = this.projectileCount;
    const spreadRad = Phaser.Math.DegToRad(this.fanAngle);

    // Fire downward toward player area; center angle is 90 degrees (straight down)
    const centerAngle = Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const angle =
        count === 1
          ? centerAngle
          : centerAngle - spreadRad / 2 + (spreadRad / (count - 1)) * i;

      const projectile = this.projectileGroup?.get(
        this.x,
        this.y,
        'fog_projectile',
      ) as Phaser.Physics.Arcade.Sprite | null;

      if (projectile) {
        projectile.setActive(true);
        projectile.setVisible(true);
        projectile.setDisplaySize(PROJECTILE_SIZE, PROJECTILE_SIZE);
        projectile.setTint(PALETTE.fog);

        const projBody = projectile.body as Phaser.Physics.Arcade.Body;
        projBody.setAllowGravity(false);
        projBody.setSize(PROJECTILE_SIZE, PROJECTILE_SIZE);

        const vx = Math.cos(angle) * PROJECTILE_SPEED;
        const vy = Math.sin(angle) * PROJECTILE_SPEED;
        projBody.setVelocity(vx, vy);
      }
    }
  }

  // -- Contraction: vulnerability window --

  private enterContracting(): void {
    this.bossState = 'contracting';
    this.isAttacking = false;
    this.vulnerabilityTimer = 0;

    // Scale down to contracted form
    this.scene.tweens.add({
      targets: this,
      scaleX: CONTRACT_SCALE,
      scaleY: CONTRACT_SCALE,
      duration: CONTRACT_DURATION,
      ease: 'Back.easeIn',
    });

    // Eye flash to signal vulnerability
    this.setTint(EYE_FLASH_TINT);
    this.scene.time.delayedCall(200, () => {
      if (this.active) this.setTint(PALETTE.fog);
    });

    this.isVulnerable = true;
  }

  private updateContracting(delta: number): void {
    this.vulnerabilityTimer += delta;

    if (this.vulnerabilityTimer >= VULNERABILITY_DURATION) {
      this.enterExpanding();
    }
  }

  // -- Expansion: post-vulnerability, return to normal --

  private enterExpanding(): void {
    this.bossState = 'expanding';
    this.isVulnerable = false;

    // Check phase transitions after vulnerability window ends
    this.checkPhaseTransition();

    // Scale up to current phase target
    this.scene.tweens.add({
      targets: this,
      scaleX: this.targetScale,
      scaleY: this.targetScale,
      duration: EXPAND_DURATION,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (this.active && !this.isDying) {
          this.bossState = 'floating';
          this.attackCycleTimer = 0;
        }
      },
    });
  }

  // -- Color drain effect --

  private updateColorDrain(delta: number): void {
    this.colorDrainTimer += delta;

    if (this.colorDrainTimer >= COLOR_DRAIN_INTERVAL) {
      this.colorDrainTimer = 0;
      this.emitColorDrain();
    }
  }

  private emitColorDrain(): void {
    // Tween-based darkening effect on scene cameras
    const camera = this.scene.cameras.main;
    const originalTint = camera.backgroundColor.color;

    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: COLOR_DRAIN_DURATION,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const value = tween.getValue() ?? 0;
        const greyAmount = Math.floor((value / 100) * 80);
        const grey = Phaser.Display.Color.GetColor(
          128 - greyAmount,
          128 - greyAmount,
          128 - greyAmount,
        );
        camera.setBackgroundColor(grey);
      },
      onComplete: () => {
        camera.setBackgroundColor(originalTint);
      },
    });
  }

  // -- Projectile cleanup --

  private cleanupProjectiles(): void {
    if (!this.projectileGroup) return;

    this.projectileGroup.getChildren().forEach((child) => {
      const projectile = child as Phaser.Physics.Arcade.Sprite;
      if (!projectile.active) return;

      // Remove projectiles that leave the screen
      if (
        projectile.x < -16 ||
        projectile.x > GAME_WIDTH + 16 ||
        projectile.y < -16 ||
        projectile.y > GAME_HEIGHT + 16
      ) {
        projectile.setActive(false);
        projectile.setVisible(false);
        const projBody = projectile.body as Phaser.Physics.Arcade.Body;
        projBody.setVelocity(0, 0);
      }
    });
  }

  // -- Phase transition --

  protected onPhaseChange(_oldPhase: number, newPhase: number): void {
    const params = PHASE_CONFIG[newPhase];
    if (!params) return;

    this.projectileCount = params.projectileCount;
    this.fanAngle = params.fanAngle;
    this.floatSpeed = params.floatSpeed;
    this.targetScale = params.bodyScale;
    this.attackInterval = params.attackInterval;

    // Phase transition flash
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

    // Emit color-restore event -- each phase defeat restores arena color
    this.scene.events.emit('color-restore', newPhase);
  }

  destroy(fromScene?: boolean): void {
    if (this.projectileGroup) {
      this.projectileGroup.clear(true, true);
      this.projectileGroup.destroy(true);
      this.projectileGroup = null;
    }

    super.destroy(fromScene);
  }
}
