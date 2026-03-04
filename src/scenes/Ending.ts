import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../config/GameConfig';
import { AudioManager } from '../systems/AudioManager';

/**
 * Ending scene — sunset cutscene that plays after the final boss is defeated.
 *
 * A sequence of timed text panels fades through warm colors while
 * Poppleton and Zacko rest beneath the willow. Ends with a heartfelt
 * birthday message for Rachel.
 */
export class Ending extends Phaser.Scene {
  /** Background gradient graphics object. */
  private bg!: Phaser.GameObjects.Graphics;

  /** Current panel index (used for sequencing). */
  private panelIndex: number = 0;

  /** Reference to the sleeping Frenchie sprites so we can show/hide them. */
  private poppletonSprite!: Phaser.GameObjects.Sprite;
  private zackoSprite!: Phaser.GameObjects.Sprite;

  /** Sparkle dot pool for the birthday panel effect. */
  private sparkles: Phaser.GameObjects.Graphics[] = [];

  /** Whether the "press any key" prompt is active. */
  private waitingForInput: boolean = false;

  constructor() {
    super('Ending');
  }

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  create(): void {
    this.panelIndex = 0;
    this.waitingForInput = false;
    this.sparkles = [];

    // -- Sunset gradient background ------------------------------------------
    this.bg = this.add.graphics();
    this.drawSunsetGradient(0);

    // -- Sleeping Frenchie sprites (hidden initially) -------------------------
    this.poppletonSprite = this.add.sprite(
      GAME_WIDTH / 2 - 24,
      GAME_HEIGHT - 40,
      'poppleton',
    )
      .setScale(2)
      .setAlpha(0);

    this.zackoSprite = this.add.sprite(
      GAME_WIDTH / 2 + 24,
      GAME_HEIGHT - 40,
      'zacko',
    )
      .setScale(2)
      .setFlipX(true)
      .setAlpha(0);

    // -- Start victory music -------------------------------------------------
    AudioManager.getInstance().playMusic('victory');

    // -- Begin the panel sequence --------------------------------------------
    this.time.delayedCall(600, () => this.showNextPanel());
  }

  // ---------------------------------------------------------------------------
  // Panel definitions
  // ---------------------------------------------------------------------------

  /** Returns the ordered list of text panel configurations. */
  private getPanels(): PanelConfig[] {
    return [
      // Panel 1
      {
        text: 'The fog has lifted...',
        fontSize: '8px',
        color: '#b8b8d0',
        showDogs: false,
        sparkle: false,
        gradientProgress: 0.0,
      },
      // Panel 2
      {
        text: 'Color returns to the garden',
        fontSize: '8px',
        color: '#7a9e7e',
        showDogs: false,
        sparkle: false,
        gradientProgress: 0.2,
      },
      // Panel 3
      {
        text: 'Poppleton and Zacko rest\nbeneath the willow',
        fontSize: '8px',
        color: '#e8c4a0',
        showDogs: true,
        sparkle: false,
        gradientProgress: 0.4,
      },
      // Panel 4
      {
        text: "Monet's masterpiece is restored",
        fontSize: '8px',
        color: '#6b9dab',
        showDogs: true,
        sparkle: false,
        gradientProgress: 0.6,
      },
      // Panel 5 — Birthday message (larger, golden)
      {
        text: 'Happy Birthday, Rachel!',
        fontSize: '10px',
        color: '#dec87a',
        showDogs: true,
        sparkle: true,
        gradientProgress: 0.8,
      },
      // Panel 6 — Dedication (smaller, gentle)
      {
        text: 'With love, from your\ntwo little Frenchies',
        fontSize: '8px',
        color: '#e8b4b8',
        showDogs: true,
        sparkle: false,
        gradientProgress: 0.9,
      },
      // Panel 7 — Credits
      {
        text: 'Jardin des Frenchies\nA game made with love\n2026',
        fontSize: '7px',
        color: '#b8a9c9',
        showDogs: false,
        sparkle: false,
        gradientProgress: 1.0,
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // Panel sequencing
  // ---------------------------------------------------------------------------

  /** Advance to the next panel, or show the final prompt. */
  private showNextPanel(): void {
    const panels = this.getPanels();

    if (this.panelIndex >= panels.length) {
      this.showFinalPrompt();
      return;
    }

    const panel = panels[this.panelIndex];
    this.panelIndex++;

    // -- Update the background gradient colour progression --------------------
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1000,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // We don't need per-tick gradient redraws for performance;
        // just redraw once at the end. The counter is used for timing.
        const val = tween?.getValue() ?? 0;
        if (val >= 1) {
          this.drawSunsetGradient(panel.gradientProgress);
        }
      },
    });
    this.drawSunsetGradient(panel.gradientProgress);

    // -- Show / hide sleeping dogs -------------------------------------------
    if (panel.showDogs) {
      this.fadeInDogs();
    }
    if (!panel.showDogs && this.panelIndex === panels.length) {
      // Credits panel — fade dogs out gently
      this.tweens.add({
        targets: [this.poppletonSprite, this.zackoSprite],
        alpha: 0,
        duration: 1000,
        ease: 'Sine.easeInOut',
      });
    }

    // -- Create the text object (centred, starts invisible) -------------------
    const textY = panel.showDogs ? GAME_HEIGHT / 2 - 20 : GAME_HEIGHT / 2;
    const panelText = this.add.text(GAME_WIDTH / 2, textY, panel.text, {
      fontSize: panel.fontSize,
      color: panel.color,
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 6,
      stroke: '#000000',
      strokeThickness: 2,
    })
      .setOrigin(0.5)
      .setAlpha(0);

    // -- Sparkle effect for the birthday panel --------------------------------
    if (panel.sparkle) {
      this.startSparkles();
    }

    // -- Fade in → hold → fade out → next panel ------------------------------
    const fadeInDuration = 800;
    const holdDuration = 3200;
    const fadeOutDuration = 800;

    // Fade in
    this.tweens.add({
      targets: panelText,
      alpha: 1,
      duration: fadeInDuration,
      ease: 'Sine.easeIn',
      onComplete: () => {
        // Hold, then fade out
        this.time.delayedCall(holdDuration, () => {
          this.tweens.add({
            targets: panelText,
            alpha: 0,
            duration: fadeOutDuration,
            ease: 'Sine.easeOut',
            onComplete: () => {
              panelText.destroy();

              // Stop sparkles if they were active
              if (panel.sparkle) {
                this.stopSparkles();
              }

              // Brief pause between panels
              this.time.delayedCall(400, () => this.showNextPanel());
            },
          });
        });
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Final prompt
  // ---------------------------------------------------------------------------

  /** Show "Press any key to return" and wait for input. */
  private showFinalPrompt(): void {
    const prompt = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 16,
      'Press any key to return',
      {
        fontSize: '7px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 2,
      },
    )
      .setOrigin(0.5)
      .setAlpha(0);

    // Gentle fade-in
    this.tweens.add({
      targets: prompt,
      alpha: 1,
      duration: 1000,
      ease: 'Sine.easeIn',
    });

    // Subtle pulsing to indicate interactivity
    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.4 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1000,
    });

    this.waitingForInput = true;

    // Listen for any key
    this.input.keyboard!.once('keydown', () => {
      if (!this.waitingForInput) return;
      this.waitingForInput = false;
      AudioManager.getInstance().playSFX('menuConfirm');
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          this.scene.start('TitleScreen');
        },
      );
    });

    // Also listen for pointer/touch
    this.input.once('pointerdown', () => {
      if (!this.waitingForInput) return;
      this.waitingForInput = false;
      AudioManager.getInstance().playSFX('menuConfirm');
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          this.scene.start('TitleScreen');
        },
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Background gradient
  // ---------------------------------------------------------------------------

  /**
   * Draw a vertical gradient that transitions from sunset to night.
   *
   * @param progress - 0 = warm sunset, 1 = deep night-sky.
   */
  private drawSunsetGradient(progress: number): void {
    this.bg.clear();

    // Define colour stops at progress 0 (sunset) and 1 (starry dusk).
    // We linearly interpolate between two palettes.

    // Sunset palette (progress = 0)
    const sunsetTop    = { r: 0x5c, g: 0x4a, b: 0x72 }; // deepPurple
    const sunsetMid    = { r: 0xd4, g: 0xa0, b: 0x57 }; // sunAmber
    const sunsetBottom = { r: 0xe8, g: 0xb4, b: 0xb8 }; // roseBlush

    // Night palette (progress = 1)
    const nightTop    = { r: 0x1a, g: 0x1a, b: 0x2e }; // uiBackground
    const nightMid    = { r: 0x2e, g: 0x3a, b: 0x5c }; // midnightBlue
    const nightBottom = { r: 0x5c, g: 0x4a, b: 0x72 }; // deepPurple

    const t = Phaser.Math.Clamp(progress, 0, 1);

    const topR = Phaser.Math.Linear(sunsetTop.r, nightTop.r, t);
    const topG = Phaser.Math.Linear(sunsetTop.g, nightTop.g, t);
    const topB = Phaser.Math.Linear(sunsetTop.b, nightTop.b, t);

    const midR = Phaser.Math.Linear(sunsetMid.r, nightMid.r, t);
    const midG = Phaser.Math.Linear(sunsetMid.g, nightMid.g, t);
    const midB = Phaser.Math.Linear(sunsetMid.b, nightMid.b, t);

    const botR = Phaser.Math.Linear(sunsetBottom.r, nightBottom.r, t);
    const botG = Phaser.Math.Linear(sunsetBottom.g, nightBottom.g, t);
    const botB = Phaser.Math.Linear(sunsetBottom.b, nightBottom.b, t);

    // Draw the gradient as horizontal bands
    const halfH = Math.floor(GAME_HEIGHT / 2);

    for (let y = 0; y < GAME_HEIGHT; y++) {
      let r: number, g: number, b: number;

      if (y < halfH) {
        // Top half: top colour → mid colour
        const frac = y / halfH;
        r = Phaser.Math.Linear(topR, midR, frac);
        g = Phaser.Math.Linear(topG, midG, frac);
        b = Phaser.Math.Linear(topB, midB, frac);
      } else {
        // Bottom half: mid colour → bottom colour
        const frac = (y - halfH) / (GAME_HEIGHT - halfH);
        r = Phaser.Math.Linear(midR, botR, frac);
        g = Phaser.Math.Linear(midG, botG, frac);
        b = Phaser.Math.Linear(midB, botB, frac);
      }

      const colour = Phaser.Display.Color.GetColor(
        Math.round(r),
        Math.round(g),
        Math.round(b),
      );
      this.bg.fillStyle(colour, 1);
      this.bg.fillRect(0, y, GAME_WIDTH, 1);
    }
  }

  // ---------------------------------------------------------------------------
  // Sleeping dogs fade-in
  // ---------------------------------------------------------------------------

  /** Gently fade in the two sleeping Frenchie sprites. */
  private fadeInDogs(): void {
    // Only fade in if not already visible
    if (this.poppletonSprite.alpha >= 1) return;

    this.tweens.add({
      targets: [this.poppletonSprite, this.zackoSprite],
      alpha: 1,
      duration: 1200,
      ease: 'Sine.easeInOut',
    });

    // Gentle sleeping "breathing" bob
    this.tweens.add({
      targets: this.poppletonSprite,
      y: this.poppletonSprite.y - 1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: this.zackoSprite,
      y: this.zackoSprite.y - 1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 500, // slightly offset for a natural look
    });
  }

  // ---------------------------------------------------------------------------
  // Sparkle effect
  // ---------------------------------------------------------------------------

  /** Create gentle tween-based sparkle dots around the screen centre. */
  private startSparkles(): void {
    const count = 16;
    const centreX = GAME_WIDTH / 2;
    const centreY = GAME_HEIGHT / 2 - 20;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const radius = 30 + Math.random() * 50;
      const x = centreX + Math.cos(angle) * radius;
      const y = centreY + Math.sin(angle) * radius;

      const dot = this.add.graphics();
      const size = 1 + Math.floor(Math.random() * 2);
      const dotColor = Phaser.Math.RND.pick([
        PALETTE.softGold,
        PALETTE.warmYellow,
        PALETTE.lilyPink,
        0xffffff,
      ]);

      dot.fillStyle(dotColor, 1);
      dot.fillCircle(0, 0, size);
      dot.setPosition(x, y);
      dot.setAlpha(0);

      // Twinkle animation: fade in and out at random rates
      this.tweens.add({
        targets: dot,
        alpha: { from: 0, to: 0.9 },
        duration: 400 + Math.random() * 600,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
        ease: 'Sine.easeInOut',
      });

      // Gentle drift upward
      this.tweens.add({
        targets: dot,
        y: y - 8 - Math.random() * 12,
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.sparkles.push(dot);
    }
  }

  /** Fade out and destroy all sparkle dots. */
  private stopSparkles(): void {
    for (const dot of this.sparkles) {
      this.tweens.add({
        targets: dot,
        alpha: 0,
        duration: 600,
        ease: 'Sine.easeOut',
        onComplete: () => {
          dot.destroy();
        },
      });
    }
    this.sparkles = [];
  }
}

// ---------------------------------------------------------------------------
// Panel configuration type
// ---------------------------------------------------------------------------

interface PanelConfig {
  text: string;
  fontSize: string;
  color: string;
  /** Whether the sleeping dog sprites should be visible during this panel. */
  showDogs: boolean;
  /** Whether to show the sparkle particle effect. */
  sparkle: boolean;
  /** Background gradient progress value (0 = sunset, 1 = night). */
  gradientProgress: number;
}
