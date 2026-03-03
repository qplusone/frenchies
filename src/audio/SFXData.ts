/**
 * SFXData -- Procedural sound effect definitions for Jardin des Frenchies.
 *
 * Each entry describes a one-shot 8-bit / NES-style sound effect that the
 * AudioManager synthesises on the fly using Tone.js.  The configs are
 * intentionally tuned for punchy, retro game feel: fast attacks, short
 * durations, and square / triangle oscillators.
 *
 * Re-exported SFXConfig type lives in AudioManager.ts.
 */

import type { SFXConfig } from '../systems/AudioManager';

// ---------------------------------------------------------------------------
// SFX Definitions
// ---------------------------------------------------------------------------

export const SFX_DATA: Record<string, SFXConfig> = {
  // -----------------------------------------------------------------------
  // Player movement
  // -----------------------------------------------------------------------

  /** Quick upward pitch sweep -- classic platformer jump. */
  jump: {
    type: 'tone',
    oscillator: 'square',
    frequency: 300,
    frequencyEnd: 600,
    duration: 0.1,
    volume: -10,
    envelope: {
      attack: 0.005,
      decay: 0.04,
      sustain: 0.2,
      release: 0.04,
    },
  },

  /** Soft thud when the player touches the ground. */
  land: {
    type: 'noise',
    duration: 0.05,
    volume: -18,
    envelope: {
      attack: 0.002,
      decay: 0.04,
      sustain: 0,
      release: 0.01,
    },
  },

  // -----------------------------------------------------------------------
  // Collectibles
  // -----------------------------------------------------------------------

  /** Macaron pickup -- bright, pleasant ding. */
  collect: {
    type: 'tone',
    oscillator: 'square',
    frequency: 800,
    frequencyEnd: 1200,
    duration: 0.1,
    volume: -10,
    envelope: {
      attack: 0.005,
      decay: 0.04,
      sustain: 0.3,
      release: 0.04,
    },
  },

  /** Special / rare item pickup -- dramatic ascending sweep. */
  collectRare: {
    type: 'tone',
    oscillator: 'square',
    frequency: 600,
    frequencyEnd: 1600,
    duration: 0.2,
    volume: -8,
    envelope: {
      attack: 0.005,
      decay: 0.06,
      sustain: 0.4,
      release: 0.08,
    },
  },

  // -----------------------------------------------------------------------
  // Combat
  // -----------------------------------------------------------------------

  /** Player takes damage -- harsh noise burst. */
  damage: {
    type: 'noise',
    duration: 0.3,
    volume: -10,
    envelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.15,
      release: 0.1,
    },
  },

  /** Regular enemy defeated -- downward pop. */
  defeat: {
    type: 'tone',
    oscillator: 'square',
    frequency: 500,
    frequencyEnd: 200,
    duration: 0.15,
    volume: -10,
    envelope: {
      attack: 0.005,
      decay: 0.06,
      sustain: 0.2,
      release: 0.04,
    },
  },

  /** Boss takes a hit -- punchy low sweep. */
  bossHit: {
    type: 'tone',
    oscillator: 'square',
    frequency: 400,
    frequencyEnd: 150,
    duration: 0.2,
    volume: -8,
    envelope: {
      attack: 0.005,
      decay: 0.08,
      sustain: 0.2,
      release: 0.06,
    },
  },

  /** Boss defeated -- long, dramatic noise explosion. */
  bossDefeat: {
    type: 'noise',
    duration: 0.5,
    volume: -8,
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.2,
      release: 0.2,
    },
  },

  // -----------------------------------------------------------------------
  // Progression
  // -----------------------------------------------------------------------

  /** Checkpoint reached -- satisfying triangle chime at E5. */
  checkpoint: {
    type: 'tone',
    oscillator: 'triangle',
    frequency: 660,
    duration: 0.3,
    volume: -10,
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.35,
      release: 0.12,
    },
  },

  /** Wing power-up activated -- ethereal ascending shimmer. */
  wingActivate: {
    type: 'tone',
    oscillator: 'triangle',
    frequency: 400,
    frequencyEnd: 1200,
    duration: 0.3,
    volume: -10,
    envelope: {
      attack: 0.01,
      decay: 0.08,
      sustain: 0.4,
      release: 0.12,
    },
  },

  // -----------------------------------------------------------------------
  // UI / Menus
  // -----------------------------------------------------------------------

  /** Menu cursor movement -- minimal tick at A4. */
  menuSelect: {
    type: 'tone',
    oscillator: 'square',
    frequency: 440,
    duration: 0.05,
    volume: -14,
    envelope: {
      attack: 0.003,
      decay: 0.02,
      sustain: 0.1,
      release: 0.02,
    },
  },

  /** Menu selection confirmed -- slightly louder, higher pitch at E5. */
  menuConfirm: {
    type: 'tone',
    oscillator: 'square',
    frequency: 660,
    duration: 0.1,
    volume: -10,
    envelope: {
      attack: 0.005,
      decay: 0.03,
      sustain: 0.25,
      release: 0.04,
    },
  },

  /** Pause game -- brief low blip at E4. */
  pause: {
    type: 'tone',
    oscillator: 'square',
    frequency: 330,
    duration: 0.06,
    volume: -12,
    envelope: {
      attack: 0.003,
      decay: 0.025,
      sustain: 0.1,
      release: 0.02,
    },
  },
};
