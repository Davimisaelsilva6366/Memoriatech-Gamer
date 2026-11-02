/**
 * Futuristic Web Audio Synthesizer for Memóriatech Gamer
 * Generates custom cyber sounds without external audio assets
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Subtle futuristic cyber click
   */
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Gamer Mode Activation Power-Up sound
   */
  public playGamerBoost() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Sub oscillator for bass punch
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(120, now);
      sub.frequency.exponentialRampToValueAtTime(40, now + 0.4);
      subGain.gain.setValueAtTime(0.18, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.45);

      // Sci-fi rising chirp
      const chirp = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      chirp.type = 'sawtooth';
      chirp.frequency.setValueAtTime(280, now + 0.05);
      chirp.frequency.exponentialRampToValueAtTime(1600, now + 0.35);
      chirpGain.gain.setValueAtTime(0.001, now);
      chirpGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      chirp.connect(chirpGain);
      chirpGain.connect(ctx.destination);
      chirp.start(now + 0.05);
      chirp.stop(now + 0.45);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Smart Cleaner completion swoosh
   */
  public playCleanComplete() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(1560, now + 0.28);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Diagnostic Radar ping
   */
  public playRadarPing() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio fallback silent
    }
  }
}

export const soundFx = new SoundController();
