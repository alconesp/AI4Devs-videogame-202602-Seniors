import { getAudioSettingsFromRegistry } from './audioSettings.js';

const MUSIC_SEQUENCE = Object.freeze([
  { lead: 659.25, harmony: 523.25, bass: 164.81, accent: true },
  { lead: 783.99, harmony: 587.33, bass: 196.0, accent: false },
  { lead: 880.0, harmony: 659.25, bass: 220.0, accent: true },
  { lead: 783.99, harmony: 587.33, bass: 196.0, accent: false },
  { lead: 659.25, harmony: 523.25, bass: 164.81, accent: true },
  { lead: 783.99, harmony: 622.25, bass: 196.0, accent: false },
  { lead: 987.77, harmony: 739.99, bass: 246.94, accent: true },
  { lead: 783.99, harmony: 587.33, bass: 196.0, accent: false },
  { lead: 698.46, harmony: 523.25, bass: 174.61, accent: true },
  { lead: 783.99, harmony: 587.33, bass: 196.0, accent: false },
  { lead: 880.0, harmony: 659.25, bass: 220.0, accent: true },
  { lead: 1046.5, harmony: 783.99, bass: 261.63, accent: false },
  { lead: 987.77, harmony: 739.99, bass: 246.94, accent: true },
  { lead: 880.0, harmony: 659.25, bass: 220.0, accent: false },
  { lead: 783.99, harmony: 622.25, bass: 196.0, accent: true },
  { lead: 659.25, harmony: 523.25, bass: 164.81, accent: false }
]);

const MUSIC_BASE_GAIN = 0.46;
const MUSIC_DUCK_RATIO = 0.58;
const MUSIC_STEP_DELAY = 168;
const MASTER_GAIN_MAX = 1;
const SFX_GAIN_BASE = 1.28;

export class GameAudioController {
  constructor(scene) {
    this.scene = scene;
    this.settings = getAudioSettingsFromRegistry(scene.registry);
    this.audioContext = null;
    this.ownsAudioContext = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicTimer = null;
    this.musicStepIndex = 0;
    this.noiseBuffer = null;
    this.isDestroyed = false;
  }

  updateSettings(settings) {
    this.settings = {
      ...this.settings,
      ...settings
    };

    if (!this.audioContext || !this.masterGain || !this.musicGain || !this.sfxGain) {
      return;
    }

    const now = this.audioContext.currentTime;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.settings.muted ? 0 : MASTER_GAIN_MAX, now);

    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.getTargetMusicGain(), now);

    this.sfxGain.gain.cancelScheduledValues(now);
    this.sfxGain.gain.setValueAtTime(this.getTargetSfxGain(), now);
  }

  startMusicLoop() {
    if (!this.ensureReady() || this.musicTimer) {
      return;
    }

    const now = this.audioContext.currentTime;

    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0.0001, now);
    this.musicGain.gain.linearRampToValueAtTime(this.getTargetMusicGain(), now + 0.18);

    this.applyMusicStep();

    this.musicTimer = this.scene.time.addEvent({
      delay: MUSIC_STEP_DELAY,
      loop: true,
      callback: () => {
        this.applyMusicStep();
      }
    });
  }

  playShot() {
    if (!this.ensureReady()) {
      return;
    }

    const context = this.audioContext;
    const now = context.currentTime;
    const tone = context.createOscillator();
    const toneGain = context.createGain();
    const toneFilter = context.createBiquadFilter();
    const noiseSource = this.createNoiseSource();
    const noiseGain = context.createGain();
    const noiseFilter = context.createBiquadFilter();

    tone.type = 'triangle';
    tone.frequency.setValueAtTime(188, now);
    tone.frequency.exponentialRampToValueAtTime(104, now + 0.09);
    toneGain.gain.setValueAtTime(0.0001, now);
    toneGain.gain.exponentialRampToValueAtTime(0.34, now + 0.01);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    toneFilter.type = 'lowpass';
    toneFilter.frequency.setValueAtTime(920, now);

    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.24, now + 0.004);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1080, now);
    noiseFilter.Q.setValueAtTime(0.85, now);

    tone.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(this.sfxGain);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    tone.start(now);
    tone.stop(now + 0.11);
    noiseSource.start(now);
    noiseSource.stop(now + 0.08);
  }

  playImpact() {
    if (!this.ensureReady()) {
      return;
    }

    this.duckMusic();

    const context = this.audioContext;
    const now = context.currentTime;
    const crackSource = this.createNoiseSource();
    const crackGain = context.createGain();
    const crackFilter = context.createBiquadFilter();
    const shardFrequencies = [620, 940, 1420];

    crackGain.gain.setValueAtTime(0.0001, now);
    crackGain.gain.exponentialRampToValueAtTime(0.22, now + 0.003);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    crackFilter.type = 'highpass';
    crackFilter.frequency.setValueAtTime(820, now);
    crackFilter.Q.setValueAtTime(0.7, now);

    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.sfxGain);

    crackSource.start(now);
    crackSource.stop(now + 0.24);

    shardFrequencies.forEach((frequency, index) => {
      const shardOscillator = context.createOscillator();
      const shardGain = context.createGain();
      const startTime = now + (index * 0.012);

      shardOscillator.type = 'triangle';
      shardOscillator.frequency.setValueAtTime(frequency, startTime);
      shardOscillator.frequency.exponentialRampToValueAtTime(Math.max(180, frequency * 0.42), startTime + 0.16);

      shardGain.gain.setValueAtTime(0.0001, startTime);
      shardGain.gain.exponentialRampToValueAtTime(0.085, startTime + 0.006);
      shardGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.17);

      shardOscillator.connect(shardGain);
      shardGain.connect(this.sfxGain);
      shardOscillator.start(startTime);
      shardOscillator.stop(startTime + 0.19);
    });
  }

  playMiss() {
    if (!this.ensureReady()) {
      return;
    }

    const context = this.audioContext;
    const now = context.currentTime;
    const buzzOscillator = context.createOscillator();
    const buzzGain = context.createGain();
    const buzzFilter = context.createBiquadFilter();

    buzzOscillator.type = 'sawtooth';
    buzzOscillator.frequency.setValueAtTime(146, now);
    buzzOscillator.frequency.exponentialRampToValueAtTime(78, now + 0.22);

    buzzFilter.type = 'lowpass';
    buzzFilter.frequency.setValueAtTime(280, now);
    buzzFilter.Q.setValueAtTime(0.6, now);

    buzzGain.gain.setValueAtTime(0.0001, now);
    buzzGain.gain.exponentialRampToValueAtTime(0.085, now + 0.02);
    buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

    buzzOscillator.connect(buzzFilter);
    buzzFilter.connect(buzzGain);
    buzzGain.connect(this.sfxGain);

    buzzOscillator.start(now);
    buzzOscillator.stop(now + 0.28);
  }

  destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    if (this.musicTimer) {
      this.musicTimer.remove(false);
      this.musicTimer = null;
    }

    this.disconnectNode(this.musicGain);
    this.disconnectNode(this.sfxGain);
    this.disconnectNode(this.masterGain);

    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.noiseBuffer = null;

    if (this.ownsAudioContext && this.audioContext) {
      this.audioContext.close().catch(() => {});
    }

    this.audioContext = null;
  }

  applyMusicStep() {
    if (!this.audioContext || !this.musicGain || this.settings.muted) {
      return;
    }

    const step = MUSIC_SEQUENCE[this.musicStepIndex];
    const now = this.audioContext.currentTime;

    this.playMusicVoice(step.lead, {
      type: 'square',
      startTime: now,
      duration: step.accent ? 0.14 : 0.12,
      attack: 0.006,
      gain: 0.13,
      endFrequency: step.lead * 0.995
    });

    this.playMusicVoice(step.harmony, {
      type: 'square',
      startTime: now + 0.01,
      duration: 0.11,
      attack: 0.005,
      gain: 0.07,
      filterType: 'lowpass',
      filterFrequency: 1500,
      endFrequency: step.harmony * 0.998
    });

    this.playMusicVoice(step.bass, {
      type: 'triangle',
      startTime: now,
      duration: 0.16,
      attack: 0.008,
      gain: 0.11,
      filterType: 'lowpass',
      filterFrequency: 760,
      endFrequency: step.bass * 0.99
    });

    if (step.accent) {
      this.playMusicVoice(step.lead * 2, {
        type: 'square',
        startTime: now + 0.02,
        duration: 0.045,
        attack: 0.003,
        gain: 0.028,
        filterType: 'bandpass',
        filterFrequency: 2100,
        endFrequency: step.lead * 1.9
      });
    }

    this.musicStepIndex = (this.musicStepIndex + 1) % MUSIC_SEQUENCE.length;
  }

  duckMusic() {
    if (!this.musicGain || !this.audioContext) {
      return;
    }

    const now = this.audioContext.currentTime;
    const musicGain = this.getTargetMusicGain();

    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(Math.max(0.0001, musicGain * MUSIC_DUCK_RATIO), now + 0.025);
    this.musicGain.gain.linearRampToValueAtTime(musicGain, now + 0.24);
  }

  ensureReady() {
    if (this.isDestroyed || !this.ensureAudioGraph()) {
      return false;
    }

    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    return this.audioContext !== null;
  }

  ensureAudioGraph() {
    if (this.audioContext && this.masterGain && this.musicGain && this.sfxGain) {
      return true;
    }

    const phaserContext = this.scene.sound?.context;

    if (phaserContext) {
      this.audioContext = phaserContext;
      this.ownsAudioContext = false;
    } else {
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;

      if (!AudioContextClass) {
        return false;
      }

      this.audioContext = new AudioContextClass();
      this.ownsAudioContext = true;
    }

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.setValueAtTime(this.settings.muted ? 0 : MASTER_GAIN_MAX, this.audioContext.currentTime);
    this.masterGain.connect(this.audioContext.destination);

    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.setValueAtTime(this.getTargetMusicGain(), this.audioContext.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.gain.setValueAtTime(this.getTargetSfxGain(), this.audioContext.currentTime);
    this.sfxGain.connect(this.masterGain);

    return true;
  }

  createNoiseSource() {
    const context = this.audioContext;
    const source = context.createBufferSource();
    source.buffer = this.getNoiseBuffer();
    return source;
  }

  getNoiseBuffer() {
    if (this.noiseBuffer || !this.audioContext) {
      return this.noiseBuffer;
    }

    const sampleRate = this.audioContext.sampleRate;
    const frameCount = Math.max(1, Math.floor(sampleRate * 0.35));
    this.noiseBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channel = this.noiseBuffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      channel[index] = (Math.random() * 2) - 1;
    }

    return this.noiseBuffer;
  }

  disconnectNode(node) {
    if (!node) {
      return;
    }

    try {
      node.disconnect();
    } catch {
      // Ignore nodes already disconnected.
    }
  }

  getTargetMusicGain() {
    return Math.max(0.0001, MUSIC_BASE_GAIN * this.settings.musicVolume);
  }

  getTargetSfxGain() {
    return Math.max(0.0001, SFX_GAIN_BASE * this.settings.sfxVolume);
  }

  playMusicVoice(frequency, options) {
    if (!this.audioContext || !this.musicGain || !frequency) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const startTime = options.startTime;
    const duration = options.duration;
    const peakGain = options.gain;
    const attack = options.attack ?? 0.006;
    const endFrequency = options.endFrequency ?? frequency;

    oscillator.type = options.type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), startTime + duration);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    if (options.filterType) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = options.filterType;
      filter.frequency.setValueAtTime(options.filterFrequency ?? 1200, startTime);
      oscillator.connect(filter);
      filter.connect(gainNode);
    } else {
      oscillator.connect(gainNode);
    }

    gainNode.connect(this.musicGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }
}
