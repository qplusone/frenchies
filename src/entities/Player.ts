import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  PLAYER_JUMP_VELOCITY,
  PLAYER_JUMP_HOLD_GRAVITY,
  PLAYER_MAX_HP,
  GRAVITY,
  DAMAGE_INVINCIBILITY_MS,
  WING_DURATION,
  WING_FLY_SPEED,
} from '../config/GameConfig';
import { AudioManager } from '../systems/AudioManager';
import { TouchControls } from '../systems/TouchControls';

export type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'hurt' | 'special' | 'flying';

export abstract class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number = PLAYER_MAX_HP;
  maxHp: number = PLAYER_MAX_HP;
  state: PlayerState = 'idle';
  isInvincible: boolean = false;
  isPeintureMode: boolean = false;
  hasUsedSpecial: boolean = false;
  isFlying: boolean = false;
  flyTimer: number = 0;
  facingRight: boolean = true;

  protected wingOverlay: Phaser.GameObjects.Sprite | null = null;
  private wingFlapTween: Phaser.Tweens.Tween | null = null;

  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected keys!: Record<string, Phaser.Input.Keyboard.Key>;
  protected invincibilityTimer: Phaser.Time.TimerEvent | null = null;
  protected attackCooldown: boolean = false;

  abstract readonly characterName: string;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 14);
    body.setOffset(2, 2);
    body.setMaxVelocityY(400);

    // Mark as player for boss AI to find
    this.setData('isPlayer', true);

    this.setupInput();
  }

  private setupInput(): void {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.keys = this.scene.input.keyboard!.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      attack: Phaser.Input.Keyboard.KeyCodes.X,
      attackAlt: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
  }

  get isOnGround(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).blocked.down;
  }

  get isLeftPressed(): boolean {
    return this.cursors.left.isDown || this.keys.a.isDown || TouchControls.getInstance().left;
  }

  get isRightPressed(): boolean {
    return this.cursors.right.isDown || this.keys.d.isDown || TouchControls.getInstance().right;
  }

  get isJumpPressed(): boolean {
    return this.cursors.up.isDown || this.keys.w.isDown || this.keys.space.isDown || TouchControls.getInstance().jump;
  }

  get isJumpJustPressed(): boolean {
    const tc = TouchControls.getInstance();
    return Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.w) ||
      Phaser.Input.Keyboard.JustDown(this.keys.space) ||
      tc.jumpJustPressed;
  }

  get isAttackPressed(): boolean {
    const tc = TouchControls.getInstance();
    return Phaser.Input.Keyboard.JustDown(this.keys.attack) ||
      Phaser.Input.Keyboard.JustDown(this.keys.attackAlt) ||
      tc.attackJustPressed;
  }

  update(_time: number, delta: number): void {
    if (this.state === 'hurt') return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.isFlying) {
      this.updateFlying(delta);
      return;
    }

    // Horizontal movement (skip during attack to preserve pounce/dash velocity)
    if (this.state !== 'attack') {
      if (this.isLeftPressed) {
        body.setVelocityX(-PLAYER_SPEED);
        this.setFlipX(true);
        this.facingRight = false;
      } else if (this.isRightPressed) {
        body.setVelocityX(PLAYER_SPEED);
        this.setFlipX(false);
        this.facingRight = true;
      } else {
        body.setVelocityX(0);
      }
    }

    // Jumping
    if (this.isJumpJustPressed && this.isOnGround) {
      body.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.hasUsedSpecial = false;
      AudioManager.getInstance().playSFX('jump');
    }

    // Variable jump height — hold jump for more height
    if (this.isJumpPressed && body.velocity.y < 0) {
      body.setGravityY(PLAYER_JUMP_HOLD_GRAVITY - GRAVITY);
    } else {
      body.setGravityY(0);
    }

    // Special ability (in air only, once per jump)
    if (this.isJumpJustPressed && !this.isOnGround && !this.hasUsedSpecial) {
      this.specialAbility();
      this.hasUsedSpecial = true;
    }

    // Reset special on landing
    if (this.isOnGround) {
      this.hasUsedSpecial = false;
    }

    // Attack
    if (this.isAttackPressed && !this.attackCooldown) {
      this.attack();
    }

    // Update state for animations
    this.updateState();
  }

  protected updateState(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.state === 'attack' || this.state === 'hurt') return;

    if (!this.isOnGround) {
      this.state = body.velocity.y < 0 ? 'jump' : 'fall';
    } else if (Math.abs(body.velocity.x) > 10) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }
  }

  private updateFlying(delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(-GRAVITY); // cancel world gravity
    body.setAllowGravity(false);

    // 8-directional flying
    let vx = 0;
    let vy = 0;
    if (this.isLeftPressed) { vx = -WING_FLY_SPEED; this.setFlipX(true); this.facingRight = false; }
    if (this.isRightPressed) { vx = WING_FLY_SPEED; this.setFlipX(false); this.facingRight = true; }
    if (this.isJumpPressed || this.cursors.up.isDown || this.keys.w.isDown) { vy = -WING_FLY_SPEED; }
    if (this.cursors.down.isDown || this.keys.s.isDown) { vy = WING_FLY_SPEED; }

    body.setVelocity(vx, vy);

    // Update wing overlay position to follow player
    if (this.wingOverlay) {
      this.wingOverlay.setPosition(this.x, this.y - 2);
      this.wingOverlay.setFlipX(this.flipX);
    }

    this.flyTimer -= delta;
    if (this.flyTimer <= 0) {
      this.stopFlying();
    }
  }

  activateWings(): void {
    this.isFlying = true;
    this.flyTimer = WING_DURATION;
    this.state = 'flying';
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    // Create wing overlay sprite (butterfly for Poppleton, bat for Zacko)
    const wingTexture = this.characterName === 'zacko' ? 'wing_overlay_bat' : 'wing_overlay_butterfly';
    if (this.scene.textures.exists(wingTexture)) {
      this.wingOverlay = this.scene.add.sprite(this.x, this.y - 2, wingTexture);
      this.wingOverlay.setDepth(this.depth - 1); // render behind the player body

      // Flapping animation — oscillate scaleY for wing beat effect
      this.wingFlapTween = this.scene.tweens.add({
        targets: this.wingOverlay,
        scaleY: { from: 1, to: 0.5 },
        duration: 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  stopFlying(): void {
    this.isFlying = false;
    this.flyTimer = 0;
    this.state = 'fall';
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setGravityY(0);

    // Remove wing overlay
    if (this.wingFlapTween) {
      this.wingFlapTween.stop();
      this.wingFlapTween = null;
    }
    if (this.wingOverlay) {
      this.wingOverlay.destroy();
      this.wingOverlay = null;
    }
  }

  takeDamage(amount: number = 1): void {
    if (this.isInvincible || this.isPeintureMode) return;

    this.hp -= amount;
    this.state = 'hurt';
    this.isInvincible = true;
    AudioManager.getInstance().playSFX('damage');

    // Knockback
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-150);
    body.setVelocityX(this.facingRight ? -80 : 80);

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 100,
      repeat: Math.floor(DAMAGE_INVINCIBILITY_MS / 200),
      yoyo: true,
      onComplete: () => {
        this.alpha = 1;
        this.isInvincible = false;
      },
    });

    // Recover from hurt state
    this.scene.time.delayedCall(300, () => {
      if (this.state === 'hurt') {
        this.state = 'idle';
      }
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  heal(amount: number = 1): void {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  private die(): void {
    // Clean up wings if flying when killed
    if (this.isFlying) {
      this.stopFlying();
    }
    // Emit event for GameScene to handle respawn
    this.scene.events.emit('player-died');
  }

  abstract specialAbility(): void;
  abstract attack(): void;
}
