/**
 * Web Audio API Sound System
 * Synthesizes tactile potato chip crunches, clicks, swooshes, and ambient sound
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
  }

  toggle() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playCrunch(1.0);
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
    return this.enabled;
  }

  /**
   * Generates a multi-stage crunchy bite sound
   */
  playCrunch(intensity = 1.0) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Multi-fracture clicks + white noise burst
    const numFractures = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numFractures; i++) {
      const delay = t + (i * 0.02) + Math.random() * 0.015;
      this.triggerFracture(delay, intensity * (1 - i * 0.12));
    }

    // Low resonant thump of the crunch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    gain.gain.setValueAtTime(0.3 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  triggerFracture(time, volume) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800 + Math.random() * 2400, time);
    filter.Q.setValueAtTime(3.0, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.045);
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  playWhoosh() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.25;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1600, t + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(200, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.15, t + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + dur);
  }

  startAmbient() {
    if (!this.ctx || this.ambientGain) return;
    const t = this.ctx.currentTime;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, t);
    this.ambientGain.gain.linearRampToValueAtTime(0.03, t + 1.5);

    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc1.type = 'sine';
    this.ambientOsc1.frequency.setValueAtTime(130.81, t); // C3

    this.ambientOsc2 = this.ctx.createOscillator();
    this.ambientOsc2.type = 'triangle';
    this.ambientOsc2.frequency.setValueAtTime(196.00, t); // G3

    this.ambientOsc1.connect(this.ambientGain);
    this.ambientOsc2.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    this.ambientOsc1.start();
    this.ambientOsc2.start();
  }

  stopAmbient() {
    if (!this.ambientGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.ambientGain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
    setTimeout(() => {
      if (this.ambientOsc1) {
        this.ambientOsc1.stop();
        this.ambientOsc2.stop();
        this.ambientOsc1 = null;
        this.ambientOsc2 = null;
        this.ambientGain = null;
      }
    }, 600);
  }
}

export const audio = new AudioManager();

