/**
 * AudioManager — Main audio system for Jardin des Frenchies.
 *
 * Provides NES-style 4-channel chiptune synthesis using Tone.js:
 *   Channel 1: Square wave (melody)
 *   Channel 2: Square wave (harmony)
 *   Channel 3: Triangle wave (bass)
 *   Channel 4: Noise (percussion)
 *
 * All synths route through a master Tone.Channel for unified volume control.
 * Music playback uses Tone.Transport + Tone.Part for sequenced pattern data.
 * SFX are procedurally generated one-shot synths that auto-dispose after playback.
 */

import * as Tone from 'tone';

// ---------------------------------------------------------------------------
// Data imports (modules created separately)
// ---------------------------------------------------------------------------
import { MUSIC_DATA } from '../audio/MusicData';
import { SFX_DATA } from '../audio/SFXData';

// ---------------------------------------------------------------------------
// Type interfaces for external music / SFX data
// ---------------------------------------------------------------------------

/** A single note event in a sequenced track. */
export interface NoteEvent {
  /** Tone.js time position, e.g. "0:0:0" */
  time: string;
  /** Pitch name, e.g. "C4", "E4". Ignored for noise channel. */
  note: string;
  /** Duration in Tone.js notation, e.g. "8n", "4n" */
  duration: string;
  /** Velocity 0-1. Defaults to 0.8 if omitted. */
  velocity?: number;
}

/** Full track data for a music piece. */
export interface TrackData {
  bpm: number;
  timeSignature: [number, number];
  melody: NoteEvent[];
  harmony: NoteEvent[];
  bass: NoteEvent[];
  /** For the noise channel — `note` field is ignored; only time/duration matter. */
  percussion: NoteEvent[];
  loop: boolean;
  /** Tone.js time value for the loop boundary, e.g. "8:0:0" for 8 bars. */
  loopEnd: string;
}

/** Configuration for a procedural sound effect. */
export interface SFXConfig {
  type: 'tone' | 'noise';
  /** Starting frequency in Hz (tone type only). */
  frequency?: number;
  /** Ending frequency in Hz for a pitch sweep (tone type only). */
  frequencyEnd?: number;
  /** Duration of the sound in seconds. */
  duration: number;
  /** Volume in dB. Defaults to -12. */
  volume?: number;
  /** ADSR envelope parameters. */
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  /** Oscillator type for tone-based SFX. Defaults to 'square'. */
  oscillator?: 'square' | 'triangle' | 'sawtooth' | 'sine';
}

// ---------------------------------------------------------------------------
// Supported track and SFX names (compile-time safety)
// ---------------------------------------------------------------------------

export type TrackKey =
  | 'title'
  | 'world1'
  | 'world2'
  | 'world3'
  | 'world4'
  | 'boss1'
  | 'boss2'
  | 'boss3'
  | 'boss4'
  | 'victory'
  | 'gameover';

export type SFXName =
  | 'jump'
  | 'land'
  | 'collect'
  | 'collectRare'
  | 'damage'
  | 'defeat'
  | 'checkpoint'
  | 'menuSelect'
  | 'menuConfirm'
  | 'bossHit'
  | 'bossDefeat'
  | 'wingActivate'
  | 'pause';

// ---------------------------------------------------------------------------
// Default constants
// ---------------------------------------------------------------------------

/** Default crossfade duration in milliseconds. */
const DEFAULT_CROSSFADE_MS = 1000;

/** Default velocity when a NoteEvent omits it. */
const DEFAULT_VELOCITY = 0.8;

/** Default volume for SFX in dB. */
const DEFAULT_SFX_VOLUME_DB = -12;

// ---------------------------------------------------------------------------
// AudioManager
// ---------------------------------------------------------------------------

export class AudioManager {
  // -- Singleton -------------------------------------------------------------
  static instance: AudioManager;

  // -- Synth channels -------------------------------------------------------
  /** Square wave synth for melody (channel 1). */
  private square1: Tone.PolySynth | null = null;
  /** Square wave synth for harmony (channel 2). */
  private square2: Tone.PolySynth | null = null;
  /** Triangle wave synth for bass (channel 3). */
  private triangle: Tone.PolySynth | null = null;
  /** Noise synth for percussion (channel 4). */
  private noise: Tone.NoiseSynth | null = null;

  // -- Routing --------------------------------------------------------------
  /** Master output channel — all synths route here. */
  private masterChannel: Tone.Channel | null = null;
  /** Dedicated music gain node for independent volume control. */
  private musicGain: Tone.Gain | null = null;
  /** Dedicated SFX gain node for independent volume control. */
  private sfxGain: Tone.Gain | null = null;

  // -- Transport parts (current track) --------------------------------------
  private melodyPart: Tone.Part | null = null;
  private harmonyPart: Tone.Part | null = null;
  private bassPart: Tone.Part | null = null;
  private percussionPart: Tone.Part | null = null;

  // -- State ----------------------------------------------------------------
  private _initialized = false;
  private _muted = false;
  private _musicVolume = 1; // 0-1 linear
  private _sfxVolume = 1;   // 0-1 linear
  private currentTrackKey: string | null = null;
  private crossfading = false;

  // =========================================================================
  // Constructor (private — use singleton)
  // =========================================================================

  private constructor() {
    // Nothing to do here; real setup happens in init().
  }

  /** Access or create the singleton AudioManager. */
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // =========================================================================
  // Initialisation
  // =========================================================================

  /**
   * Create all synths, routing, and prepare for playback.
   * Safe to call multiple times — subsequent calls are no-ops.
   */
  async init(): Promise<void> {
    if (this._initialized) return;

    try {
      // -- Master output channel --
      this.masterChannel = new Tone.Channel({ volume: 0 }).toDestination();

      // -- Music gain (sits between synths and master) --
      this.musicGain = new Tone.Gain(this._musicVolume).connect(this.masterChannel);

      // -- SFX gain (sits between one-shot synths and master) --
      this.sfxGain = new Tone.Gain(this._sfxVolume).connect(this.masterChannel);

      // -- Channel 1: Square wave melody --
      this.square1 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.4,
          release: 0.1,
        },
        volume: -8,
      }).connect(this.musicGain);

      // -- Channel 2: Square wave harmony --
      this.square2 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 0.1,
        },
        volume: -10,
      }).connect(this.musicGain);

      // -- Channel 3: Triangle wave bass --
      this.triangle = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.6,
          release: 0.15,
        },
        volume: -6,
      }).connect(this.musicGain);

      // -- Channel 4: Noise percussion --
      this.noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0,
          release: 0.05,
        },
        volume: -12,
      }).connect(this.musicGain);

      this._initialized = true;
      console.log('[AudioManager] Initialised — 4-channel NES synthesis ready.');
    } catch (err) {
      console.error('[AudioManager] Failed to initialise Tone.js synths:', err);
    }
  }

  /**
   * Resume the underlying Web Audio context.
   * Must be called from a user-gesture handler (click / keydown) on browsers
   * that enforce autoplay restrictions.
   */
  async resumeAudio(): Promise<void> {
    try {
      await Tone.start();
      console.log('[AudioManager] AudioContext resumed.');
    } catch (err) {
      console.error('[AudioManager] Failed to resume AudioContext:', err);
    }
  }

  // =========================================================================
  // Music playback
  // =========================================================================

  /**
   * Play a music track by key. If a track is already playing a crossfade
   * transition is performed over `fadeMs` milliseconds.
   *
   * @param trackKey - One of the supported TrackKey values.
   * @param fadeMs   - Crossfade duration in ms (default 1000).
   */
  playMusic(trackKey: string, fadeMs: number = DEFAULT_CROSSFADE_MS): void {
    if (!this._initialized) {
      console.warn('[AudioManager] Not initialised — call init() first.');
      return;
    }

    // Avoid restarting the same track.
    if (this.currentTrackKey === trackKey) return;

    const trackData = (MUSIC_DATA as Record<string, TrackData>)[trackKey];
    if (!trackData) {
      console.warn(`[AudioManager] Unknown track key: "${trackKey}"`);
      return;
    }

    // If something is already playing, crossfade.
    if (this.currentTrackKey !== null && this.musicGain) {
      this.crossfadeToTrack(trackKey, trackData, fadeMs);
      return;
    }

    // Nothing playing — start immediately.
    this.startTrack(trackKey, trackData);
  }

  /**
   * Stop the currently playing music with an optional fade-out.
   *
   * @param fadeOutMs - Fade-out time in ms. Pass 0 for immediate stop.
   */
  stopMusic(fadeOutMs: number = DEFAULT_CROSSFADE_MS): void {
    if (!this.musicGain) return;

    const transport = Tone.getTransport();

    if (fadeOutMs > 0) {
      const fadeOutSec = fadeOutMs / 1000;
      this.musicGain.gain.linearRampTo(0, fadeOutSec);

      // After fade completes, clean up.
      setTimeout(() => {
        this.disposeCurrentParts();
        transport.stop();
        transport.cancel();
        // Restore gain for next playback.
        if (this.musicGain) {
          this.musicGain.gain.value = this._musicVolume;
        }
        this.currentTrackKey = null;
      }, fadeOutMs + 50);
    } else {
      this.disposeCurrentParts();
      transport.stop();
      transport.cancel();
      this.currentTrackKey = null;
    }
  }

  /**
   * Set the music volume.
   * @param vol - Linear volume 0-1.
   */
  setMusicVolume(vol: number): void {
    this._musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain) {
      this.musicGain.gain.value = this._musicVolume;
    }
  }

  // =========================================================================
  // SFX playback
  // =========================================================================

  /**
   * Play a named sound effect. The sound is procedurally generated from the
   * corresponding SFXConfig and auto-disposes after playback.
   *
   * @param name - One of the supported SFXName values.
   */
  playSFX(name: string): void {
    if (!this._initialized || !this.sfxGain) {
      return;
    }

    const config = (SFX_DATA as Record<string, SFXConfig>)[name];
    if (!config) {
      console.warn(`[AudioManager] Unknown SFX name: "${name}"`);
      return;
    }

    try {
      if (config.type === 'noise') {
        this.playNoiseSFX(config);
      } else {
        this.playToneSFX(config);
      }
    } catch (err) {
      console.error(`[AudioManager] Error playing SFX "${name}":`, err);
    }
  }

  /**
   * Set the SFX volume.
   * @param vol - Linear volume 0-1.
   */
  setSFXVolume(vol: number): void {
    this._sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this._sfxVolume;
    }
  }

  // =========================================================================
  // State
  // =========================================================================

  /** Whether the AudioContext has been started and synths are ready. */
  get isStarted(): boolean {
    return this._initialized && Tone.getContext().state === 'running';
  }

  /**
   * Toggle the global mute state.
   * @returns The new muted state (`true` = muted).
   */
  toggleMute(): boolean {
    this._muted = !this._muted;

    if (this.masterChannel) {
      this.masterChannel.mute = this._muted;
    }

    return this._muted;
  }

  /**
   * Tear down all synths, parts, and routing.
   * Call when the game is being fully unloaded.
   */
  destroy(): void {
    this.stopMusic(0);

    this.square1?.dispose();
    this.square2?.dispose();
    this.triangle?.dispose();
    this.noise?.dispose();
    this.musicGain?.dispose();
    this.sfxGain?.dispose();
    this.masterChannel?.dispose();

    this.square1 = null;
    this.square2 = null;
    this.triangle = null;
    this.noise = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterChannel = null;

    this._initialized = false;
    this.currentTrackKey = null;

    console.log('[AudioManager] Destroyed.');
  }

  // =========================================================================
  // Private — track lifecycle
  // =========================================================================

  /**
   * Start a track from scratch (no crossfade).
   */
  private startTrack(key: string, data: TrackData): void {
    const transport = Tone.getTransport();

    // Configure transport tempo and time signature.
    transport.bpm.value = data.bpm;
    transport.timeSignature = data.timeSignature;

    // Set up looping on the transport itself.
    transport.loop = data.loop;
    if (data.loop) {
      transport.loopStart = '0:0:0';
      transport.loopEnd = data.loopEnd;
    }

    // Build Tone.Parts for each channel.
    this.createParts(data);

    // Reset transport position and start.
    transport.position = '0:0:0';
    transport.start();

    this.currentTrackKey = key;
  }

  /**
   * Crossfade from the current track to a new one.
   */
  private crossfadeToTrack(
    newKey: string,
    newData: TrackData,
    fadeMs: number,
  ): void {
    if (this.crossfading || !this.musicGain) return;
    this.crossfading = true;

    const fadeTimeSec = fadeMs / 1000;
    const transport = Tone.getTransport();

    // Fade out the current music gain.
    this.musicGain.gain.linearRampTo(0, fadeTimeSec);

    setTimeout(() => {
      // Stop and clean up the old track.
      transport.stop();
      transport.cancel();
      this.disposeCurrentParts();

      // Restore gain before starting the new track.
      if (this.musicGain) {
        this.musicGain.gain.value = 0;
      }

      // Start the new track.
      this.startTrack(newKey, newData);

      // Fade in the new track.
      if (this.musicGain) {
        this.musicGain.gain.linearRampTo(this._musicVolume, fadeTimeSec);
      }

      this.crossfading = false;
    }, fadeMs + 50); // slight buffer to ensure fade completes
  }

  /**
   * Create Tone.Part instances for each channel from track data.
   */
  private createParts(data: TrackData): void {
    // -- Melody → square1 --
    if (data.melody.length > 0 && this.square1) {
      this.melodyPart = new Tone.Part<NoteEvent>((time, event) => {
        this.square1?.triggerAttackRelease(
          event.note,
          event.duration,
          time,
          event.velocity ?? DEFAULT_VELOCITY,
        );
      }, data.melody);
      this.melodyPart.start(0);
    }

    // -- Harmony → square2 --
    if (data.harmony.length > 0 && this.square2) {
      this.harmonyPart = new Tone.Part<NoteEvent>((time, event) => {
        this.square2?.triggerAttackRelease(
          event.note,
          event.duration,
          time,
          event.velocity ?? DEFAULT_VELOCITY,
        );
      }, data.harmony);
      this.harmonyPart.start(0);
    }

    // -- Bass → triangle --
    if (data.bass.length > 0 && this.triangle) {
      this.bassPart = new Tone.Part<NoteEvent>((time, event) => {
        this.triangle?.triggerAttackRelease(
          event.note,
          event.duration,
          time,
          event.velocity ?? DEFAULT_VELOCITY,
        );
      }, data.bass);
      this.bassPart.start(0);
    }

    // -- Percussion → noise (note field ignored, only time/duration) --
    if (data.percussion.length > 0 && this.noise) {
      this.percussionPart = new Tone.Part<NoteEvent>((time, event) => {
        this.noise?.triggerAttackRelease(
          event.duration,
          time,
          event.velocity ?? DEFAULT_VELOCITY,
        );
      }, data.percussion);
      this.percussionPart.start(0);
    }
  }

  /**
   * Dispose all current Tone.Part instances and null them out.
   */
  private disposeCurrentParts(): void {
    if (this.melodyPart) {
      this.melodyPart.dispose();
      this.melodyPart = null;
    }
    if (this.harmonyPart) {
      this.harmonyPart.dispose();
      this.harmonyPart = null;
    }
    if (this.bassPart) {
      this.bassPart.dispose();
      this.bassPart = null;
    }
    if (this.percussionPart) {
      this.percussionPart.dispose();
      this.percussionPart = null;
    }
  }

  // =========================================================================
  // Private — SFX one-shots
  // =========================================================================

  /**
   * Play a tone-based (pitched) SFX and auto-dispose the synth afterward.
   */
  private playToneSFX(config: SFXConfig): void {
    if (!this.sfxGain) return;

    const oscType = config.oscillator ?? 'square';
    const volumeDb = config.volume ?? DEFAULT_SFX_VOLUME_DB;
    const freq = config.frequency ?? 440;
    const envParams = config.envelope ?? {
      attack: 0.005,
      decay: 0.05,
      sustain: 0.1,
      release: 0.05,
    };

    const synth = new Tone.Synth({
      oscillator: { type: oscType },
      envelope: envParams,
      volume: volumeDb,
    }).connect(this.sfxGain);

    // If there is a frequency sweep, schedule a ramp.
    if (config.frequencyEnd !== undefined && config.frequencyEnd !== freq) {
      synth.frequency.value = freq;
      synth.triggerAttack(freq, Tone.now());
      synth.frequency.linearRampTo(config.frequencyEnd, config.duration);
      synth.triggerRelease(Tone.now() + config.duration);
    } else {
      synth.triggerAttackRelease(freq, config.duration);
    }

    // Auto-dispose after the sound has finished (with some release headroom).
    const disposalDelay = (config.duration + (envParams.release ?? 0.1) + 0.1) * 1000;
    setTimeout(() => {
      try {
        synth.dispose();
      } catch {
        // Synth may already be disposed if AudioContext was closed.
      }
    }, disposalDelay);
  }

  /**
   * Play a noise-based (unpitched) SFX and auto-dispose after playback.
   */
  private playNoiseSFX(config: SFXConfig): void {
    if (!this.sfxGain) return;

    const volumeDb = config.volume ?? DEFAULT_SFX_VOLUME_DB;
    const envParams = config.envelope ?? {
      attack: 0.001,
      decay: config.duration,
      sustain: 0,
      release: 0.01,
    };

    const noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: envParams,
      volume: volumeDb,
    }).connect(this.sfxGain);

    noiseSynth.triggerAttackRelease(config.duration);

    // Auto-dispose after playback.
    const disposalDelay = (config.duration + (envParams.release ?? 0.01) + 0.1) * 1000;
    setTimeout(() => {
      try {
        noiseSynth.dispose();
      } catch {
        // Safe to ignore — may already be disposed.
      }
    }, disposalDelay);
  }
}
