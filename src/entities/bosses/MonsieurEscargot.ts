import { Boss, BossConfig } from './Boss';
import {
  BOSS_HP,
  BOSS_PHASE_THRESHOLDS,
  GAME_WIDTH,
} from '../../config/GameConfig';

type EscargotState = 'idle' | 'rolling' | 'poking';

interface PhaseParams {
  rollSpeed: number;
  pokeDuration: number;
  rollsBeforePoke: number;
}

const PHASE_CONFIG: Record<number, PhaseParams> = {
  1: { rollSpeed: 80, pokeDuration: 2500, rollsBeforePoke: 1 },
  2: { rollSpeed: 120, pokeDuration: 2000, rollsBeforePoke: 2 },
  3: { rollSpeed: 160, pokeDuration: 1500, rollsBeforePoke: 2 },
};

const IDLE_DURATION = 1000;
const SHELL_TINT = 0x8b6914;
const POKE_TINT = 0x6b9e4f;

export class MonsieurEscargot extends Boss {
  readonly bossName = 'Monsieur Escargot';

  private bossState: EscargotState = 'idle';
  private rollDirection: number = 1; // 1 = right, -1 = left
  private rollSpeed: number = PHASE_CONFIG[1].rollSpeed;
  private pokeDuration: number = PHASE_CONFIG[1].pokeDuration;
  private rollsBeforePoke: number = PHASE_CONFIG[1].rollsBeforePoke;
  private rollCount: number = 0;

  private stateTimer: number = 0;
  private idleTimer: number = 0;
  private pokeTimer: number = 0;
  private cycleStarted: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      hp: BOSS_HP.ESCARGOT,
      phaseThresholds: BOSS_PHASE_THRESHOLDS.ESCARGOT,
    };

    super(scene, x, y, 'boss_escargot', config);

    this.setDisplaySize(32, 32);
  }

  initBehavior(): void {
    this.bossState = 'idle';
    this.idleTimer = 0;
    this.rollCount = 0;
    this.cycleStarted = true;
    this.isVulnerable = false;

    // Pick an initial roll direction based on position
    this.rollDirection = this.x < GAME_WIDTH / 2 ? 1 : -1;
  }

  update(time: number, delta: number): void {
    if (this.isDying || !this.active || !this.cycleStarted) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (this.bossState) {
      case 'idle':
        this.updateIdle(delta);
        break;
      case 'rolling':
        this.updateRolling(delta, body);
        break;
      case 'poking':
        this.updatePoking(delta);
        break;
    }
  }

  private updateIdle(delta: number): void {
    this.idleTimer += delta;

    if (this.idleTimer >= IDLE_DURATION) {
      this.enterRolling();
    }
  }

  private enterRolling(): void {
    this.bossState = 'rolling';
    this.isVulnerable = false;
    this.isAttacking = true;
    this.rollCount++;

    // Visual: withdraw into shell
    this.setTint(SHELL_TINT);
    this.setScale(1, 0.8);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.rollSpeed * this.rollDirection);
  }

  private updateRolling(_delta: number, body: Phaser.Physics.Arcade.Body): void {
    // Check for wall collision — bounce off world bounds
    let hitWall = false;
    if (body.blocked.left) {
      this.rollDirection = 1;
      this.flipX = false;
      hitWall = true;
    } else if (body.blocked.right) {
      this.rollDirection = -1;
      this.flipX = true;
      hitWall = true;
    }

    if (hitWall) {
      // After bouncing off wall, decide: poke or roll again
      if (this.rollCount >= this.rollsBeforePoke) {
        this.enterPoking();
      } else {
        // Continue rolling in new direction
        this.rollCount++;
        body.setVelocityX(this.rollSpeed * this.rollDirection);
      }
    }
  }

  private enterPoking(): void {
    this.bossState = 'poking';
    this.pokeTimer = 0;
    this.rollCount = 0;
    this.isAttacking = false;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);

    // Visual: head pokes out
    this.clearTint();
    this.setTint(POKE_TINT);
    this.setScale(1.1, 1);

    // Boss is vulnerable during poke
    this.isVulnerable = true;
  }

  private updatePoking(delta: number): void {
    this.pokeTimer += delta;

    if (this.pokeTimer >= this.pokeDuration) {
      this.exitPoking();
    }
  }

  private exitPoking(): void {
    this.isVulnerable = false;
    this.clearTint();
    this.setScale(1, 1);

    // Check phase transitions after vulnerability window closes
    this.checkPhaseTransition();

    // Direction was already set by updateRolling() wall-bounce; don't flip again

    // Return to idle before next attack cycle
    this.bossState = 'idle';
    this.idleTimer = 0;
  }

  protected onPhaseChange(_oldPhase: number, newPhase: number): void {
    const params = PHASE_CONFIG[newPhase];
    if (!params) return;

    this.rollSpeed = params.rollSpeed;
    this.pokeDuration = params.pokeDuration;
    this.rollsBeforePoke = params.rollsBeforePoke;

    // Brief flash to signal phase change
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
  }
}
