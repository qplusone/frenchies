import Phaser from 'phaser';

export interface BossConfig {
  hp: number;
  damage?: number;
  phaseThresholds: number[]; // HP fractions where phases trigger (e.g. [1.0, 0.66, 0.33])
}

export abstract class Boss extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  damage: number;
  currentPhase: number = 1;
  isVulnerable: boolean = false;

  protected phaseThresholds: number[];
  protected attackTimer: Phaser.Time.TimerEvent | null = null;
  protected isAttacking: boolean = false;
  protected isDying: boolean = false;

  abstract readonly bossName: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: BossConfig,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = config.hp;
    this.maxHp = config.hp;
    this.damage = config.damage ?? 1;
    this.phaseThresholds = config.phaseThresholds;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(true);
    body.setCollideWorldBounds(true);

    // Bigger hitbox for bosses (32x32 sprites)
    body.setSize(28, 28);
    body.setOffset(2, 2);
  }

  takeDamage(amount: number = 1): void {
    if (!this.isVulnerable || this.isDying) return;

    this.hp -= amount;

    // White flash
    this.setTint(0xffffff);
    this.scene.time.delayedCall(150, () => {
      if (this.active) this.clearTint();
    });

    // Knockback — slight recoil
    this.scene.tweens.add({
      targets: this,
      x: this.x + (this.flipX ? 8 : -8),
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    if (this.hp <= 0) {
      this.isDying = true;
      this.isVulnerable = false;
      if (this.attackTimer) {
        this.attackTimer.destroy();
      }
    }
  }

  checkPhaseTransition(): void {
    const hpFraction = this.hp / this.maxHp;
    let newPhase = 1;

    for (let i = 0; i < this.phaseThresholds.length; i++) {
      if (hpFraction <= this.phaseThresholds[i]) {
        newPhase = i + 1;
      }
    }

    if (newPhase !== this.currentPhase) {
      const oldPhase = this.currentPhase;
      this.currentPhase = newPhase;
      this.onPhaseChange(oldPhase, newPhase);
    }
  }

  protected onPhaseChange(_oldPhase: number, _newPhase: number): void {
    // Override in subclasses for phase-specific behavior
  }

  abstract initBehavior(): void;
}
