import Phaser from 'phaser';
import { GAME_WIDTH, PALETTE, PLAYER_MAX_HP, WING_DURATION } from '../config/GameConfig';
import { GameManager } from '../systems/GameManager';
import { Player } from '../entities/Player';

export class HUD extends Phaser.Scene {
  private healthIcons: Phaser.GameObjects.Sprite[] = [];
  private macaronText!: Phaser.GameObjects.Text;
  private paintDropText!: Phaser.GameObjects.Text;
  private candleText: Phaser.GameObjects.Text | null = null;
  private wingTimerBg!: Phaser.GameObjects.Graphics;
  private wingTimerFill!: Phaser.GameObjects.Graphics;
  private wingTimerVisible: boolean = false;

  constructor() {
    super('HUD');
  }

  create(): void {
    // Health icons (Frenchie faces)
    for (let i = 0; i < PLAYER_MAX_HP; i++) {
      const icon = this.add.sprite(8 + i * 12, 8, 'poppleton');
      icon.setScale(0.6);
      icon.setScrollFactor(0);
      this.healthIcons.push(icon);
    }

    // Macaron counter
    this.add.sprite(8, 22, 'macaron').setScale(0.8).setScrollFactor(0);
    this.macaronText = this.add.text(16, 18, '0', {
      fontSize: '7px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setScrollFactor(0);

    // Paint drop counter (top-right)
    this.add.sprite(GAME_WIDTH - 40, 8, 'paint_drop').setScale(0.8).setScrollFactor(0);
    this.paintDropText = this.add.text(GAME_WIDTH - 32, 4, '0', {
      fontSize: '7px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setScrollFactor(0);

    // Wing timer bar (hidden until active)
    this.wingTimerBg = this.add.graphics();
    this.wingTimerFill = this.add.graphics();
    this.wingTimerBg.setVisible(false);
    this.wingTimerFill.setVisible(false);
  }

  updateHUD(player: Player): void {
    const gm = GameManager.instance;

    // Update health icons
    for (let i = 0; i < this.healthIcons.length; i++) {
      if (i < player.hp) {
        this.healthIcons[i].setAlpha(1);
        this.healthIcons[i].clearTint();
      } else {
        this.healthIcons[i].setAlpha(0.3);
        this.healthIcons[i].setTint(0x333333);
      }
    }

    // Update character icon texture
    const texture = player.characterName === 'zacko' ? 'zacko' : 'poppleton';
    for (const icon of this.healthIcons) {
      icon.setTexture(texture);
    }

    // Macaron count
    this.macaronText.setText(`${gm.macarons}`);

    // Paint drops
    this.paintDropText.setText(`${gm.totalPaintDrops}`);

    // Birthday candle counter (only show after first candle found)
    if (gm.candleCount > 0 && !this.candleText) {
      this.add.sprite(GAME_WIDTH - 40, 22, 'birthday_candle').setScale(0.6).setScrollFactor(0);
      this.candleText = this.add.text(GAME_WIDTH - 32, 18, '', {
        fontSize: '7px',
        color: '#ffdd44',
        fontFamily: 'monospace',
      }).setScrollFactor(0);
    }
    if (this.candleText) {
      this.candleText.setText(`${gm.candleCount}/11`);
    }

    // Wing timer
    if (player.isFlying && player.flyTimer > 0) {
      this.showWingTimer(player.flyTimer / WING_DURATION);
    } else if (this.wingTimerVisible) {
      this.hideWingTimer();
    }
  }

  private showWingTimer(percent: number): void {
    this.wingTimerVisible = true;
    const barWidth = 40;
    const barHeight = 4;
    const barX = 6;
    const barY = 30;

    this.wingTimerBg.setVisible(true);
    this.wingTimerBg.clear();
    this.wingTimerBg.fillStyle(0x333333);
    this.wingTimerBg.fillRect(barX, barY, barWidth, barHeight);

    this.wingTimerFill.setVisible(true);
    this.wingTimerFill.clear();
    this.wingTimerFill.fillStyle(0xaaddff);
    this.wingTimerFill.fillRect(barX, barY, barWidth * percent, barHeight);
  }

  private hideWingTimer(): void {
    this.wingTimerVisible = false;
    this.wingTimerBg.setVisible(false);
    this.wingTimerFill.setVisible(false);
  }
}
